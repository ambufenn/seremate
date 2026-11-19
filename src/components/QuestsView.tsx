import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  MessageCircleHeart,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { HEALTH_QUESTS } from '../data/quests';
import type { HealthQuest, UserProgress } from '../types/reproguard';
import { LumiCharacter } from './LumiCharacter';

interface QuestsViewProps {
  progress: UserProgress;
  activeQuestId: string | null;
  onSelectQuest: (questId: string | null) => void;
  onCompleteQuest: (quest: HealthQuest) => void;
  onOpenScenario: (scenarioId: string) => void;
  onAskLumi: (prefill?: string) => void;
}

export function QuestsView({
  progress,
  activeQuestId,
  onSelectQuest,
  onCompleteQuest,
  onOpenScenario,
  onAskLumi,
}: QuestsViewProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [questFinished, setQuestFinished] = useState(false);

  const activeQuest = HEALTH_QUESTS.find((q) => q.id === activeQuestId) || null;

  const openQuest = (questId: string) => {
    setStepIndex(0);
    setSelectedOptionId(null);
    setQuestFinished(false);
    onSelectQuest(questId);
  };

  if (activeQuest) {
    const isCheckStep = stepIndex >= activeQuest.steps.length;
    const currentStep = activeQuest.steps[Math.min(stepIndex, activeQuest.steps.length - 1)];
    const chosenOption = activeQuest.checkQuestion.options.find(
      (o) => o.id === selectedOptionId
    );
    const alreadyDone = progress.completedQuestIds.includes(activeQuest.id);

    const handleFinish = () => {
      onCompleteQuest(activeQuest);
      setQuestFinished(true);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onSelectQuest(null)}
            className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#241F1B] hover:bg-[#F3ECE0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all quests</span>
          </button>
          <span className="text-xs font-medium text-[#655B52] tabular-nums">
            Stage {String(activeQuest.stageNumber).padStart(2, '0')} ·{' '}
            {questFinished
              ? 'Complete'
              : `Card ${Math.min(stepIndex + 1, activeQuest.steps.length + 1)} of ${
                  activeQuest.steps.length + 1
                }`}
          </span>
        </div>

        <motion.div
          key={`${activeQuest.id}-${stepIndex}-${questFinished}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8"
        >
          {questFinished ? (
            <div className="text-center py-4 space-y-5">
              <div className="flex justify-center">
                <LumiCharacter mood="celebrating" size="lg" />
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <p className="text-xs font-semibold text-[#44835E]">
                  Quest Complete · +{activeQuest.xpReward} XP
                </p>
                <h2 className="font-display text-3xl font-semibold text-[#241F1B]">
                  Nice work exploring {activeQuest.title}
                </h2>
                <p className="text-[15px] text-[#655B52] leading-relaxed">
                  Every question you explore builds confidence and real health knowledge. Remember, you can revisit these facts anytime.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {activeQuest.linkedScenarioId && (
                  <button
                    type="button"
                    onClick={() => onOpenScenario(activeQuest.linkedScenarioId!)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C5CE0] hover:bg-[#6646CA] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Play Related Story</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    onAskLumi(`I just finished the ${activeQuest.title} quest and have a question.`)
                  }
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFF0E5] hover:bg-[#FFE3D0] text-[#B8470F] text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>Ask Lumi a Follow-Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectQuest(null)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#241F1B] hover:bg-[#3A322B] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Return to Quests</span>
                </button>
              </div>
            </div>
          ) : !isCheckStep ? (
            <div className="space-y-6">
              {/* Progress segments */}
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-colors ${
                      idx <= stepIndex ? 'bg-[#EA6A27]' : 'bg-[#F3ECE0]'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#EA6A27]">{activeQuest.title}</p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#241F1B]">
                  {currentStep.title}
                </h2>
                <p className="text-[16px] leading-[1.7] text-[#3F3730]">
                  {currentStep.body}
                </p>
              </div>

              {/* Gentle key takeaway surface (no thick left border) */}
              <div className="bg-[#FAF5ED] border border-[#241F1B]/8 rounded-2xl p-4 flex items-start gap-3">
                <LumiCharacter mood="calm" size="sm" className="shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#655B52]">Lumi’s Key Takeaway</p>
                  <p className="text-sm font-medium text-[#241F1B] mt-0.5 leading-relaxed">
                    {currentStep.keyTakeaway}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={stepIndex === 0}
                  onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[#655B52] hover:bg-[#F3ECE0] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => prev + 1)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>{stepIndex === activeQuest.steps.length - 1 ? 'Quick Check' : 'Next Card'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="h-1.5 rounded-full bg-[#EA6A27]" />
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#5A3EC2]">
                  Quick Reflection Check · Optional
                </p>
                <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                  {activeQuest.checkQuestion.question}
                </h2>
              </div>

              <div className="space-y-3">
                {activeQuest.checkQuestion.options.map((opt) => {
                  const isPicked = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`w-full text-left p-4 rounded-2xl border text-[15px] font-medium transition-colors duration-150 ${
                        isPicked
                          ? opt.isCorrect
                            ? 'bg-[#E5F2E9] border-[#44835E] text-[#1E3B2A]'
                            : 'bg-[#FFF0E5] border-[#EA6A27] text-[#4B210B]'
                          : 'bg-[#FAF5ED] border-[#241F1B]/10 text-[#241F1B] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {chosenOption && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 border text-sm leading-relaxed ${
                    chosenOption.isCorrect
                      ? 'bg-[#E5F2E9] border-[#44835E]/25 text-[#1E3B2A]'
                      : 'bg-[#FFF0E5] border-[#EA6A27]/25 text-[#4B210B]'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {chosenOption.isCorrect ? 'Fact Verified' : 'Good to Know'}
                  </p>
                  <p>{chosenOption.feedback}</p>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleFinish}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#655B52] hover:bg-[#F3ECE0] transition-colors"
                >
                  Skip question & finish
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#44835E] hover:bg-[#356B4B] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{alreadyDone ? 'Finish Replay' : `Complete Quest (+${activeQuest.xpReward} XP)`}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#EA6A27]">
            7 Health Quests · {progress.completedQuestIds.length}/{HEALTH_QUESTS.length} Completed
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
            Learn at your own pace
          </h1>
          <p className="text-[15px] text-[#655B52] mt-2 max-w-2xl leading-relaxed">
            Bite-sized, evidence-based modules covering body changes, relationships, consent, periods, pregnancy facts, and digital safety.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#655B52] shrink-0">
          <Compass className="w-4 h-4 text-[#EA6A27]" />
          <span>Every topic is always unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HEALTH_QUESTS.map((quest) => {
          const isCompleted = progress.completedQuestIds.includes(quest.id);
          const surfaceStyles =
            quest.tone === 'tangerine'
              ? 'bg-[#FFF0E5]/70 border-[#EA6A27]/18 hover:border-[#EA6A27]/40'
              : quest.tone === 'lavender'
              ? 'bg-[#EFEAFE]/75 border-[#7C5CE0]/18 hover:border-[#7C5CE0]/40'
              : 'bg-[#E5F2E9]/75 border-[#44835E]/18 hover:border-[#44835E]/40';

          return (
            <div
              key={quest.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-colors duration-150 ${surfaceStyles}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#655B52]">
                  <span className="tabular-nums">
                    Stage {String(quest.stageNumber).padStart(2, '0')} · {quest.durationLabel} ·{' '}
                    {quest.xpReward} XP
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#2E6243]">
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-3">
                  {quest.title}
                </h2>
                <p className="text-sm text-[#574E46] mt-2 leading-relaxed">
                  {quest.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#241F1B]/8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openQuest(quest.id)}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FDFBF7] hover:bg-white text-[#241F1B] text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#EA6A27]" />
                  <span>{isCompleted ? 'Revisit Quest' : 'Start Quest'}</span>
                </button>

                {quest.linkedScenarioId && (
                  <button
                    type="button"
                    onClick={() => onOpenScenario(quest.linkedScenarioId!)}
                    className="min-h-[44px] px-3 py-2 text-xs font-semibold text-[#5A3EC2] hover:underline whitespace-nowrap"
                  >
                    Play Story
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
