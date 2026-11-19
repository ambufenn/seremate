import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  AlertTriangle,
  ArrowRight,
  Flag,
  MessageSquarePlus,
  Send,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { getUiStrings, type AppLanguage } from '../i18n/languages';
import type {
  ChatMessageDoc,
  ConversationThread,
  SafetyLevel,
  SereMateTab,
  UserProfile,
} from '../types/seremate';
import { SereMascot, type SereMood } from './SereMascot';

interface CompanionViewProps {
  profile: UserProfile;
  language: AppLanguage;
  isDemoMode?: boolean;
  conversations: ConversationThread[];
  activeConversationId: string | null;
  demoMessagesMap?: Record<string, ChatMessageDoc[]>;
  pendingStarterPrompt: string | null;
  onClearStarterPrompt: () => void;
  onSelectConversation: (conversationId: string | null) => void;
  onNavigate: (tab: SereMateTab) => void;
  onOpenReportModal: (relatedTopic: string) => void;
  onDemoCreateConversation?: (conv: ConversationThread) => void;
  onDemoAppendMessage?: (convId: string, msg: ChatMessageDoc) => void;
  onDemoUpdateConversation?: (convId: string, preview: string, safetyFlagged: boolean) => void;
  onDemoDeleteConversation?: (convId: string) => void;
}

export function CompanionView({
  profile,
  language,
  isDemoMode = false,
  conversations,
  activeConversationId,
  demoMessagesMap,
  pendingStarterPrompt,
  onClearStarterPrompt,
  onSelectConversation,
  onNavigate,
  onOpenReportModal,
  onDemoCreateConversation,
  onDemoAppendMessage,
  onDemoUpdateConversation,
  onDemoDeleteConversation,
}: CompanionViewProps) {
  const ui = getUiStrings(language);
  const [messages, setMessages] = useState<ChatMessageDoc[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [optimisticUserText, setOptimisticUserText] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [latestSafetyBanner, setLatestSafetyBanner] = useState<string | null>(null);
  const [latestSafetyLevel, setLatestSafetyLevel] = useState<SafetyLevel>('routine');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState<{ aiConfigured: boolean; modelName: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const mascotMood: SereMood = isSending
    ? 'thinking'
    : latestSafetyLevel !== 'routine'
    ? 'empathetic'
    : 'encouraging';

  useEffect(() => {
    fetch('/api/config/status')
      .then((res) => res.json())
      .then((data: { aiConfigured?: boolean; modelName?: string }) => {
        setAiStatus({
          aiConfigured: Boolean(data.aiConfigured),
          modelName: data.modelName || 'gemini-4-hydrogen',
        });
      })
      .catch(() => {
        setAiStatus(null);
      });
  }, []);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setLatestSafetyBanner(null);
      setLatestSafetyLevel('routine');
      setFollowUps([]);
      return;
    }

    if (isDemoMode) {
      setMessages(demoMessagesMap?.[activeConversationId] || []);
      return;
    }

    const msgPath = `users/${profile.uid}/conversations/${activeConversationId}/messages`;
    const q = query(collection(db, msgPath), where('userId', '==', profile.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const toMs = (ts: unknown): number => {
          if (
            ts &&
            typeof ts === 'object' &&
            'toMillis' in ts &&
            typeof (ts as { toMillis: () => number }).toMillis === 'function'
          ) {
            return (ts as { toMillis: () => number }).toMillis();
          }
          return Date.now();
        };
        const list = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessageDoc, 'id'>),
          }))
          .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
        setMessages(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, msgPath);
      }
    );

    return () => unsubscribe();
  }, [activeConversationId, profile.uid, isDemoMode, demoMessagesMap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isSending, optimisticUserText]);

  const createConversationAndSend = async (
    rawText: string,
    options?: { isRetry?: boolean }
  ) => {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    setErrorBanner(null);
    setLastFailedPrompt(null);
    setFollowUps([]);
    setIsSending(true);
    if (!options?.isRetry) {
      setInput('');
    }

    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Start Gemini request immediately without waiting on Firestore roundtrips
    const chatPromise = fetch('/api/seremate/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: trimmed,
        history: historyPayload,
        ageBracket: profile.ageBracket,
        preferredLanguage: language,
      }),
    });

    let convId = activeConversationId;
    let userPersistPromise: Promise<void> = Promise.resolve();

    if (isDemoMode) {
      if (!convId) {
        const title = trimmed.slice(0, 65) + (trimmed.length > 65 ? '…' : '');
        convId = `demo-conv-${Date.now()}`;
        onDemoCreateConversation?.({
          id: convId,
          userId: profile.uid,
          title,
          lastMessagePreview: trimmed.slice(0, 120),
          safetyFlagged: false,
        });
        onSelectConversation(convId);
      }
      if (!options?.isRetry) {
        onDemoAppendMessage?.(convId, {
          id: `demo-msg-u-${Date.now()}`,
          conversationId: convId,
          userId: profile.uid,
          role: 'user',
          content: trimmed.slice(0, 4000),
          safetyLevel: 'routine',
        });
      }
    } else {
      if (!options?.isRetry) {
        setOptimisticUserText(trimmed);
      }
      userPersistPromise = (async () => {
        if (!convId) {
          const convPath = `users/${profile.uid}/conversations`;
          const title = trimmed.slice(0, 65) + (trimmed.length > 65 ? '…' : '');
          try {
            const created = await addDoc(collection(db, convPath), {
              userId: profile.uid,
              title,
              lastMessagePreview: trimmed.slice(0, 120),
              safetyFlagged: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            convId = created.id;
            onSelectConversation(convId);
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, convPath);
            return;
          }
        }
        if (!options?.isRetry) {
          const msgPath = `users/${profile.uid}/conversations/${convId}/messages`;
          try {
            await addDoc(collection(db, msgPath), {
              conversationId: convId,
              userId: profile.uid,
              role: 'user',
              content: trimmed.slice(0, 4000),
              safetyLevel: 'routine',
              createdAt: serverTimestamp(),
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, msgPath);
          }
        }
      })();
    }

    try {
      const apiRes = await chatPromise;
      const data = (await apiRes.json().catch(() => ({}))) as {
        error?: string;
        reply?: string;
        safetyLevel?: SafetyLevel;
        safetyBanner?: string | null;
        suggestedFollowUps?: string[];
        recommendedGuidanceCategory?: string;
      };

      if (!apiRes.ok) {
        throw new Error(data.error || 'Unable to receive a response from SereMate AI.');
      }

      const finalReply = (data.reply || '').trim();
      const safetyLevel: SafetyLevel = data.safetyLevel || 'routine';
      const safetyBanner: string | null = data.safetyBanner || null;
      const nextFollowUps = Array.isArray(data.suggestedFollowUps) ? data.suggestedFollowUps : [];
      const guidanceCategory = data.recommendedGuidanceCategory || 'General';

      if (!finalReply.trim()) {
        throw new Error('Maaf, respons Gemini kosong. Coba kirim pertanyaan sekali lagi ya.');
      }

      setLatestSafetyLevel(safetyLevel);
      setLatestSafetyBanner(safetyBanner);
      setFollowUps(nextFollowUps);

      await userPersistPromise;
      setOptimisticUserText(null);

      if (isDemoMode) {
        onDemoAppendMessage?.(convId!, {
          id: `demo-msg-a-${Date.now()}`,
          conversationId: convId!,
          userId: profile.uid,
          role: 'assistant',
          content: finalReply.slice(0, 4000),
          safetyLevel,
        });
        onDemoUpdateConversation?.(
          convId!,
          finalReply.slice(0, 180),
          safetyLevel !== 'routine'
        );
      } else if (convId) {
        const msgPath = `users/${profile.uid}/conversations/${convId}/messages`;
        try {
          await addDoc(collection(db, msgPath), {
            conversationId: convId,
            userId: profile.uid,
            role: 'assistant',
            content: finalReply.slice(0, 4000),
            safetyLevel,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, msgPath);
        }

        const convDocPath = `users/${profile.uid}/conversations/${convId}`;
        try {
          await updateDoc(doc(db, convDocPath), {
            lastMessagePreview: finalReply.slice(0, 180),
            safetyFlagged: safetyLevel !== 'routine',
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, convDocPath);
        }

        try {
          await addDoc(collection(db, 'usage_events'), {
            eventType: 'chat_turn',
            topicCategory: String(guidanceCategory).slice(0, 80),
            safetyTriggered: safetyLevel !== 'routine',
            createdAt: serverTimestamp(),
          });
        } catch {
          // Non-blocking telemetry
        }
      }
    } catch (err) {
      await userPersistPromise.catch(() => undefined);
      setOptimisticUserText(null);
      setLastFailedPrompt(trimmed);
      setErrorBanner(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (pendingStarterPrompt) {
      const prompt = pendingStarterPrompt;
      onClearStarterPrompt();
      void createConversationAndSend(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStarterPrompt]);

  const handleDeleteConversation = async (convId: string) => {
    if (isDemoMode) {
      onDemoDeleteConversation?.(convId);
      if (activeConversationId === convId) {
        onSelectConversation(null);
      }
      return;
    }
    const convDocPath = `users/${profile.uid}/conversations/${convId}`;
    try {
      await deleteDoc(doc(db, convDocPath));
      if (activeConversationId === convId) {
        onSelectConversation(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, convDocPath);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar: Companion Profile, Threads & Safety */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <SereMascot mood={mascotMood} size="sm" />
              <div>
                <h1 className="font-display text-xl font-semibold text-[#241F1B]">
                  {ui.companion.title}
                </h1>
                <p className="text-xs text-[#5F554D]">{ui.companion.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectConversation(null);
                setLatestSafetyBanner(null);
                setFollowUps([]);
                setErrorBanner(null);
              }}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{ui.companion.newChat}</span>
            </button>
          </div>

          {aiStatus && !aiStatus.aiConfigured && (
            <div className="rounded-2xl bg-[#FFF0E5] border border-[#EA6A27]/30 p-3.5 text-xs text-[#7A2D15] space-y-1">
              <p className="font-semibold">AI Provider Configuration Needed</p>
              <p>
                Server environment variable <code>GEMINI_API_KEY</code> is not configured. Health Guides, Assessment, and Care Finder remain available.
              </p>
            </div>
          )}

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <p className="text-xs font-semibold text-[#5F554D]">Your Conversations</p>
            {conversations.length === 0 ? (
              <p className="text-xs text-[#8C8074] py-3">
                No chats yet. Start a gentle conversation with Sere anytime.
              </p>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 transition-colors ${
                      isSelected ? 'bg-[#FFF0E5]' : 'hover:bg-[#FAF5EE]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-xs font-semibold text-[#241F1B] truncate">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-[#5F554D] truncate">
                        {conv.lastMessagePreview}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteConversation(conv.id)}
                      aria-label={`Delete ${conv.title}`}
                      className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-xl text-[#8C8074] hover:text-[#EA6A27]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Safeguarding Card */}
        <div className="bg-[#EFEAFE]/80 border border-[#6B4FD3]/15 rounded-3xl p-5 space-y-2.5">
          <p className="text-xs font-semibold text-[#553CB5]">Safety & Care Notice</p>
          <p className="text-xs text-[#453973] leading-relaxed">
            Sere shares educational support, never diagnoses or prescriptions. See something concerning?
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenReportModal('AI Health Companion')}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#FFFDF9] text-xs font-semibold text-[#241F1B] hover:bg-white transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-[#EA6A27]" />
              <span>Report Concern</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('support')}
              className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold text-[#553CB5] hover:underline"
            >
              <span>Find Care</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Conversational Panel */}
      <section className="lg:col-span-8 bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl flex flex-col min-h-[540px] max-h-[78vh]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && !optimisticUserText ? (
            <div className="py-4 space-y-6">
              <div className="bg-[#FFF0E5]/75 border border-[#EA6A27]/15 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <SereMascot mood="encouraging" size="md" />
                <div className="text-center sm:text-left space-y-1">
                  <p className="text-xs font-semibold text-[#B44A14]">
                    {ui.companion.safeTitle}
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                    {ui.companion.mindTitle}
                  </h2>
                  <p className="text-sm text-[#5F554D] leading-relaxed">
                    {ui.companion.mindDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ui.companion.starters.map((starter, idx) => {
                  const tint =
                    idx % 3 === 0
                      ? 'bg-[#FFF0E5]/55 hover:bg-[#FFF0E5]'
                      : idx % 3 === 1
                      ? 'bg-[#EFEAFE]/55 hover:bg-[#EFEAFE]'
                      : 'bg-[#E5F2E9]/55 hover:bg-[#E5F2E9]';
                  return (
                    <button
                      key={starter}
                      type="button"
                      disabled={isSending}
                      onClick={() => void createConversationAndSend(starter)}
                      className={`text-left p-4 rounded-2xl border border-[#241F1B]/8 text-xs sm:text-sm font-medium text-[#241F1B] transition-colors disabled:opacity-50 ${tint}`}
                    >
                      {starter}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && <SereMascot mood="calm" size="xs" className="mb-1" />}
                    <div
                      className={`max-w-[88%] sm:max-w-[78%] rounded-3xl px-4 py-3.5 text-[15px] leading-relaxed ${
                        isUser
                          ? 'bg-[#EA6A27] text-white'
                          : 'bg-[#FFF0E5]/75 border border-[#EA6A27]/15 text-[#241F1B]'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-xs font-semibold text-[#B44A14]">Sere</span>
                          {msg.safetyLevel !== 'routine' && (
                            <span className="text-[11px] font-semibold text-[#553CB5]">
                              Support Info Included
                            </span>
                          )}
                        </div>
                      )}
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </div>
                  </div>
                );
              })}

              {optimisticUserText &&
                messages[messages.length - 1]?.content !== optimisticUserText && (
                  <div className="flex items-end gap-2.5 justify-end">
                    <div className="max-w-[88%] sm:max-w-[78%] rounded-3xl px-4 py-3.5 text-[15px] leading-relaxed bg-[#EA6A27] text-white">
                      <div className="whitespace-pre-line">{optimisticUserText}</div>
                    </div>
                  </div>
                )}
            </>
          )}

          {latestSafetyBanner && (
            <div
              className={`rounded-2xl border p-4 flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${
                latestSafetyLevel === 'urgent'
                  ? 'bg-[#FFF0E5] border-[#EA6A27]/40 text-[#7A2D15]'
                  : 'bg-[#E5F2E9] border-[#44835E]/30 text-[#204531]'
              }`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>{latestSafetyBanner}</p>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  <span>View Care & Emergency Support Options</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {followUps.length > 0 && !isSending && (
            <div className="flex flex-wrap gap-2 pt-1">
              {followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => void createConversationAndSend(f)}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-2xl bg-[#EFEAFE]/75 hover:bg-[#EFEAFE] text-xs font-medium text-[#3C2885] transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {isSending && (
            <div className="flex items-center gap-2.5 pl-1">
              <SereMascot mood="thinking" size="xs" />
              <p className="text-xs font-medium text-[#5F554D]">
                {ui.companion.replying}
              </p>
            </div>
          )}

          {errorBanner && (
            <div
              role="alert"
              className="rounded-2xl bg-[#FFF0E5] border border-[#EA6A27]/35 p-4 flex items-start justify-between gap-3 text-xs sm:text-sm text-[#7A2D15]"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Sere temporarily busy</p>
                  <p>{errorBanner}</p>
                </div>
              </div>
              {lastFailedPrompt && (
                <button
                  type="button"
                  onClick={() => void createConversationAndSend(lastFailedPrompt, { isRetry: true })}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void createConversationAndSend(input);
          }}
          className="p-3 sm:p-4 border-t border-[#241F1B]/8 bg-[#FAF5EE]/75 rounded-b-3xl flex items-center gap-2.5"
        >
          <input
            type="text"
            maxLength={2000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ui.companion.placeholder}
            aria-label="Ask Sere AI Companion"
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#241F1B]/12 text-sm text-[#241F1B] placeholder:text-[#8C8074] focus:outline-none focus:border-[#EA6A27]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{ui.companion.send}</span>
          </button>
        </form>
      </section>
    </div>
  );
}
