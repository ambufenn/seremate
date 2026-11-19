import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Compass,
  Heart,
  Lock,
  MessageCircleHeart,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { KNOWLEDGE_BADGES } from '../data/badges';
import { HEALTH_QUESTS } from '../data/quests';
import type {
  AppTab,
  CheckInMood,
  KnowledgeBadge,
  LumiMood,
  UserProgress,
} from '../types/reproguard';
import { LumiCharacter } from './LumiCharacter';

interface HomeDashboardProps {
  progress: UserProgress;
  onSelectMood: (mood: CheckInMood) => void;
  onNavigate: (tab: AppTab) => void;
  onStartQuest: (questId: string) => void;
  onLaunchDemoScenario: () => void;
}

const MOOD_OPTIONS: Array<{ id: CheckInMood; label: string; lumiMood: LumiMood; response: string }> = [
  {
    id: 'calm',
    label: 'Calm',
    lumiMood: 'calm',
    response: 'Glad you feel steady today. Pick any quest or story to explore at your own pace.',
  },
  {
    id: 'curious',
    label: 'Curious',
    lumiMood: 'encouraging',
    response: 'Curiosity is a strength. Every question you have deserves clear, respectful answers.',
  },
  {
    id: 'worried',
    label: 'Worried',
    lumiMood: 'empathetic',
    response: 'It is okay to feel worried. I am right here with you—no lectures, just clear support.',
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    lumiMood: 'empathetic',
    response: 'Take one slow breath. You do not have to solve everything today—we can take one tiny step.',
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    lumiMood: 'celebrating',
    response: 'Love that energy. Let us build confidence with facts and practical tools together.',
  },
];

function renderBadgeIcon(iconType: KnowledgeBadge['iconType'], unlocked: boolean) {
  const cls = `w-5 h-5 ${unlocked ? 'text-[#241F1B]' : 'text-[#8C8074]'}`;
  switch (iconType) {
    case 'compass':
      return <Compass className={cls} />;
    case 'shield':
      return <ShieldCheck className={cls} />;
    case 'heart':
      return <Heart className={cls} />;
    case 'spark':
      return <Sparkles className={cls} />;
    case 'book':
      return <BookOpen className={cls} />;
    case 'lock':
      return <Lock className={cls} />;
    case 'clinic':
      return <Stethoscope className={cls} />;
    default:
      return <Star className={cls} />;
  }
}

export function HomeDashboard({
  progress,
  onSelectMood,
  onNavigate,
  onStartQuest,
  onLaunchDemoScenario,
}: HomeDashboardProps) {
  const nextIncompleteQuest =
    HEALTH_QUESTS.find((q) => !progress.completedQuestIds.includes(q.id)) || HEALTH_QUESTS[0];
  const [selectedStageId, setSelectedStageId] = useState<string>(nextIncompleteQuest.id);

  const selectedQuest =
    HEALTH_QUESTS.find((q) => q.id === selectedStageId) || nextIncompleteQuest;

  const activeMoodObj =
    MOOD_OPTIONS.find((m) => m.id === progress.checkInMood) || MOOD_OPTIONS[1];

  const level = Math.floor(progress.xp / 200) + 1;
  const levelProgressPct = Math.min(100, Math.round(((progress.xp % 200) / 200) * 100));

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Section 1: Hero Companion & Journey Progress */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Lumi Emotional Check-In Card */}
        <div className="lg:col-span-7 bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 text-xs font-medium text-[#655B52]">
              <span>Your Health, Your Journey</span>
              <span className="tabular-nums">
                Level {String(level).padStart(2, '0')} · Explorer
              </span>
            </div>

            {/* Journey XP bar */}
            <div className="mt-2.5 h-2 w-full rounded-full bg-[#F3ECE0] overflow-hidden">
              <div
                className="h-full bg-[#EA6A27] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, levelProgressPct)}%` }}
              />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="shrink-0 self-start sm:self-center">
                <LumiCharacter mood={activeMoodObj.lumiMood} size="lg" />
              </div>
              <div className="space-y-2.5">
                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#241F1B] leading-[1.15]">
                  Your questions deserve care, not judgment.
                </h1>
                <p className="text-[15px] leading-relaxed text-[#655B52]">
                  {activeMoodObj.response}
                </p>
              </div>
            </div>

            {/* Emotional Check-In Selector */}
            <div className="mt-6 pt-5 border-t border-[#241F1B]/8">
              <p className="text-xs font-semibold text-[#655B52] mb-3">
                How are you feeling today?
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = progress.checkInMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => onSelectMood(mood.id)}
                      className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27] ${
                        isSelected
                          ? 'bg-[#241F1B] text-[#FDFBF7]'
                          : 'bg-[#F3ECE0] text-[#241F1B] hover:bg-[#EAE0CF]'
                      }`}
                    >
                      {mood.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-6 pt-5 border-t border-[#241F1B]/8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('lumi')}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap transition-colors duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27]"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Talk to Lumi</span>
            </button>
            <button
              type="button"
              onClick={onLaunchDemoScenario}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF0E5] hover:bg-[#FFE3D0] text-[#B8470F] text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27]"
            >
              <span>Try 16-Year-Old Pregnancy Scare Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Quick Launchers & Safe Space Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="bg-[#EFEAFE] border border-[#7C5CE0]/15 rounded-3xl p-6 flex-1 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5A3EC2]">Interactive Visual Stories</p>
              <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-1">
                Practice real choices in a safe story
              </h2>
              <p className="text-sm text-[#4F4568] mt-2 leading-relaxed">
                Explore branching visual-novel scenes on pregnancy worries, consent boundaries, and visiting a clinic—with gentle explanations at every turn.
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => onNavigate('scenarios')}
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FDFBF7] hover:bg-white text-[#241F1B] text-sm font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C5CE0]"
              >
                <span>Open Interactive Stories</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onNavigate('myths')}
              className="text-left bg-[#E5F2E9] hover:bg-[#D9EBDF] border border-[#44835E]/15 rounded-3xl p-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44835E]"
            >
              <p className="text-xs font-semibold text-[#2E6243]">Mini-Game</p>
              <p className="font-display text-lg font-semibold text-[#241F1B] mt-1">
                Myth Hunter
              </p>
              <p className="text-xs text-[#436350] mt-1 tabular-nums">
                {progress.correctMythIds.length} facts verified
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('navigator')}
              className="text-left bg-[#FDFBF7] hover:bg-white border border-[#241F1B]/10 rounded-3xl p-5 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27]"
            >
              <p className="text-xs font-semibold text-[#655B52]">Verified Care</p>
              <p className="font-display text-lg font-semibold text-[#241F1B] mt-1">
                Care Navigator
              </p>
              <p className="text-xs text-[#655B52] mt-1">
                Clinics & 24/7 lines
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Illustrated Adventure Quest Map (Inspired by InnerSteps UI) */}
      <section className="bg-[#EFEAFE]/75 border border-[#7C5CE0]/15 rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-[#5A3EC2]">
              Adventure Quest Map · {progress.completedQuestIds.length} of {HEALTH_QUESTS.length} completed
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#241F1B] mt-1">
              Explore your 7 health stages
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('quests')}
            className="self-start sm:self-auto min-h-[40px] inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A3EC2] hover:text-[#3E2799] whitespace-nowrap"
          >
            <span>View all quest details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Winding Trail Stage Canvas */}
        <div className="relative bg-[#FDFBF7]/85 border border-[#241F1B]/8 rounded-2xl p-5 sm:p-7">
          {/* Selected Stage Popover Callout (Tap to Play) */}
          <motion.div
            key={selectedQuest.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 bg-[#FDFBF7] border border-[#241F1B]/12 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-[#655B52]">
                <span>Stage {String(selectedQuest.stageNumber).padStart(2, '0')}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedQuest.durationLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">+{selectedQuest.xpReward} XP</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-[#241F1B]">
                {selectedQuest.title}
              </h3>
              <p className="text-sm text-[#655B52]">{selectedQuest.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => onStartQuest(selectedQuest.id)}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#44835E] hover:bg-[#356B4B] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#44835E]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {progress.completedQuestIds.includes(selectedQuest.id)
                  ? 'Replay Quest'
                  : 'Tap to Play'}
              </span>
            </button>
          </motion.div>

          {/* Interactive Winding Path Nodes */}
          <div className="relative">
            {/* Subtle connecting trail line on desktop */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-8 left-8 right-8 h-1 bg-[#E4DCF8] rounded-full"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 relative">
              {HEALTH_QUESTS.map((quest, idx) => {
                const isDone = progress.completedQuestIds.includes(quest.id);
                const isSelected = selectedStageId === quest.id;
                const staggerOffset = idx % 2 === 1 ? 'md:mt-6' : 'md:mt-0';

                return (
                  <button
                    key={quest.id}
                    type="button"
                    onClick={() => setSelectedStageId(quest.id)}
                    className={`group flex flex-col items-center text-center p-2 rounded-2xl transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27] ${staggerOffset}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display text-lg font-semibold tabular-nums transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#EA6A27] text-white scale-105 ring-4 ring-[#EA6A27]/20'
                          : isDone
                          ? 'bg-[#44835E] text-white'
                          : 'bg-[#F3ECE0] text-[#241F1B] group-hover:bg-[#E7DDD0]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-6 h-6 stroke-[2.5]" />
                      ) : (
                        String(quest.stageNumber).padStart(2, '0')
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold leading-tight ${
                        isSelected ? 'text-[#241F1B]' : 'text-[#655B52]'
                      }`}
                    >
                      {quest.shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#655B52]">
            You can skip any question. Your journey, your pace.
          </p>
        </div>
      </section>

      {/* Section 3: Learning Progress & Knowledge Badges */}
      <section className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#241F1B]/8">
          <div>
            <p className="text-xs font-semibold text-[#655B52]">Knowledge Badges</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#241F1B] mt-1">
              Milestones for curiosity & learning
            </h2>
            <p className="text-sm text-[#655B52] mt-1">
              Badges reward health literacy and myth-busting—never sharing personal or sexual experiences.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#241F1B] tabular-nums shrink-0">
            <div>
              <span className="block text-xs text-[#655B52]">Total XP</span>
              <span className="font-display text-xl font-semibold">{progress.xp}</span>
            </div>
            <div>
              <span className="block text-xs text-[#655B52]">Badges</span>
              <span className="font-display text-xl font-semibold">
                {progress.unlockedBadgeIds.length}/{KNOWLEDGE_BADGES.length}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KNOWLEDGE_BADGES.map((badge) => {
            const unlocked = progress.unlockedBadgeIds.includes(badge.id);
            const surfaceClass = unlocked
              ? badge.tone === 'tangerine'
                ? 'bg-[#FFF0E5] border-[#EA6A27]/20'
                : badge.tone === 'lavender'
                ? 'bg-[#EFEAFE] border-[#7C5CE0]/20'
                : 'bg-[#E5F2E9] border-[#44835E]/20'
              : 'bg-[#FAF5ED] border-[#241F1B]/8 opacity-80';

            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 flex items-start gap-3.5 ${surfaceClass}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-[#FDFBF7]' : 'bg-[#F3ECE0]'
                  }`}
                >
                  {renderBadgeIcon(badge.iconType, unlocked)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-[#241F1B] truncate">
                      {badge.title}
                    </h3>
                    {unlocked && (
                      <Award className="w-4 h-4 text-[#44835E] shrink-0" aria-label="Unlocked" />
                    )}
                  </div>
                  <p className="text-xs text-[#655B52] mt-1 leading-relaxed">
                    {unlocked ? badge.description : badge.criteriaLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
