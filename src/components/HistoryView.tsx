import { deleteDoc, doc } from 'firebase/firestore';
import { ArrowRight, History, MessageSquarePlus, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { ConversationThread } from '../types/seremate';

interface HistoryViewProps {
  uid: string;
  isDemoMode?: boolean;
  conversations: ConversationThread[];
  onOpenConversation: (conversationId: string) => void;
  onStartNewChat: () => void;
  onDeleteDemoConversation?: (conversationId: string) => void;
}

export function HistoryView({
  uid,
  isDemoMode = false,
  conversations,
  onOpenConversation,
  onStartNewChat,
  onDeleteDemoConversation,
}: HistoryViewProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.lastMessagePreview.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const handleDelete = async (convId: string) => {
    if (isDemoMode) {
      onDeleteDemoConversation?.(convId);
      return;
    }
    const path = `users/${uid}/conversations/${convId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#553CB5]">Private Conversation History</p>
          <h1 className="font-display text-3xl font-semibold text-[#241F1B] mt-1">
            Your saved chats with Sere
          </h1>
          <p className="text-sm text-[#5F554D] mt-1">
            Only you can view or delete your conversation history.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartNewChat}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold whitespace-nowrap transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Start New Chat</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your conversations..."
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFFDF9] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-8 text-center space-y-3">
          <History className="w-8 h-8 text-[#8C8074] mx-auto" />
          <h2 className="font-display text-xl font-semibold text-[#241F1B]">
            {conversations.length === 0 ? 'No saved conversations yet' : 'No matching threads'}
          </h2>
          <p className="text-sm text-[#5F554D]">
            {conversations.length === 0
              ? 'Start a chat with Sere and it will be saved privately here.'
              : 'Try a different search keyword.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => (
            <div
              key={conv.id}
              className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4"
            >
              <button
                type="button"
                onClick={() => onOpenConversation(conv.id)}
                className="flex-1 text-left min-w-0 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#241F1B] truncate">
                    {conv.title}
                  </span>
                  {conv.safetyFlagged && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B44A14] shrink-0">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Support info
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5F554D] truncate">
                  {conv.lastMessagePreview || 'Open conversation'}
                </p>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenConversation(conv.id)}
                  className="min-h-[40px] inline-flex items-center gap-1 px-3.5 py-2 rounded-2xl bg-[#FFF0E5] hover:bg-[#FFE3D0] text-xs font-semibold text-[#B44A14]"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(conv.id)}
                  aria-label="Delete conversation"
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-2xl text-[#8C8074] hover:text-[#EA6A27] hover:bg-[#FFF0E5]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
