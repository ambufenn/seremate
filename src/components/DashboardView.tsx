import {
  ArrowRight,
  Baby,
  BookOpen,
  ClipboardCheck,
  History,
  MessageCircleHeart,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import type {
  AssessmentResultDoc,
  ConversationThread,
  SereMateTab,
  UserProfile,
} from '../types/seremate';
import { SereMascot, type SereMood } from './SereMascot';

interface DashboardViewProps {
  profile: UserProfile;
  conversations: ConversationThread[];
  latestAssessment: AssessmentResultDoc | null;
  onNavigate: (tab: SereMateTab) => void;
  onStartNewChat: (starterPrompt?: string) => void;
  onOpenConversation: (conversationId: string) => void;
}

type MoodId = 'calm' | 'curious' | 'worried' | 'overwhelmed' | 'hopeful';

const MOOD_OPTIONS: Array<{
  id: MoodId;
  label: string;
  mascotMood: SereMood;
  response: string;
}> = [
  {
    id: 'calm',
    label: 'Calm',
    mascotMood: 'calm',
    response: 'Glad you feel steady today. Take your time exploring any guide or question.',
  },
  {
    id: 'curious',
    label: 'Curious',
    mascotMood: 'encouraging',
    response: 'Curiosity is wonderful. Every question you have deserves clear, kind answers.',
  },
  {
    id: 'worried',
    label: 'Worried',
    mascotMood: 'empathetic',
    response: 'It is completely okay to feel worried. I am right here with you—no judgment.',
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    mascotMood: 'empathetic',
    response: 'Take one slow breath. We can figure things out gently, one small step at a time.',
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    mascotMood: 'celebrating',
    response: 'Love that energy! Let us explore facts and supportive care together.',
  },
];

export function DashboardView({
  profile,
  conversations,
  latestAssessment,
  onNavigate,
  onStartNewChat,
  onOpenConversation,
}: DashboardViewProps) {
  const [selectedMood, setSelectedMood] = useState<MoodId>('curious');
  const activeMood = MOOD_OPTIONS.find((m) => m.id === selectedMood) || MOOD_OPTIONS[1];

  return (
    <div className="space-y-8">
      {/* Welcome Companion Hero + Mood Check-In */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            <div className="bg-[#FFF0E5] border border-[#EA6A27]/15 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
              <SereMascot mood={activeMood.mascotMood} size="md" />
              <div className="text-center sm:text-left space-y-1">
                <p className="text-xs font-semibold text-[#B44A14]">
                  Hey, {profile.displayName} · Safe & Private Space
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#241F1B] leading-[1.16]">
                  Hi! I&apos;m Sere, your companion.
                </h1>
                <p className="text-sm text-[#5F554D] leading-relaxed">
                  {activeMood.response}
                </p>
              </div>
            </div>

            {/* Interactive Mood Check-in */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#5F554D]">
                How are you feeling today?
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((mood) => {
                  const isActive = mood.id === selectedMood;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => setSelectedMood(mood.id)}
                      className={`min-h-[40px] px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-[#EA6A27] text-white'
                          : 'bg-[#FAF5EE] hover:bg-[#FFF0E5] border border-[#241F1B]/10 text-[#241F1B]'
                      }`}
                    >
                      {mood.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#241F1B]/8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onStartNewChat()}
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Talk to Sere</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pregnancy')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E5F2E9] hover:bg-[#D6EBDD] text-[#244D36] text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <Baby className="w-4 h-4" />
              <span>Pregnancy &amp; Safe Care</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EFEAFE] hover:bg-[#E4DCFD] text-[#3C2885] text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Peer Activity</span>
            </button>
          </div>
        </div>

        {/* Right: Pastel Safeguarding & Quick Care Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#EFEAFE]/85 border border-[#6B4FD3]/15 rounded-3xl p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#553CB5]">
                <ShieldCheck className="w-4 h-4" />
                <span>Your Questions Deserve Care, Not Judgment</span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#241F1B]">
                Cozy, private &amp; educational
              </h2>
              <p className="text-sm text-[#453973] leading-relaxed">
                Everything you share stays private to you. Sere offers supportive, age-appropriate information—never diagnoses or lectures.
              </p>
            </div>

            {latestAssessment ? (
              <div className="mt-4 pt-4 border-t border-[#6B4FD3]/15 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[#553CB5]">Latest Check-In</p>
                  <p className="text-sm font-semibold text-[#241F1B] truncate">
                    {latestAssessment.primaryCategory}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('assessment')}
                  className="text-xs font-semibold text-[#553CB5] hover:underline whitespace-nowrap shrink-0"
                >
                  View details
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-[#6B4FD3]/15 flex items-center justify-between gap-3">
                <p className="text-xs text-[#453973]">Not sure what to ask first?</p>
                <button
                  type="button"
                  onClick={() => onNavigate('assessment')}
                  className="text-xs font-semibold text-[#553CB5] hover:underline whitespace-nowrap shrink-0"
                >
                  Start check-in
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#E5F2E9]/90 border border-[#44835E]/15 rounded-3xl p-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2E5E44]">Youth-Friendly Care</p>
              <p className="text-sm font-semibold text-[#241F1B] mt-0.5">
                Clinics, helplines &amp; urgent support
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('support')}
              className="min-h-[40px] px-4 py-2 rounded-2xl bg-[#FFFDF9] hover:bg-white text-[#244D36] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
            >
              Find Support
            </button>
          </div>
        </div>
      </section>

      {/* Cozy Pastel Modules Grid */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-[#5F554D]">Explore at Your Own Pace</p>
          <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-0.5">
            Choose what feels helpful right now
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => onNavigate('pregnancy')}
            className="text-left bg-[#FFF0E5]/85 hover:bg-[#FFF0E5] border border-[#EA6A27]/15 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] flex items-center justify-center">
              <Baby className="w-5 h-5 text-[#EA6A27]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Are You Pregnant?
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Gentle check-in, keep-healthy daily checklist, and safety red-flag guidance.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B44A14] mt-4">
              <span>Be Safe &amp; Healthy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="text-left bg-[#EFEAFE]/80 hover:bg-[#EFEAFE] border border-[#6B4FD3]/15 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6B4FD3]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Peer &amp; Community
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Join safe youth circles, send hugs on anonymous notes, and vote in peer polls.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#553CB5] mt-4">
              <span>Join Activity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('companion')}
            className="text-left bg-[#E5F2E9]/80 hover:bg-[#E5F2E9] border border-[#44835E]/15 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] flex items-center justify-center">
              <MessageCircleHeart className="w-5 h-5 text-[#44835E]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Ask Sere (AI)
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Chat privately about periods, pregnancy worries, puberty, or relationships.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E5E44] mt-4">
              <span>Start Chatting</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('guidance')}
            className="text-left bg-[#FEF6DF]/85 hover:bg-[#FEF6DF] border border-[#D49B2A]/20 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFFDF9] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#996B11]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Health Guides
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Clear articles on puberty, menstrual care, pregnancy awareness, and consent.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A530B] mt-4">
              <span>Browse Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('assessment')}
            className="text-left bg-[#FFFDF9] hover:bg-white border border-[#241F1B]/10 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0E5] flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#EA6A27]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Needs Check-In
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Answer a few gentle prompts to organize your worries and see next steps.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B44A14] mt-4">
              <span>Take Check-In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('support')}
            className="text-left bg-[#FFFDF9] hover:bg-white border border-[#241F1B]/10 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#E5F2E9] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#44835E]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Care &amp; Clinic Finder
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Locate youth clinics, 24/7 helplines, and tips for your first visit.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E5E44] mt-4">
              <span>View Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-left bg-[#FFFDF9] hover:bg-white border border-[#241F1B]/10 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EFEAFE] flex items-center justify-center">
              <History className="w-5 h-5 text-[#6B4FD3]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Saved Chats
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed tabular-nums">
              {conversations.length === 0
                ? 'Your private chats with Sere will appear safely here.'
                : `You have ${conversations.length} saved private conversation${conversations.length === 1 ? '' : 's'}.`}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#553CB5] mt-4">
              <span>Open History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="text-left bg-[#FFFDF9] hover:bg-white border border-[#241F1B]/10 rounded-3xl p-6 transition-colors"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FAF5EE] flex items-center justify-center">
              <User className="w-5 h-5 text-[#5F554D]" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#241F1B] mt-4">
              Profile &amp; Privacy
            </h3>
            <p className="text-sm text-[#5F554D] mt-1.5 leading-relaxed">
              Update your nickname, age group, privacy preferences, or switch account.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#241F1B] mt-4">
              <span>Manage Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </section>

      {/* Recent Conversations Preview */}
      {conversations.length > 0 && (
        <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-[#241F1B]">
              Recent Conversations
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#EA6A27] hover:underline"
            >
              See all
            </button>
          </div>
          <div className="divide-y divide-[#241F1B]/8">
            {conversations.slice(0, 3).map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => onOpenConversation(conv.id)}
                className="w-full py-3.5 flex items-center justify-between gap-4 text-left hover:opacity-80 transition-opacity"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#241F1B] truncate">{conv.title}</p>
                  <p className="text-xs text-[#5F554D] truncate mt-0.5">
                    {conv.lastMessagePreview || 'Conversation started'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C8074] shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
