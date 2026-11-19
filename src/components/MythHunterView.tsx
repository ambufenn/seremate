import { ArrowRight, CheckCircle2, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { MYTH_STATEMENTS } from '../data/myths';
import type { MythStatement, UserProgress } from '../types/reproguard';
import { LumiCharacter } from './LumiCharacter';

interface MythHunterViewProps {
  progress: UserProgress;
  onAnswerMyth: (mythId: string, isCorrect: boolean) => void;
  onAskLumi: (prefill?: string) => void;
}

type CategoryFilter = 'All' | MythStatement['category'];

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Pregnancy',
  'Periods',
  'Consent',
  'Body & Puberty',
];

export function MythHunterView({
  progress,
  onAnswerMyth,
  onAskLumi,
}: MythHunterViewProps) {
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [cardIndex, setCardIndex] = useState(0);
  const [lastGuess, setLastGuess] = useState<{
    guessedFact: boolean;
    isCorrect: boolean;
  } | null>(null);
  const [streak, setStreak] = useState(0);

  const deck = useMemo(() => {
    return category === 'All'
      ? MYTH_STATEMENTS
      : MYTH_STATEMENTS.filter((m) => m.category === category);
  }, [category]);

  const currentCard = deck[cardIndex % deck.length];
  const isFinishedRound = cardIndex >= deck.length;

  const handleCategoryChange = (nextCategory: CategoryFilter) => {
    setCategory(nextCategory);
    setCardIndex(0);
    setLastGuess(null);
  };

  const handleGuess = (guessedFact: boolean) => {
    if (!currentCard || lastGuess) return;
    const isCorrect = guessedFact === currentCard.isFact;
    setLastGuess({ guessedFact, isCorrect });
    setStreak((prev) => (isCorrect ? prev + 1 : 0));
    onAnswerMyth(currentCard.id, isCorrect);
  };

  const handleNext = () => {
    setLastGuess(null);
    setCardIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    setCardIndex(0);
    setLastGuess(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#44835E]">
            Myth Hunter · {progress.correctMythIds.length} Verified Facts
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
            Myth or Fact?
          </h1>
          <p className="text-[15px] text-[#655B52] mt-1.5">
            Spot health rumors fast and unlock trusted medical science—zero pressure.
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm tabular-nums shrink-0">
          <div>
            <span className="block text-xs text-[#655B52]">Current Streak</span>
            <span className="font-display text-xl font-semibold text-[#EA6A27]">
              {streak}
            </span>
          </div>
          <div>
            <span className="block text-xs text-[#655B52]">Deck Progress</span>
            <span className="font-display text-xl font-semibold text-[#241F1B]">
              {Math.min(cardIndex + 1, deck.length)}/{deck.length}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Category Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#241F1B] text-[#FDFBF7]'
                  : 'bg-[#F3ECE0] text-[#241F1B] hover:bg-[#EAE0CF]'
              }`}
            >
              {cat === 'All' ? 'All Topics' : cat}
            </button>
          );
        })}
      </div>

      {isFinishedRound ? (
        <div className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-8 text-center space-y-5">
          <div className="flex justify-center">
            <LumiCharacter mood="celebrating" size="lg" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <p className="text-xs font-semibold text-[#44835E]">Deck Complete</p>
            <h2 className="font-display text-3xl font-semibold text-[#241F1B]">
              Your myth radar is sharp
            </h2>
            <p className="text-sm text-[#655B52] leading-relaxed">
              You explored all {deck.length} cards in {category === 'All' ? 'Myth Hunter' : category}. Want to double-check a rumor you heard online?
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#241F1B] hover:bg-[#3A322B] text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Deck Again</span>
            </button>
            <button
              type="button"
              onClick={() => onAskLumi('Can you help me check a health rumor I heard?')}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFF0E5] hover:bg-[#FFE3D0] text-[#B8470F] text-sm font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Verify a Rumor With Lumi</span>
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#655B52]">
            <span>{currentCard.category}</span>
            <span className="tabular-nums">
              Card {cardIndex + 1} of {deck.length} · +20 XP
            </span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#241F1B] leading-snug">
            “{currentCard.statement}”
          </h2>

          {!lastGuess ? (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleGuess(false)}
                className="min-h-[56px] rounded-2xl bg-[#FFF0E5] hover:bg-[#FFE3D0] border border-[#EA6A27]/25 text-[#9F3A08] font-display text-xl font-semibold transition-colors active:scale-[0.98]"
              >
                Myth
              </button>
              <button
                type="button"
                onClick={() => handleGuess(true)}
                className="min-h-[56px] rounded-2xl bg-[#E5F2E9] hover:bg-[#D5EAD9] border border-[#44835E]/25 text-[#1E3B2A] font-display text-xl font-semibold transition-colors active:scale-[0.98]"
              >
                Fact
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                className={`rounded-2xl border p-5 space-y-2 ${
                  lastGuess.isCorrect
                    ? 'bg-[#E5F2E9] border-[#44835E]/25 text-[#1E3B2A]'
                    : 'bg-[#EFEAFE] border-[#7C5CE0]/25 text-[#2E2549]'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {lastGuess.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2E6243]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#5A3EC2]" />
                  )}
                  <span>
                    {lastGuess.isCorrect ? 'Spot on!' : 'Good thing we checked!'} — This is a{' '}
                    {currentCard.isFact ? 'FACT' : 'MYTH'}.
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed">{currentCard.explanation}</p>
                <p className="text-xs opacity-80 pt-1">Source: {currentCard.source}</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Next Card</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
