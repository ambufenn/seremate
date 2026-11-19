import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  MessageCircleHeart,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { INTERACTIVE_SCENARIOS } from '../data/scenarios';
import type { InteractiveScenario, ScenarioChoice, UserProgress } from '../types/reproguard';
import { LumiCharacter } from './LumiCharacter';

interface ScenariosViewProps {
  progress: UserProgress;
  activeScenarioId: string | null;
  onSelectScenario: (scenarioId: string | null) => void;
  onCompleteScenario: (scenario: InteractiveScenario, bonusXp: number) => void;
  onAskLumi: (prefill?: string) => void;
  onOpenNavigator: () => void;
}

export function ScenariosView({
  progress,
  activeScenarioId,
  onSelectScenario,
  onCompleteScenario,
  onAskLumi,
  onOpenNavigator,
}: ScenariosViewProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [accumulatedBonus, setAccumulatedBonus] = useState<number>(0);
  const [storyEnded, setStoryEnded] = useState<boolean>(false);

  const activeScenario =
    INTERACTIVE_SCENARIOS.find((s) => s.id === activeScenarioId) || null;

  const startScenario = (scenario: InteractiveScenario) => {
    setCurrentNodeId(scenario.startNodeId);
    setSelectedChoice(null);
    setAccumulatedBonus(0);
    setStoryEnded(false);
    onSelectScenario(scenario.id);
  };

  if (activeScenario) {
    const node = activeScenario.nodes[currentNodeId];

    const handleChoose = (choice: ScenarioChoice) => {
      setSelectedChoice(choice);
      setAccumulatedBonus((prev) => prev + choice.xpBonus);
    };

    const handleAdvance = () => {
      if (!selectedChoice) return;
      if (selectedChoice.nextNodeId && activeScenario.nodes[selectedChoice.nextNodeId]) {
        setCurrentNodeId(selectedChoice.nextNodeId);
        setSelectedChoice(null);
      } else {
        onCompleteScenario(activeScenario, accumulatedBonus);
        setStoryEnded(true);
      }
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onSelectScenario(null)}
            className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#241F1B] hover:bg-[#F3ECE0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All interactive stories</span>
          </button>

          <button
            type="button"
            onClick={() => startScenario(activeScenario)}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#655B52] hover:bg-[#F3ECE0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>

        <motion.div
          key={`${activeScenario.id}-${currentNodeId}-${storyEnded}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl overflow-hidden"
        >
          {/* Illustrated Visual-Novel Header */}
          <div
            className={`px-6 sm:px-8 py-5 border-b border-[#241F1B]/8 ${
              activeScenario.tone === 'tangerine'
                ? 'bg-[#FFF0E5]'
                : activeScenario.tone === 'lavender'
                ? 'bg-[#EFEAFE]'
                : 'bg-[#E5F2E9]'
            }`}
          >
            <p className="text-xs font-semibold text-[#655B52]">
              {activeScenario.title} · {storyEnded ? 'Story Complete' : node.sceneTitle}
            </p>
            <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-1">
              {storyEnded
                ? 'You navigated that with care and clarity'
                : node.settingDescription}
            </h2>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {storyEnded ? (
              <div className="text-center space-y-5 py-3">
                <div className="flex justify-center">
                  <LumiCharacter mood="celebrating" size="lg" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <p className="text-xs font-semibold text-[#44835E]">
                    Story Completed · +{activeScenario.xpReward + accumulatedBonus} XP
                  </p>
                  <p className="text-[15px] text-[#4C433C] leading-relaxed">
                    Practicing real-life conversations in a safe space makes it easier to trust your instincts and reach out for confidential support when it matters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onAskLumi(
                        activeScenario.id === 'scenario-late-period'
                          ? "I'm worried I might be pregnant and I'm scared to tell anyone."
                          : `I just played the "${activeScenario.title}" story and want to ask a question.`
                      )
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    <MessageCircleHeart className="w-4 h-4" />
                    <span>Talk About This With Lumi</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenNavigator}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E5F2E9] hover:bg-[#D5EAD9] text-[#244D35] text-sm font-semibold whitespace-nowrap transition-colors"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>See Youth Clinics</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Character Speech Box */}
                <div className="bg-[#FAF5ED] border border-[#241F1B]/8 rounded-2xl p-5 space-y-2">
                  <p className="text-xs font-semibold text-[#EA6A27]">
                    {node.dialogueSpeaker}
                  </p>
                  <p className="font-display text-lg sm:text-xl text-[#241F1B] leading-relaxed">
                    “{node.dialogueText}”
                  </p>
                </div>

                {/* Lumi Companion Guidance */}
                <div className="flex items-start gap-3.5">
                  <LumiCharacter mood="empathetic" size="sm" className="shrink-0 mt-0.5" />
                  <div className="bg-[#EFEAFE]/70 border border-[#7C5CE0]/15 rounded-2xl px-4 py-3 text-sm text-[#393053] leading-relaxed">
                    <span className="font-semibold text-[#5A3EC2]">Lumi: </span>
                    {node.lumiWhisper}
                  </div>
                </div>

                {/* Branching Choices */}
                {!selectedChoice ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-semibold text-[#655B52]">
                      Choose what happens next:
                    </p>
                    {node.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleChoose(choice)}
                        className="w-full text-left p-4 rounded-2xl bg-[#FDFBF7] hover:bg-[#FFF0E5]/70 border border-[#241F1B]/12 hover:border-[#EA6A27]/40 text-[15px] font-medium text-[#241F1B] flex items-center justify-between gap-4 transition-colors duration-150"
                      >
                        <span>{choice.label}</span>
                        <ArrowRight className="w-4 h-4 text-[#655B52] shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-1"
                  >
                    <div className="bg-[#E5F2E9] border border-[#44835E]/20 rounded-2xl p-5 space-y-2">
                      <p className="text-xs font-semibold text-[#2E6243]">
                        You chose: {selectedChoice.label}
                      </p>
                      <p className="text-[15px] text-[#1E3B2A] leading-relaxed">
                        {selectedChoice.supportiveResponse}
                      </p>
                      <p className="text-xs font-medium text-[#2E6243] pt-1">
                        {selectedChoice.lumiNote}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAdvance}
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                      >
                        <span>
                          {selectedChoice.nextNodeId ? 'Continue Story' : 'Complete Story'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#7C5CE0]">
          Interactive Scenarios · {progress.completedScenarioIds.length}/{INTERACTIVE_SCENARIOS.length} Explored
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
          Visual stories without judgment
        </h1>
        <p className="text-[15px] text-[#655B52] mt-2 max-w-2xl leading-relaxed">
          Step into relatable teen moments, test different choices safely, and see calm, honest explanations—no wrong-choice shaming.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {INTERACTIVE_SCENARIOS.map((scenario) => {
          const isDone = progress.completedScenarioIds.includes(scenario.id);
          const surface =
            scenario.tone === 'tangerine'
              ? 'bg-[#FFF0E5]/80 border-[#EA6A27]/20'
              : scenario.tone === 'lavender'
              ? 'bg-[#EFEAFE]/80 border-[#7C5CE0]/20'
              : 'bg-[#E5F2E9]/80 border-[#44835E]/20';

          return (
            <div
              key={scenario.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between ${surface}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#655B52]">
                  <span className="tabular-nums">
                    {scenario.durationLabel} · +{scenario.xpReward} XP
                  </span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#2E6243]">
                      <Check className="w-3.5 h-3.5" />
                      Played
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-3">
                  {scenario.title}
                </h2>
                <p className="text-sm text-[#574E46] mt-2 leading-relaxed">
                  {scenario.subtitle}
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => startScenario(scenario)}
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FDFBF7] hover:bg-white text-[#241F1B] text-sm font-semibold transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#7C5CE0]" />
                  <span>{isDone ? 'Replay Story' : 'Enter Story'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
