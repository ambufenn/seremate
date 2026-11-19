import {
  Baby,
  History,
  Home,
  MessageCircleHeart,
  Shield,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import type { SereMateTab } from '../types/seremate';
import { SereMateLogoMark } from './SereMascot';

interface SereMateNavProps {
  activeTab: SereMateTab;
  onSelectTab: (tab: SereMateTab) => void;
  isAdmin: boolean;
  displayName: string;
}

export function SereMateNav({
  activeTab,
  onSelectTab,
  isAdmin,
  displayName,
}: SereMateNavProps) {
  const navLinks: Array<{ id: SereMateTab; label: string }> = [
    { id: 'dashboard', label: 'Home' },
    { id: 'companion', label: 'Ask Sere' },
    { id: 'community', label: 'Community' },
    { id: 'pregnancy', label: 'Safe Care' },
    { id: 'guidance', label: 'Guides' },
    { id: 'support', label: 'Clinics' },
  ];

  const mobileTabs: Array<{ id: SereMateTab; label: string; icon: typeof Home }> = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'companion', label: 'Ask Sere', icon: MessageCircleHeart },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'pregnancy', label: 'Safe Care', icon: Baby },
    { id: 'support', label: 'Clinics', icon: Stethoscope },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#FAF5EE]/92 backdrop-blur-md border-b border-[#241F1B]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA6A27]"
          >
            <SereMateLogoMark className="w-8 h-8 shrink-0" />
            <span className="font-display text-lg font-semibold tracking-tight text-[#241F1B]">
              SereMate
            </span>
          </button>

          {/* Zone 2: Desktop Single-Line Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    isActive ? 'text-[#241F1B]' : 'text-[#5F554D] hover:text-[#241F1B]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] bg-[#EA6A27] rounded-full"
                    />
                  )}
                </button>
              );
            })}
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSelectTab('admin')}
                className={`relative py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === 'admin' ? 'text-[#44835E]' : 'text-[#44835E]/80 hover:text-[#44835E]'
                }`}
              >
                Admin
                {activeTab === 'admin' && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] bg-[#44835E] rounded-full"
                  />
                )}
              </button>
            )}
          </nav>

          {/* Zone 3: Account / Utility Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('history')}
              aria-label="Conversation History"
              className={`min-h-[40px] min-w-[40px] rounded-2xl flex items-center justify-center transition-colors ${
                activeTab === 'history'
                  ? 'bg-[#FFF0E5] text-[#EA6A27]'
                  : 'text-[#5F554D] hover:bg-[#F3ECE1]'
              }`}
            >
              <History className="w-4 h-4" />
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onSelectTab('admin')}
                aria-label="Admin Console"
                className={`lg:hidden min-h-[40px] min-w-[40px] rounded-2xl flex items-center justify-center transition-colors ${
                  activeTab === 'admin' ? 'bg-[#E5F2E9] text-[#44835E]' : 'text-[#44835E]'
                }`}
              >
                <Shield className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[#EA6A27] text-white'
                  : 'bg-[#FFFDF9] border border-[#241F1B]/10 text-[#241F1B] hover:bg-[#FFF0E5]'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="max-w-[110px] truncate">{displayName}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Thumb Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#241F1B]/8"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center rounded-2xl transition-colors ${
                  isActive
                    ? 'text-[#EA6A27] bg-[#FFF0E5]/70'
                    : 'text-[#5F554D] hover:text-[#241F1B]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] font-medium mt-0.5 whitespace-nowrap">
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
