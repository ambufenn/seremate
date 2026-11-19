import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  PhoneCall,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type {
  AgentTrace,
  ChatMessage,
  CheckInMood,
  LumiMood,
} from '../types/reproguard';
import { LumiCharacter } from './LumiCharacter';

interface LumiChatViewProps {
  checkInMood: CheckInMood | null;
  pendingPrompt: string | null;
  onClearPendingPrompt: () => void;
  onTalkedToLumi: () => void;
  onOpenQuest: (questId: string) => void;
  onOpenNavigator: () => void;
  onOpenScenarios: () => void;
}

const DEMO_SCENARIO_PROMPT =
  "I'm worried I might be pregnant and I'm scared to tell anyone.";

const STARTER_PROMPTS = [
  DEMO_SCENARIO_PROMPT,
  'When is a pregnancy test actually accurate?',
  'Someone is pressuring me for private photos online.',
  'What happens at a confidential youth clinic?',
];

export function LumiChatView({
  checkInMood,
  pendingPrompt,
  onClearPendingPrompt,
  onTalkedToLumi,
  onOpenQuest,
  onOpenNavigator,
  onOpenScenarios,
}: LumiChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-lumi',
      role: 'lumi',
      lumiMood: 'calm',
      timestamp: 'Now',
      text: "Hi, I'm Lumi. Whatever question is on your mind—big, small, or scary to say out loud—you can ask me safely here. No judgment, no lectures, and you set the pace.",
      suggestedFollowUps: [
        DEMO_SCENARIO_PROMPT,
        'How do I know if period cramps are normal?',
        'How does consent work in a relationship?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const currentLumiMood: LumiMood = isLoading
    ? 'thinking'
    : messages[messages.length - 1]?.lumiMood || 'calm';

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    setErrorBanner(null);
    const userTurn: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };

    const updatedMessages = [...messages, userTurn];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    onTalkedToLumi();

    try {
      const historyPayload = updatedMessages
        .filter((m) => m.id !== 'welcome-lumi')
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/lumi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload.slice(0, -1),
          mood: checkInMood || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to reach Lumi right now.');
      }

      const lumiReply: ChatMessage = {
        id: `lumi-${Date.now()}`,
        role: 'lumi',
        text: data.reply,
        timestamp: 'Just now',
        lumiMood: data.lumiMood || 'empathetic',
        gentleSafetyCheck: data.gentleSafetyCheck || null,
        suggestedFollowUps: data.suggestedFollowUps || [],
        careCards: data.careCards || [],
        recommendedFacilities: data.recommendedFacilities || [],
        agentTrace: data.agentTrace as AgentTrace | undefined,
      };

      setMessages((prev) => [...prev, lumiReply]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something interrupted the connection to Lumi.';
      setErrorBanner(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pendingPrompt) {
      const promptToRun = pendingPrompt;
      onClearPendingPrompt();
      void sendMessage(promptToRun);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  const toggleTrace = (msgId: string) => {
    setExpandedTraceIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar on Desktop / Compact Companion Strip on Mobile */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <LumiCharacter mood={currentLumiMood} size="md" className="shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#241F1B]">
                Talk to Lumi
              </h1>
              <p className="text-xs text-[#655B52] mt-0.5">
                Empathetic · Evidence-based · Non-judgmental
              </p>
            </div>
          </div>

          <p className="text-sm text-[#574E46] mt-4 leading-relaxed">
            Lumi combines verified adolescent health facts, trauma-informed safeguarding, and confidential clinic referrals—and never replaces a doctor.
          </p>

          <div className="mt-5 pt-4 border-t border-[#241F1B]/8">
            <p className="text-xs font-semibold text-[#655B52] mb-2.5">
              Quick Demo & Starter Prompts
            </p>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((promptText, idx) => (
                <button
                  key={promptText}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void sendMessage(promptText)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-colors disabled:opacity-50 ${
                    idx === 0
                      ? 'bg-[#FFF0E5] hover:bg-[#FFE3D0] text-[#9F3A08] border border-[#EA6A27]/25'
                      : 'bg-[#FAF5ED] hover:bg-[#F3ECE0] text-[#241F1B] border border-[#241F1B]/8'
                  }`}
                >
                  {idx === 0 ? `Demo Scenario: “${promptText}”` : promptText}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Immediate Confidential Support Shortcut */}
        <div className="bg-[#E5F2E9] border border-[#44835E]/20 rounded-3xl p-5 space-y-2">
          <p className="text-xs font-semibold text-[#2E6243]">Need a real person right now?</p>
          <p className="text-sm font-medium text-[#1E3B2A]">
            Harbor 24/7 Anonymous Teen Line
          </p>
          <p className="text-xs text-[#375A44] leading-relaxed">
            Text <span className="font-semibold">CARE</span> to <span className="font-semibold tabular-nums">741-890</span> or browse confidential clinics anytime.
          </p>
          <button
            type="button"
            onClick={onOpenNavigator}
            className="mt-1 min-h-[40px] inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E6243] hover:underline"
          >
            <span>Open Healthcare Navigator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Conversation Stream */}
      <section className="lg:col-span-8 bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl flex flex-col min-h-[540px] max-h-[78vh]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const showTrace = Boolean(expandedTraceIds[msg.id]);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[84%] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-[#241F1B] text-[#FDFBF7]'
                      : 'bg-[#FAF5ED] border border-[#241F1B]/8 text-[#241F1B]'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-xs font-semibold text-[#EA6A27]">Lumi</span>
                      {msg.agentTrace && (
                        <button
                          type="button"
                          onClick={() => toggleTrace(msg.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#655B52] hover:text-[#241F1B]"
                        >
                          <Cpu className="w-3 h-3" />
                          <span>Multi-Agent Trace</span>
                          {showTrace ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Gentle Safety Check Callout */}
                  {msg.gentleSafetyCheck && (
                    <div className="mt-3 pt-3 border-t border-[#241F1B]/10 flex items-start gap-2.5 text-sm text-[#4B2F8A]">
                      <ShieldAlert className="w-4 h-4 text-[#7C5CE0] shrink-0 mt-0.5" />
                      <p className="font-medium">{msg.gentleSafetyCheck}</p>
                    </div>
                  )}
                </div>

                {/* Collapsible 5-Agent Architecture Trace for Hackathon Transparency */}
                {msg.agentTrace && showTrace && (
                  <div className="mt-2 max-w-[92%] sm:max-w-[84%] bg-[#EFEAFE]/65 border border-[#7C5CE0]/20 rounded-2xl p-4 text-xs text-[#2F264A] space-y-2.5">
                    <p className="font-semibold text-[#5A3EC2]">
                      5-Agent Pipeline Summary
                    </p>
                    <div className="space-y-1.5">
                      <p>
                        <span className="font-semibold">Risk & Needs Agent:</span>{' '}
                        State: {msg.agentTrace.riskAssessment.emotionalState} · Urgency:{' '}
                        {msg.agentTrace.riskAssessment.urgency} · Topics:{' '}
                        {msg.agentTrace.riskAssessment.detectedTopics.join(', ')}
                      </p>
                      <p>
                        <span className="font-semibold">Safeguarding Agent:</span>{' '}
                        {msg.agentTrace.safeguarding.guardrailNotes}
                      </p>
                      <p>
                        <span className="font-semibold">Medical RAG Sources:</span>{' '}
                        {msg.agentTrace.ragChunksUsed.map((c) => c.title).join(' · ')}
                      </p>
                      <p>
                        <span className="font-semibold">Healthcare Nav Agent:</span>{' '}
                        Matched {msg.agentTrace.matchedFacilitiesCount} verified support pathways.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actionable Care Cards */}
                {msg.careCards && msg.careCards.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[92%] sm:max-w-[84%]">
                    {msg.careCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          if (card.actionType === 'quest' && card.targetId) {
                            onOpenQuest(card.targetId);
                          } else if (card.actionType === 'scenario') {
                            onOpenScenarios();
                          } else {
                            onOpenNavigator();
                          }
                        }}
                        className="text-left bg-[#FFF0E5]/75 hover:bg-[#FFF0E5] border border-[#EA6A27]/20 rounded-2xl p-3.5 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#B8470F]">
                            {card.title}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#EA6A27] shrink-0" />
                        </div>
                        <p className="text-xs text-[#5B4437] mt-1 leading-relaxed">
                          {card.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Confidential Facilities */}
                {msg.recommendedFacilities && msg.recommendedFacilities.length > 0 && (
                  <div className="mt-2.5 w-full max-w-[92%] sm:max-w-[84%] bg-[#E5F2E9]/70 border border-[#44835E]/20 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#2E6243] inline-flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5" />
                        Recommended Confidential Support
                      </span>
                      <button
                        type="button"
                        onClick={onOpenNavigator}
                        className="text-xs font-semibold text-[#2E6243] hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {msg.recommendedFacilities.slice(0, 2).map((fac) => (
                        <div
                          key={fac.id}
                          className="bg-[#FDFBF7] rounded-xl px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-[#241F1B]">{fac.name}</p>
                            <p className="text-[#655B52]">
                              {fac.category} · {fac.cost}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#2E6243] tabular-nums shrink-0">
                            <PhoneCall className="w-3 h-3" />
                            {fac.contactValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2 max-w-[92%] sm:max-w-[84%]">
                    {msg.suggestedFollowUps.map((followUp) => (
                      <button
                        key={followUp}
                        type="button"
                        disabled={isLoading}
                        onClick={() => void sendMessage(followUp)}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#F3ECE0] hover:bg-[#EAE0CF] text-xs font-medium text-[#241F1B] transition-colors disabled:opacity-50"
                      >
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-sm text-[#655B52] pl-1">
              <Sparkles className="w-4 h-4 text-[#EA6A27]" />
              <span>Lumi is checking medical facts and preparing a thoughtful reply…</span>
            </div>
          )}

          {errorBanner && (
            <div className="rounded-2xl bg-[#FFF0E5] border border-[#EA6A27]/30 p-4 text-sm text-[#6A2706] space-y-2">
              <p className="font-semibold">Unable to connect to Lumi right now</p>
              <p>{errorBanner}</p>
              <button
                type="button"
                onClick={onOpenNavigator}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8470F] hover:underline"
              >
                <span>Open 24/7 Helplines & Healthcare Navigator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="p-3 sm:p-4 border-t border-[#241F1B]/10 bg-[#FAF5ED]/70 rounded-b-3xl flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lumi anything—your questions are safe here..."
            aria-label="Ask Lumi a question"
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FDFBF7] border border-[#241F1B]/12 text-sm text-[#241F1B] placeholder:text-[#8C8074] focus:outline-none focus:border-[#EA6A27]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message to Lumi"
            className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45818] disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </div>
  );
}
