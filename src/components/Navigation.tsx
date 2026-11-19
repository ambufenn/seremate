import { BookOpen, Compass, Home, MessageCircleHeart, Sparkles, Stethoscope } from 'lucide-react';
import type { AppTab } from '../types/reproguard';
import { BrandLogoMark } from './LumiCharacter';

interface NavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  xp: number;
}

const DESKTOP_LINKS: Array<{ id: AppTab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'quests', label: 'Quests' },
  { id: 'scenarios', label: 'Stories' },
  { id: 'myths', label: 'Myth Hunter' },
  { id: 'navigator', label: 'Care Navigator' },
];

const MOBILE_TABS: Array<{ id: AppTab; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'quests', label: 'Quests', icon: Compass },
  { id: 'lumi', label: 'Lumi', icon: MessageCircleHeart },
  { id: 'myths', label: 'Myths', icon: Sparkles },
  { id: 'navigator', label: 'Care', icon: Stethoscope },
];

export function Navigation({ activeTab, onSelectTab, xp }: NavigationProps) {
  const level = Math.floor(xp / 200) + 1;

  return (
    <>
      {/* Desktop & Mobile Top Header (3-Zone Contract on Desktop) */}
      <header className="sticky top-0 z-30 bg-[#FAF5ED]/90 backdrop-blur-md border-b border-[#241F1B]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27] rounded-lg"
          >
            <BrandLogoMark className="w-8 h-8 shrink-0" />
            <span className="font-display text-lg font-semibold tracking-tight text-[#241F1B]">
              reproguard
            </span>
          </button>

          {/* Zone 2: Desktop Single-Line Text Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {DESKTOP_LINKS.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27] rounded-sm ${
                    isActive
                      ? 'text-[#241F1B]'
                      : 'text-[#655B52] hover:text-[#241F1B]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#EA6A27] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action on Desktop, Quiet Progress Text on Mobile */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="lg:hidden text-xs font-medium text-[#655B52] tabular-nums whitespace-nowrap shrink-0">
              Level {String(level).padStart(2, '0')} · {xp} XP
            </span>
            <button
              type="button"
              onClick={() => onSelectTab(activeTab === 'lumi' ? 'scenarios' : 'lumi')}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-[#EA6A27] hover:bg-[#D45818] text-white text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27]"
            >
              {activeTab === 'lumi' ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Stories</span>
                </>
              ) : (
                <>
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>Talk to Lumi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Thumb Navigation Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-t border-[#241F1B]/10"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27] ${
                  isActive ? 'text-[#EA6A27]' : 'text-[#655B52] hover:text-[#241F1B]'
                }`}
              >
                <Icon
                  className={`w-[22px] h-[22px] ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
