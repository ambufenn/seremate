import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  MessageCircleHeart,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUiStrings, type AppLanguage } from '../i18n/languages';
import type { SereMateTab } from '../types/seremate';
import { SereMascot } from './SereMascot';

interface PregnancyCareViewProps {
  uid: string;
  language: AppLanguage;
  onNavigate: (tab: SereMateTab) => void;
  onAskCompanion: (prompt: string) => void;
}

type PregnancyPath = 'unsure' | 'pregnant' | 'supporting';

const HEALTHY_HABITS = [
  {
    id: 'water',
    title: 'Stay Gently Hydrated',
    detail: 'Sip 6–8 glasses of clean water throughout the day to help energy, digestion, and circulation.',
  },
  {
    id: 'nutrition',
    title: 'Nourish With Folate & Iron',
    detail: 'Include leafy greens, beans, lentils, eggs, oranges, or fortified grains when you can.',
  },
  {
    id: 'prenatal',
    title: 'Ask a Clinician About Prenatal Vitamins',
    detail: 'Folic acid (400 mcg) supports healthy growth early on—check with a doctor or youth clinic nurse.',
  },
  {
    id: 'rest',
    title: 'Rest & Protect Your Calm',
    detail: 'Growing and processing big feelings takes real energy. Prioritize sleep and gentle breaks.',
  },
  {
    id: 'avoid-harmful',
    title: 'Avoid Alcohol, Vaping, Smoke & Unverified Pills',
    detail: 'Skip alcohol, nicotine/vaping, recreational drugs, and any unverified online or herbal remedies.',
  },
  {
    id: 'clinic-visit',
    title: 'Connect With Youth-Friendly Healthcare',
    detail: 'A confidential clinic nurse or doctor can confirm timing, answer private questions, and keep you safe.',
  },
];

export function PregnancyCareView({
  uid,
  language,
  onNavigate,
  onAskCompanion,
}: PregnancyCareViewProps) {
  const ui = getUiStrings(language);
  const storageKey = `seremate_pregnancy_care_${uid}`;

  const [selectedPath, setSelectedPath] = useState<PregnancyPath>(() => {
    if (typeof window === 'undefined') return 'pregnant';
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { path?: PregnancyPath };
        if (parsed.path) return parsed.path;
      }
    } catch {
      // Ignore storage errors
    }
    return 'pregnant';
  });

  const [checkedHabits, setCheckedHabits] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { habits?: string[] };
        if (Array.isArray(parsed.habits)) return parsed.habits;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ path: selectedPath, habits: checkedHabits })
      );
    } catch {
      // Ignore storage errors
    }
  }, [storageKey, selectedPath, checkedHabits]);

  const toggleHabit = (id: string) => {
    setCheckedHabits((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedCount = checkedHabits.length;

  return (
    <div className="space-y-8">
      {/* Cute Gentle Greeting Hero */}
      <section className="bg-[#FFF0E5]/90 border border-[#EA6A27]/15 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <SereMascot
            mood={completedCount >= 3 ? 'celebrating' : 'empathetic'}
            size="md"
          />
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#B44A14]">
              {ui.pregnancy.badge}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B]">
              {ui.pregnancy.title}
            </h1>
            <p className="text-sm text-[#5F554D] max-w-2xl leading-relaxed">
              {ui.pregnancy.subtitle}
            </p>
          </div>
        </div>

        {/* 3 Gentle Situation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'pregnant',
                label: 'Yes, I am currently pregnant',
                sub: 'Daily keep-healthy habits & safe care steps',
              },
              {
                id: 'unsure',
                label: 'Not sure / My period is late',
                sub: 'Accurate testing timing & calm guidance',
              },
              {
                id: 'supporting',
                label: 'Supporting a friend / Learning',
                sub: 'How to care kindly without judgment',
              },
            ] as const
          ).map((item) => {
            const active = selectedPath === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPath(item.id)}
                className={`text-left p-4 rounded-2xl border transition-colors ${
                  active
                    ? 'bg-[#FFFDF9] border-[#EA6A27] shadow-xs'
                    : 'bg-[#FFFDF9]/65 hover:bg-[#FFFDF9] border-[#241F1B]/10'
                }`}
              >
                <p className="text-sm font-semibold text-[#241F1B]">{item.label}</p>
                <p className="text-xs text-[#5F554D] mt-1">{item.sub}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {selectedPath === 'pregnant' && (
            <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#44835E]">
                    Please Be Safe &amp; Keep Healthy
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-0.5">
                    Your gentle daily care checklist
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-[#E5F2E9] text-xs font-semibold text-[#244D36] tabular-nums self-start">
                  {completedCount} of {HEALTHY_HABITS.length} checked today
                </div>
              </div>

              <div className="space-y-3">
                {HEALTHY_HABITS.map((habit) => {
                  const checked = checkedHabits.includes(habit.id);
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-full text-left p-4 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                        checked
                          ? 'bg-[#E5F2E9]/75 border-[#44835E]/30'
                          : 'bg-[#FAF5EE] hover:bg-[#FFF0E5]/55 border-[#241F1B]/8'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          checked ? 'text-[#44835E]' : 'text-[#8C8074]'
                        }`}
                      />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-[#241F1B]">{habit.title}</p>
                        <p className="text-xs text-[#5F554D] leading-relaxed">{habit.detail}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-[#EFEAFE]/75 border border-[#6B4FD3]/15 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#3C2885] leading-relaxed">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#6B4FD3]" />
                <p>
                  <strong>You do not have to carry this alone:</strong> Talking to a confidential doctor, midwife, school counselor, or trusted adult helps protect both your physical health and emotional safety.
                </p>
              </div>
            </section>
          )}

          {selectedPath === 'unsure' && (
            <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#553CB5]">Calm First Steps</p>
                <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                  When &amp; how to get clear answers
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#EFEAFE]/70 border border-[#6B4FD3]/15 rounded-2xl p-5 space-y-1.5">
                  <p className="text-sm font-semibold text-[#241F1B]">1. Accurate Test Timing</p>
                  <p className="text-xs text-[#453973] leading-relaxed">
                    Home urine pregnancy tests are most accurate from the first day of a missed period—or 14 to 21 days after unprotected sex—especially using first-morning urine.
                  </p>
                </div>
                <div className="bg-[#E5F2E9]/75 border border-[#44835E]/15 rounded-2xl p-5 space-y-1.5">
                  <p className="text-sm font-semibold text-[#241F1B]">2. Other Reasons Cycles Shift</p>
                  <p className="text-xs text-[#244D36] leading-relaxed">
                    For teens aged 10–19, stress, exam sleep changes, illness, intense exercise, or normal hormone growth often make periods arrive early or late.
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF5EE] border border-[#241F1B]/8 rounded-2xl p-5 space-y-2">
                <p className="text-sm font-semibold text-[#241F1B]">
                  While waiting to find out, please keep safe &amp; healthy:
                </p>
                <ul className="text-xs text-[#5F554D] space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>Drink water, rest, and eat nourishing meals—avoid skipping meals out of stress.</li>
                  <li>Avoid alcohol, vaping/smoking, and unverified medications or herbal mixtures.</li>
                  <li>Visit a confidential youth clinic if you want a free or low-cost test and support.</li>
                </ul>
              </div>
            </section>
          )}

          {selectedPath === 'supporting' && (
            <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#44835E]">Being a Caring Ally</p>
                <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                  How to support a friend kindly &amp; safely
                </h2>
              </div>

              <div className="space-y-3">
                <div className="bg-[#E5F2E9]/70 border border-[#44835E]/15 rounded-2xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-[#241F1B]">Listen first, never gossip</p>
                  <p className="text-xs text-[#315C44] leading-relaxed">
                    Respect their privacy completely. Do not share their personal situation with classmates or online.
                  </p>
                </div>
                <div className="bg-[#EFEAFE]/70 border border-[#6B4FD3]/15 rounded-2xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-[#241F1B]">Offer practical, calm support</p>
                  <p className="text-xs text-[#453973] leading-relaxed">
                    Offer to sit with them while calling a youth helpline, finding a clinic, or talking to a trusted adult or school nurse.
                  </p>
                </div>
                <div className="bg-[#FFF0E5]/75 border border-[#EA6A27]/15 rounded-2xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-[#241F1B]">Encourage real medical care</p>
                  <p className="text-xs text-[#5C2918] leading-relaxed">
                    Remind them not to try unverified internet remedies—help them reach a real clinician who can protect their health safely.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Direct Action Bar */}
          <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[#241F1B]">
                Want to talk privately about what you are feeling?
              </p>
              <p className="text-xs text-[#5F554D]">
                Sere will listen without judgment and share calm next steps.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onAskCompanion(
                    selectedPath === 'pregnant'
                      ? 'I am currently pregnant and feeling nervous. How can I stay safe, keep healthy, and find confidential support?'
                      : selectedPath === 'unsure'
                      ? 'I am worried I might be pregnant and I am scared to tell anyone. What safe steps can I take?'
                      : 'How can I best support a friend who might be pregnant and keep them safe?'
                  )
                }
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold whitespace-nowrap transition-colors"
              >
                <MessageCircleHeart className="w-4 h-4" />
                <span>Talk With Sere</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('support')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E5F2E9] hover:bg-[#D6EBDD] text-[#244D36] text-sm font-semibold whitespace-nowrap transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Find Youth Clinics</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Sidebar: Urgent Red-Flag Safety + Quick Keep-Healthy Reminders */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFF0E5] border border-[#EA6A27]/30 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B44A14]">
              <ShieldAlert className="w-4 h-4" />
              <span>Please Seek Urgent Care Right Away If:</span>
            </div>
            <ul className="text-xs text-[#5C2918] space-y-2 leading-relaxed list-disc pl-4">
              <li>Heavy vaginal bleeding (soaking 1 or more pads per hour for 2 hours)</li>
              <li>Sharp, severe cramping or pain on one side of your lower belly or shoulder</li>
              <li>Fever, chills, dizziness, fainting, or blurred vision</li>
              <li>Severe vomiting where you cannot keep water down for 24 hours</li>
              <li>Anyone is threatening, pressuring, or hurting you</li>
            </ul>
            <button
              type="button"
              onClick={() => onNavigate('support')}
              className="w-full min-h-[40px] mt-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FFFDF9] hover:bg-white text-xs font-semibold text-[#B44A14] transition-colors"
            >
              <span>View Helplines &amp; Clinics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#FEF6DF]/90 border border-[#D49B2A]/20 rounded-3xl p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7A530B]">
              <HeartHandshake className="w-4 h-4" />
              <span>Gentle Care Reminders</span>
            </div>
            <div className="space-y-2 text-xs text-[#5E4410] leading-relaxed">
              <p className="flex items-start gap-2">
                <Droplets className="w-4 h-4 shrink-0 mt-0.5 text-[#44835E]" />
                <span>Keep a water bottle nearby and take small frequent sips if nauseous.</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#EA6A27]" />
                <span>Never take unprescribed pills or remedies found on social media—always ask a licensed clinician.</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
