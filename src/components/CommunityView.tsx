import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  CalendarHeart,
  CheckCircle2,
  Flag,
  Heart,
  MessageCircleHeart,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  BASELINE_COMMUNITY_POSTS,
  COMMUNITY_ACTIVITIES,
  PEER_ALIASES,
  WEEKLY_POLL_OPTIONS,
} from '../data/communityData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { getUiStrings, type AppLanguage } from '../i18n/languages';
import type { CommunityPostDoc, CommunityTopic } from '../types/seremate';
import { SereMascot } from './SereMascot';

interface CommunityViewProps {
  uid: string;
  language: AppLanguage;
  isDemoMode?: boolean;
  communityPosts: CommunityPostDoc[];
  onAskCompanion: (prompt: string) => void;
  onOpenReportModal: (relatedTopic: string) => void;
  onDemoCreatePost?: (post: CommunityPostDoc) => void;
  onDemoHugPost?: (postId: string) => void;
  onDemoDeletePost?: (postId: string) => void;
}

const TOPICS: Array<'All' | CommunityTopic> = [
  'All',
  'Encouragement',
  'Period Health',
  'Pregnancy Worry',
  'Boundaries & Consent',
  'Wellness Habits',
];

const POST_TOPICS: CommunityTopic[] = [
  'Encouragement',
  'Period Health',
  'Pregnancy Worry',
  'Boundaries & Consent',
  'Wellness Habits',
];

function containsUnsafeOrPiiContent(text: string): string | null {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    return 'For your safety and privacy, please do not include email addresses in community notes.';
  }
  if (/(\+?\d[\d\s\-()]{6,}\d)/.test(text)) {
    return 'For your safety and privacy, please avoid sharing phone numbers or personal IDs.';
  }
  if (/https?:\/\/|www\./i.test(text)) {
    return 'External links are disabled in the peer wall to keep teens safe.';
  }
  return null;
}

export function CommunityView({
  uid,
  language,
  isDemoMode = false,
  communityPosts,
  onAskCompanion,
  onOpenReportModal,
  onDemoCreatePost,
  onDemoHugPost,
  onDemoDeletePost,
}: CommunityViewProps) {
  const ui = getUiStrings(language);
  const [topicFilter, setTopicFilter] = useState<'All' | CommunityTopic>('All');
  const [joinedIds, setJoinedIds] = useState<string[]>(['act-wellness-challenge']);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [huggedIds, setHuggedIds] = useState<string[]>([]);
  const [baselineHugs, setBaselineHugs] = useState<Record<string, number>>({});
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);

  const [newAlias, setNewAlias] = useState<string>(PEER_ALIASES[0]);
  const [newTopic, setNewTopic] = useState<CommunityTopic>('Encouragement');
  const [newMessage, setNewMessage] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const allPosts = useMemo(() => {
    const merged = [...communityPosts, ...BASELINE_COMMUNITY_POSTS];
    if (topicFilter === 'All') return merged;
    return merged.filter((p) => p.topic === topicFilter);
  }, [communityPosts, topicFilter]);

  const totalPollVotes = useMemo(() => {
    return (
      WEEKLY_POLL_OPTIONS.reduce((acc, opt) => acc + opt.baseVotes, 0) +
      (selectedPollId ? 1 : 0)
    );
  }, [selectedPollId]);

  const toggleJoinActivity = (id: string) => {
    setJoinedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCompleteActivity = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendHug = async (post: CommunityPostDoc) => {
    if (huggedIds.includes(post.id)) return;
    setHuggedIds((prev) => [...prev, post.id]);

    if (post.isBaseline) {
      setBaselineHugs((prev) => ({
        ...prev,
        [post.id]: (prev[post.id] || 0) + 1,
      }));
      return;
    }

    if (isDemoMode) {
      onDemoHugPost?.(post.id);
      return;
    }

    const path = `community_posts/${post.id}`;
    try {
      await updateDoc(doc(db, path), {
        hugsCount: post.hugsCount + 1,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeletePost = async (post: CommunityPostDoc) => {
    if (post.isBaseline) return;
    if (isDemoMode) {
      onDemoDeletePost?.(post.id);
      return;
    }
    const path = `community_posts/${post.id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handlePublishNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostError(null);
    setPostStatus(null);

    const cleanMessage = newMessage.trim();
    if (cleanMessage.length < 5 || cleanMessage.length > 360) {
      setPostError('Please write a kind note between 5 and 360 characters.');
      return;
    }

    const safetyIssue = containsUnsafeOrPiiContent(cleanMessage);
    if (safetyIssue) {
      setPostError(safetyIssue);
      return;
    }

    const cleanAlias = newAlias.trim().slice(0, 40) || 'Kind Sprout';

    if (isDemoMode) {
      onDemoCreatePost?.({
        id: `demo-post-${Date.now()}`,
        authorUid: uid,
        authorAlias: cleanAlias,
        topic: newTopic,
        message: cleanMessage,
        hugsCount: 0,
        approved: true,
        createdAt: Date.now(),
      });
      setNewMessage('');
      setPostStatus('Your anonymous peer note is posted in this demo session.');
      return;
    }

    setIsPosting(true);
    try {
      await addDoc(collection(db, 'community_posts'), {
        authorUid: uid,
        authorAlias: cleanAlias,
        topic: newTopic,
        message: cleanMessage,
        hugsCount: 0,
        approved: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewMessage('');
      setPostStatus('Your kind note has been shared safely with the community.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'community_posts');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cute Hero Header */}
      <section className="bg-[#EFEAFE]/85 border border-[#6B4FD3]/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <SereMascot
            mood={completedIds.length > 0 ? 'celebrating' : 'encouraging'}
            size="md"
          />
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#553CB5]">
              {ui.community.badge}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B]">
              {ui.community.title}
            </h1>
            <p className="text-sm text-[#453973] max-w-2xl leading-relaxed">
              {ui.community.subtitle}
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF9] border border-[#6B4FD3]/15 rounded-2xl px-5 py-3.5 text-center shrink-0">
          <p className="text-xs text-[#553CB5] font-medium">Activities Joined</p>
          <p className="font-display text-2xl font-semibold text-[#241F1B] tabular-nums mt-0.5">
            {joinedIds.length} / {COMMUNITY_ACTIVITIES.length}
          </p>
        </div>
      </section>

      {/* Section 1: Peer & Community Activities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#B44A14]">Community Activities</p>
            <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
              Youth circles & weekly challenges
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMUNITY_ACTIVITIES.map((act, idx) => {
            const isJoined = joinedIds.includes(act.id);
            const isDone = completedIds.includes(act.id);
            const tint =
              idx % 2 === 0
                ? 'bg-[#FFF0E5]/70 border-[#EA6A27]/15'
                : 'bg-[#E5F2E9]/70 border-[#44835E]/15';

            return (
              <article
                key={act.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between gap-4 ${tint}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5F554D] tabular-nums">
                    <span className="font-semibold text-[#241F1B]">
                      {act.category} · {act.scheduleLabel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {act.participantsCount + (isJoined ? 1 : 0)} peers
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#241F1B]">
                    {act.title}
                  </h3>
                  <p className="text-sm text-[#5F554D] leading-relaxed">{act.description}</p>
                  <p className="text-xs text-[#5F554D]">Hosted by {act.hostLabel}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#241F1B]/8">
                  <button
                    type="button"
                    onClick={() => toggleJoinActivity(act.id)}
                    className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      isJoined
                        ? 'bg-[#241F1B] text-white'
                        : 'bg-[#EA6A27] hover:bg-[#D45819] text-white'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join Activity'}
                  </button>

                  {isJoined && (
                    <button
                      type="button"
                      onClick={() => toggleCompleteActivity(act.id)}
                      className={`min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        isDone
                          ? 'bg-[#44835E] text-white'
                          : 'bg-[#FFFDF9] hover:bg-white text-[#244D36]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onAskCompanion(act.promptForSere)}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FFFDF9] hover:bg-white text-xs font-semibold text-[#B44A14] whitespace-nowrap transition-colors"
                  >
                    <MessageCircleHeart className="w-3.5 h-3.5" />
                    <span>Explore with Sere</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section 2: Peer Encouragement Wall + Weekly Community Poll */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Encouragement Wall */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#241F1B]">
                  Share a kind peer note
                </h2>
                <p className="text-xs text-[#5F554D] mt-0.5">
                  Posted under a cute nature alias. Please never include real names, phone numbers, or social handles.
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-[#EA6A27] shrink-0" />
            </div>

            {postError && (
              <div
                role="alert"
                className="rounded-2xl bg-[#FFF0E5] border border-[#EA6A27]/30 p-3 text-xs text-[#7A2D15]"
              >
                {postError}
              </div>
            )}
            {postStatus && (
              <div
                role="status"
                className="rounded-2xl bg-[#E5F2E9] border border-[#44835E]/25 p-3 text-xs text-[#244D36]"
              >
                {postStatus}
              </div>
            )}

            <form onSubmit={(e) => void handlePublishNote(e)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="peer-alias" className="block text-xs font-semibold text-[#241F1B]">
                    Choose Safe Nickname
                  </label>
                  <select
                    id="peer-alias"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-xs sm:text-sm text-[#241F1B]"
                  >
                    {PEER_ALIASES.map((alias) => (
                      <option key={alias} value={alias}>
                        {alias}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="peer-topic" className="block text-xs font-semibold text-[#241F1B]">
                    Topic
                  </label>
                  <select
                    id="peer-topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value as CommunityTopic)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-xs sm:text-sm text-[#241F1B]"
                  >
                    {POST_TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                rows={3}
                maxLength={360}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a gentle encouragement or share what helped you feel calmer..."
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] placeholder:text-[#8C8074] focus:outline-none focus:border-[#6B4FD3]"
              />

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#8C8074] tabular-nums">
                  {newMessage.length}/360
                </span>
                <button
                  type="submit"
                  disabled={isPosting || newMessage.trim().length < 5}
                  className="min-h-[42px] inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#6B4FD3] hover:bg-[#553CB5] disabled:opacity-45 text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isPosting ? 'Sharing…' : 'Post Kindly'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Topic Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopicFilter(t)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  topicFilter === t
                    ? 'bg-[#EA6A27] text-white'
                    : 'bg-[#F3ECE1] text-[#241F1B] hover:bg-[#FFF0E5]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Peer Notes Feed */}
          <div className="space-y-3">
            {allPosts.map((post) => {
              const hasHugged = huggedIds.includes(post.id);
              const displayHugs =
                post.hugsCount + (post.isBaseline ? baselineHugs[post.id] || 0 : 0);
              const isAuthor = !post.isBaseline && post.authorUid === uid;

              return (
                <article
                  key={post.id}
                  className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[#553CB5]">
                      {post.authorAlias} <span aria-hidden="true">·</span>{' '}
                      <span className="text-[#5F554D] font-medium">{post.topic}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      {isAuthor && (
                        <button
                          type="button"
                          onClick={() => void handleDeletePost(post)}
                          aria-label="Delete your community note"
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl text-[#8C8074] hover:text-[#EA6A27]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenReportModal(`Community Note: ${post.authorAlias}`)}
                        aria-label="Report peer note"
                        className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-xl text-[#8C8074] hover:text-[#EA6A27]"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-[15px] text-[#241F1B] leading-relaxed">
                    {post.message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => void handleSendHug(post)}
                      className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold tabular-nums transition-colors ${
                        hasHugged
                          ? 'bg-[#FFF0E5] text-[#EA6A27]'
                          : 'bg-[#FAF5EE] hover:bg-[#FFF0E5] text-[#5F554D]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${hasHugged ? 'fill-[#EA6A27] text-[#EA6A27]' : ''}`}
                      />
                      <span>{hasHugged ? 'Hug Sent' : 'Send Hug'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{displayHugs}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right: Weekly Peer Reflection Poll & Community Guidelines */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[#FEF6DF]/90 border border-[#D49B2A]/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#7A530B]">
              <CalendarHeart className="w-4 h-4" />
              <span>Weekly Peer Poll</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-[#241F1B]">
              Which topic should Sere spotlight in our next peer Q&amp;A?
            </h3>

            <div className="space-y-2.5">
              {WEEKLY_POLL_OPTIONS.map((opt) => {
                const isSelected = selectedPollId === opt.id;
                const count = opt.baseVotes + (isSelected ? 1 : 0);
                const pct = Math.round((count / totalPollVotes) * 100);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPollId(opt.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors space-y-1.5 ${
                      isSelected
                        ? 'bg-[#FFFDF9] border-[#EA6A27]/40'
                        : 'bg-[#FFFDF9]/75 hover:bg-[#FFFDF9] border-[#241F1B]/8'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#241F1B]">
                      <span>{opt.label}</span>
                      {selectedPollId && <span className="tabular-nums text-[#B44A14]">{pct}%</span>}
                    </div>
                    {selectedPollId && (
                      <div className="h-1.5 rounded-full bg-[#F3ECE1] overflow-hidden">
                        <div
                          className="h-full bg-[#EA6A27] rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#7A530B] tabular-nums">
              {totalPollVotes} anonymous peer votes this week
            </p>
          </div>

          <div className="bg-[#E5F2E9]/85 border border-[#44835E]/15 rounded-3xl p-6 space-y-2">
            <p className="text-xs font-semibold text-[#2E5E44]">Community Kindness Rules</p>
            <ul className="text-xs text-[#244D36] space-y-1.5 leading-relaxed list-disc pl-4">
              <li>Zero shaming, teasing, or judgment—everyone starts from curiosity.</li>
              <li>Protect privacy: use aliases only, never real names or contact info.</li>
              <li>Peers share support, never medical diagnoses—ask a doctor for symptoms.</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
