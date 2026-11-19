import { addDoc, collection, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, ClipboardCheck, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { AssessmentResultDoc, SereMateTab } from '../types/seremate';

interface AssessmentViewProps {
  uid: string;
  isDemoMode?: boolean;
  pastAssessments: AssessmentResultDoc[];
  onNavigate: (tab: SereMateTab) => void;
  onAskCompanion: (prompt: string) => void;
  onDemoSaveAssessment?: (item: AssessmentResultDoc) => void;
  onDemoDeleteAssessment?: (id: string) => void;
}

interface QuestionItem {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    category: string;
    weight: number; // 1=informational, 2=guided, 3=priority
    topic: string;
  }>;
}

const QUESTIONS: QuestionItem[] = [
  {
    id: 'q1-main-focus',
    prompt: 'What brings you here today?',
    options: [
      {
        id: 'puberty',
        label: 'Questions about body changes or puberty',
        category: 'Puberty & Growth',
        weight: 1,
        topic: 'Puberty & Growth',
      },
      {
        id: 'periods',
        label: 'Period timing, cramps, or menstrual symptoms',
        category: 'Menstrual Health',
        weight: 2,
        topic: 'Menstrual Health',
      },
      {
        id: 'pregnancy',
        label: 'Pregnancy worry, missed period, or testing questions',
        category: 'Pregnancy Awareness',
        weight: 2,
        topic: 'Pregnancy Awareness',
      },
      {
        id: 'relationships',
        label: 'Relationships, consent, or online boundary pressure',
        category: 'Healthy Relationships & Boundaries',
        weight: 2,
        topic: 'Healthy Relationships & Boundaries',
      },
    ],
  },
  {
    id: 'q2-physical',
    prompt: 'Are you noticing any physical discomfort right now?',
    options: [
      {
        id: 'none',
        label: 'No physical pain—mostly looking to learn',
        category: 'General Education',
        weight: 1,
        topic: 'Puberty & Growth',
      },
      {
        id: 'mild',
        label: 'Mild cramps or manageable changes',
        category: 'Menstrual Health',
        weight: 2,
        topic: 'Menstrual Health',
      },
      {
        id: 'severe',
        label: 'Strong pain, heavy bleeding, dizziness, or fever',
        category: 'When & Where to Get Help',
        weight: 3,
        topic: 'When & Where to Get Help',
      },
    ],
  },
  {
    id: 'q3-emotional',
    prompt: 'How are you feeling emotionally about this?',
    options: [
      {
        id: 'curious',
        label: 'Calm and curious',
        category: 'General Education',
        weight: 1,
        topic: 'Sexual & Reproductive Health',
      },
      {
        id: 'stressed',
        label: 'A bit nervous or unsure who to ask',
        category: 'Guided Support',
        weight: 2,
        topic: 'When & Where to Get Help',
      },
      {
        id: 'overwhelmed',
        label: 'Very overwhelmed, scared, or pressured by someone',
        category: 'Safety & Support',
        weight: 3,
        topic: 'Healthy Relationships & Boundaries',
      },
    ],
  },
  {
    id: 'q4-safety',
    prompt: 'Do you feel safe in your current home, school, or relationship environment?',
    options: [
      {
        id: 'safe',
        label: 'Yes, I feel safe',
        category: 'General Education',
        weight: 1,
        topic: 'Healthy Relationships & Boundaries',
      },
      {
        id: 'unsure',
        label: 'Somewhat unsure or worried about privacy',
        category: 'Guided Support',
        weight: 2,
        topic: 'When & Where to Get Help',
      },
      {
        id: 'unsafe',
        label: 'No, I feel pressured, threatened, or unsafe',
        category: 'Safety & Support',
        weight: 3,
        topic: 'When & Where to Get Help',
      },
    ],
  },
  {
    id: 'q5-next',
    prompt: 'What type of next step would feel most helpful?',
    options: [
      {
        id: 'read',
        label: 'Reading clear educational guides privately',
        category: 'General Education',
        weight: 1,
        topic: 'Puberty & Growth',
      },
      {
        id: 'chat',
        label: 'Asking follow-up questions with the AI Companion',
        category: 'Guided Support',
        weight: 2,
        topic: 'Pregnancy Awareness',
      },
      {
        id: 'clinic',
        label: 'Seeing how to contact a clinician or support line',
        category: 'When & Where to Get Help',
        weight: 3,
        topic: 'When & Where to Get Help',
      },
    ],
  },
];

export function AssessmentView({
  uid,
  isDemoMode = false,
  pastAssessments,
  onNavigate,
  onAskCompanion,
  onDemoSaveAssessment,
  onDemoDeleteAssessment,
}: AssessmentViewProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionItem['options'][number]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [completedResult, setCompletedResult] = useState<Omit<AssessmentResultDoc, 'id'> | null>(
    null
  );

  const currentQuestion = QUESTIONS[step];
  const progressPct = Math.round(((step + (completedResult ? 1 : 0)) / QUESTIONS.length) * 100);

  const handleSelectOption = async (option: QuestionItem['options'][number]) => {
    const nextAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(nextAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    // Compute guidance result
    const selectedList = Object.values(nextAnswers);
    const maxWeight = Math.max(...selectedList.map((o) => o.weight));
    const primaryTopic = nextAnswers['q1-main-focus']?.category || 'General Health Guidance';
    const topics = Array.from(new Set(selectedList.map((o) => o.topic))).slice(0, 6);

    let supportLevel: AssessmentResultDoc['supportLevel'] = 'informational';
    let summaryNote =
      'Based on your answers, exploring structured educational guides and asking follow-up questions with SereMate is a calm place to start.';

    if (maxWeight === 3) {
      supportLevel = 'priority_care';
      summaryNote =
        'Your responses note either strong physical symptoms, feeling unsafe, or urgent stress. We strongly recommend connecting with a qualified clinician, trusted adult, or support service rather than relying on digital guides alone.';
    } else if (maxWeight === 2) {
      supportLevel = 'guided_support';
      summaryNote =
        'You have specific health or boundary questions where clear information and optional confidential clinic guidance can give you clarity and peace of mind.';
    }

    const resultPayload: Omit<AssessmentResultDoc, 'id'> = {
      userId: uid,
      primaryCategory: primaryTopic,
      supportLevel,
      summaryNote,
      recommendedTopics: topics.length > 0 ? topics : ['When & Where to Get Help'],
    };

    setIsSaving(true);
    if (isDemoMode) {
      onDemoSaveAssessment?.({
        id: `demo-assess-${Date.now()}`,
        ...resultPayload,
      });
      setCompletedResult(resultPayload);
      setIsSaving(false);
      return;
    }

    const path = `users/${uid}/assessments`;
    try {
      await addDoc(collection(db, path), {
        ...resultPayload,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'usage_events'), {
        eventType: 'assessment_completed',
        topicCategory: primaryTopic.slice(0, 80),
        safetyTriggered: supportLevel === 'priority_care',
        createdAt: serverTimestamp(),
      }).catch(() => {});
      setCompletedResult(resultPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setCompletedResult(null);
  };

  const handleDeleteAssessment = async (id: string) => {
    if (isDemoMode) {
      onDemoDeleteAssessment?.(id);
      return;
    }
    const path = `users/${uid}/assessments/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#B44A14]">
          Gentle Needs Check-In · For Guidance Only
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
          Organize your questions and support needs
        </h1>
        <p className="text-sm text-[#5F554D] mt-2 leading-relaxed max-w-2xl">
          This quick check-in helps match you to comforting guides and care options. It is never a medical diagnosis.
        </p>
      </div>

      <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#5F554D] tabular-nums">
            <span>
              {completedResult
                ? 'Check-In Complete'
                : `Question ${step + 1} of ${QUESTIONS.length}`}
            </span>
            <span>{completedResult ? '100%' : `${progressPct}%`}</span>
          </div>
          <div className="h-2.5 rounded-full bg-[#F3ECE1] overflow-hidden">
            <div
              className="h-full bg-[#EA6A27] rounded-full transition-all duration-200"
              style={{ width: `${completedResult ? 100 : Math.max(15, progressPct)}%` }}
            />
          </div>
        </div>

        {completedResult ? (
          <div className="space-y-6">
            <div
              className={`rounded-2xl border p-5 space-y-2 ${
                completedResult.supportLevel === 'priority_care'
                  ? 'bg-[#FFF0E5] border-[#EA6A27]/30 text-[#7A2D15]'
                  : 'bg-[#E5F2E9] border-[#44835E]/25 text-[#204531]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Support Category:{' '}
                  {completedResult.supportLevel === 'priority_care'
                    ? 'Priority Care & Human Support Recommended'
                    : completedResult.supportLevel === 'guided_support'
                    ? 'Guided Support & Resources'
                    : 'Informational Guidance'}
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                Focus Area: {completedResult.primaryCategory}
              </h2>
              <p className="text-sm leading-relaxed">{completedResult.summaryNote}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#5F554D]">
                Suggested Educational Areas:
              </p>
              <p className="text-sm font-medium text-[#241F1B]">
                {completedResult.recommendedTopics.join(' · ')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('support')}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#44835E] hover:bg-[#356B4B] text-white text-sm font-semibold transition-colors"
              >
                <span>Find Support & Clinics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskCompanion(
                    `I just completed my self-assessment focusing on ${completedResult.primaryCategory}. Can you guide me through helpful next steps?`
                  )
                }
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold transition-colors"
              >
                <span>Talk With Sere</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('guidance')}
                className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#EFEAFE] hover:bg-[#E4DCFD] text-sm font-semibold text-[#3C2885]"
              >
                Browse Guides
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5F554D] hover:text-[#241F1B]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
              {currentQuestion.prompt}
            </h2>
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleSelectOption(opt)}
                  className="w-full text-left p-4 rounded-2xl bg-[#FAF5EE] hover:bg-[#FFF0E5] border border-[#241F1B]/10 hover:border-[#EA6A27]/35 text-sm sm:text-[15px] font-medium text-[#241F1B] flex items-center justify-between gap-4 transition-colors disabled:opacity-50"
                >
                  <span>{opt.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#8C8074] shrink-0" />
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="text-xs font-semibold text-[#5F554D] hover:text-[#241F1B] pt-1"
              >
                Previous question
              </button>
            )}
          </div>
        )}
      </section>

      {/* Saved Private Assessments */}
      {pastAssessments.length > 0 && (
        <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#44835E]" />
            <h2 className="font-display text-xl font-semibold text-[#241F1B]">
              Your Saved Check-Ins
            </h2>
          </div>
          <div className="divide-y divide-[#241F1B]/8">
            {pastAssessments.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[#241F1B]">
                    {item.primaryCategory} ·{' '}
                    <span className="font-normal text-[#5F554D]">
                      {item.supportLevel.replace('_', ' ')}
                    </span>
                  </p>
                  <p className="text-xs text-[#5F554D] leading-relaxed">{item.summaryNote}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteAssessment(item.id)}
                  aria-label="Delete assessment record"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-[#8C8074] hover:text-[#EA6A27]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
