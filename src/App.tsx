import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { AdminView } from './components/AdminView';
import { AssessmentView } from './components/AssessmentView';
import { AuthPortal, SereMateLogoMark } from './components/AuthPortal';
import { CommunityView } from './components/CommunityView';
import { CompanionView } from './components/CompanionView';
import { DashboardView } from './components/DashboardView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GuidanceView } from './components/GuidanceView';
import { HistoryView } from './components/HistoryView';
import { PregnancyCareView } from './components/PregnancyCareView';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { ProfileView } from './components/ProfileView';
import { ReportSafetyModal } from './components/ReportSafetyModal';
import { SereMateNav } from './components/SereMateNav';
import { SupportNavigatorView } from './components/SupportNavigatorView';
import { BASELINE_GUIDANCE_ARTICLES } from './data/guidanceLibrary';
import { BASELINE_SUPPORT_RESOURCES } from './data/supportResources';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import type {
  AssessmentResultDoc,
  ChatMessageDoc,
  CommunityPostDoc,
  ConversationThread,
  GuidanceArticle,
  HealthcareResource,
  SereMateTab,
  UserProfile,
} from './types/seremate';

const DEMO_SESSION_STORAGE_KEY = 'seremate_demo_session_v1';

const DEFAULT_DEMO_PROFILE: UserProfile = {
  uid: 'demo-session',
  displayName: 'Demo Explorer',
  email: 'demo@seremate.local',
  ageBracket: '16-17',
  role: 'user',
  privacyOptOutTraining: true,
  acceptedPrivacyPolicy: true,
};

function toEpochMs(ts: unknown): number {
  if (ts && typeof ts === 'object' && 'toMillis' in ts && typeof (ts as { toMillis: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  if (typeof ts === 'number') {
    return ts;
  }
  return 0;
}

function SereMateAppShell() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY) === 'active';
  });
  const [demoProfile, setDemoProfile] = useState<UserProfile>(DEFAULT_DEMO_PROFILE);
  const [demoConversations, setDemoConversations] = useState<ConversationThread[]>([]);
  const [demoMessagesMap, setDemoMessagesMap] = useState<Record<string, ChatMessageDoc[]>>({});
  const [demoAssessments, setDemoAssessments] = useState<AssessmentResultDoc[]>([]);
  const [demoCommunityPosts, setDemoCommunityPosts] = useState<CommunityPostDoc[]>([]);

  const [activeTab, setActiveTab] = useState<SereMateTab>('dashboard');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [pendingStarterPrompt, setPendingStarterPrompt] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [assessments, setAssessments] = useState<AssessmentResultDoc[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostDoc[]>([]);
  const [firestoreArticles, setFirestoreArticles] = useState<GuidanceArticle[]>([]);
  const [firestoreResources, setFirestoreResources] = useState<HealthcareResource[]>([]);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTopic, setReportTopic] = useState('General');
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // 1. Auth Session Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setIsAdmin(false);
        setConversations([]);
        setAssessments([]);
        setAuthReady(true);
        return;
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
      }
      setIsDemoMode(false);

      // Check admin eligibility (verified runtime admin email or admins/{uid} doc)
      let adminStatus =
        user.email === 'fenirathings@gmail.com' && user.emailVerified === true;
      if (!adminStatus) {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', user.uid));
          adminStatus = adminSnap.exists();
        } catch {
          adminStatus = false;
        }
      }
      setIsAdmin(adminStatus);

      // Ensure profile document exists
      const profileRef = doc(db, 'users', user.uid);
      try {
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'SereMate Member',
            email: user.email || 'member@seremate.local',
            ageBracket: '16-17',
            role: 'user',
            privacyOptOutTraining: true,
            acceptedPrivacyPolicy: true,
          };
          await setDoc(profileRef, {
            ...fallbackProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // 2. Authenticated Firestore Listeners (skipped during Demo Mode)
  useEffect(() => {
    if (isDemoMode || !authReady || !firebaseUser) return;

    const uid = firebaseUser.uid;

    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const convPath = `users/${uid}/conversations`;
    const unsubConvs = onSnapshot(
      query(collection(db, convPath), where('userId', '==', uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ConversationThread, 'id'>) }))
          .sort((a, b) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt));
        setConversations(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, convPath)
    );

    const assessPath = `users/${uid}/assessments`;
    const unsubAssess = onSnapshot(
      query(collection(db, assessPath), where('userId', '==', uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<AssessmentResultDoc, 'id'>) }))
          .sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
        setAssessments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, assessPath)
    );

    const unsubArticles = onSnapshot(
      query(collection(db, 'guidance_articles'), where('published', '==', true)),
      (snap) => {
        setFirestoreArticles(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GuidanceArticle, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'guidance_articles')
    );

    const unsubResources = onSnapshot(
      query(collection(db, 'healthcare_resources'), where('active', '==', true)),
      (snap) => {
        setFirestoreResources(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<HealthcareResource, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'healthcare_resources')
    );

    const unsubCommunity = onSnapshot(
      query(collection(db, 'community_posts'), where('approved', '==', true)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<CommunityPostDoc, 'id'>) }))
          .sort((a, b) => toEpochMs(b.createdAt) - toEpochMs(a.createdAt));
        setCommunityPosts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'community_posts')
    );

    return () => {
      unsubProfile();
      unsubConvs();
      unsubAssess();
      unsubArticles();
      unsubResources();
      unsubCommunity();
    };
  }, [authReady, firebaseUser, isDemoMode]);

  const guidanceArticles = useMemo(() => {
    return firestoreArticles.length > 0 ? firestoreArticles : BASELINE_GUIDANCE_ARTICLES;
  }, [firestoreArticles]);

  const supportResources = useMemo(() => {
    return firestoreResources.length > 0 ? firestoreResources : BASELINE_SUPPORT_RESOURCES;
  }, [firestoreResources]);

  const handleStartDemo = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, 'active');
    }
    setIsDemoMode(true);
    setActiveTab('dashboard');
    setActiveConversationId(null);
    setPendingStarterPrompt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitDemo = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    }
    setIsDemoMode(false);
    setDemoProfile(DEFAULT_DEMO_PROFILE);
    setDemoConversations([]);
    setDemoMessagesMap({});
    setDemoAssessments([]);
    setDemoCommunityPosts([]);
    setActiveConversationId(null);
    setPendingStarterPrompt(null);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDemoCreatePost = (post: CommunityPostDoc) => {
    setDemoCommunityPosts((prev) => [post, ...prev]);
  };

  const handleDemoHugPost = (postId: string) => {
    setDemoCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, hugsCount: p.hugsCount + 1 } : p))
    );
  };

  const handleDemoDeletePost = (postId: string) => {
    setDemoCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleDemoCreateConversation = (conv: ConversationThread) => {
    setDemoConversations((prev) => [{ ...conv, updatedAt: Date.now() }, ...prev]);
  };

  const handleDemoAppendMessage = (convId: string, msg: ChatMessageDoc) => {
    setDemoMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), msg],
    }));
  };

  const handleDemoUpdateConversation = (
    convId: string,
    preview: string,
    safetyFlagged: boolean
  ) => {
    setDemoConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, lastMessagePreview: preview, safetyFlagged, updatedAt: Date.now() }
          : c
      )
    );
  };

  const handleDemoDeleteConversation = (convId: string) => {
    setDemoConversations((prev) => prev.filter((c) => c.id !== convId));
    setDemoMessagesMap((prev) => {
      const next = { ...prev };
      delete next[convId];
      return next;
    });
    if (activeConversationId === convId) {
      setActiveConversationId(null);
    }
  };

  const handleDemoSaveAssessment = (item: AssessmentResultDoc) => {
    setDemoAssessments((prev) => [item, ...prev]);
  };

  const handleDemoDeleteAssessment = (id: string) => {
    setDemoAssessments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDemoUpdateProfile = (updates: Partial<UserProfile>) => {
    setDemoProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleDemoClearConversations = () => {
    setDemoConversations([]);
    setDemoMessagesMap({});
    setActiveConversationId(null);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF5EE] flex flex-col items-center justify-center p-6 gap-3">
        <SereMateLogoMark className="w-10 h-10" />
        <p className="text-sm font-medium text-[#5E5650]">Loading SereMate…</p>
      </div>
    );
  }

  if (!firebaseUser && !isDemoMode) {
    return <AuthPortal onStartDemo={handleStartDemo} />;
  }

  const effectiveIsAdmin = isDemoMode ? false : isAdmin;

  const effectiveProfile: UserProfile = isDemoMode
    ? demoProfile
    : profile || {
        uid: firebaseUser!.uid,
        displayName: firebaseUser!.displayName || 'SereMate Member',
        email: firebaseUser!.email || '',
        ageBracket: '16-17',
        role: 'user',
        privacyOptOutTraining: true,
        acceptedPrivacyPolicy: true,
      };

  const effectiveConversations = isDemoMode ? demoConversations : conversations;
  const effectiveAssessments = isDemoMode ? demoAssessments : assessments;

  const handleSelectTab = (tab: SereMateTab) => {
    if (tab === 'admin' && !effectiveIsAdmin) {
      setActiveTab('dashboard');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewChat = (starterPrompt?: string) => {
    setActiveConversationId(null);
    setPendingStarterPrompt(starterPrompt || null);
    setActiveTab('companion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConversation = (convId: string) => {
    setActiveConversationId(convId);
    setPendingStarterPrompt(null);
    setActiveTab('companion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReportModal = (topic: string) => {
    setReportTopic(topic);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EE] text-[#231F1D]">
      <SereMateNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isAdmin={effectiveIsAdmin}
        displayName={effectiveProfile.displayName}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-24 lg:pb-12">
        {isDemoMode && (
          <div className="mb-6 rounded-2xl bg-[#EFEAFE]/85 border border-[#6B4FD3]/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#3C2885]">
              <strong className="font-semibold">Instant Demo Active</strong> — Explore everything freely without an account. Chats and check-ins stay only in this browser tab.
            </p>
            <button
              type="button"
              onClick={handleExitDemo}
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-white border border-[#6B4FD3]/20 text-xs font-semibold text-[#3C2885] whitespace-nowrap transition-colors"
            >
              Exit Demo / Sign In
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            profile={effectiveProfile}
            conversations={effectiveConversations}
            latestAssessment={effectiveAssessments[0] || null}
            onNavigate={handleSelectTab}
            onStartNewChat={handleStartNewChat}
            onOpenConversation={handleOpenConversation}
          />
        )}

        {activeTab === 'companion' && (
          <CompanionView
            profile={effectiveProfile}
            isDemoMode={isDemoMode}
            conversations={effectiveConversations}
            activeConversationId={activeConversationId}
            demoMessagesMap={demoMessagesMap}
            pendingStarterPrompt={pendingStarterPrompt}
            onClearStarterPrompt={() => setPendingStarterPrompt(null)}
            onSelectConversation={setActiveConversationId}
            onNavigate={handleSelectTab}
            onOpenReportModal={handleOpenReportModal}
            onDemoCreateConversation={handleDemoCreateConversation}
            onDemoAppendMessage={handleDemoAppendMessage}
            onDemoUpdateConversation={handleDemoUpdateConversation}
            onDemoDeleteConversation={handleDemoDeleteConversation}
          />
        )}

        {activeTab === 'guidance' && (
          <GuidanceView
            articles={guidanceArticles}
            isDemoMode={isDemoMode}
            onAskCompanion={(prompt) => handleStartNewChat(prompt)}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            uid={effectiveProfile.uid}
            isDemoMode={isDemoMode}
            communityPosts={isDemoMode ? demoCommunityPosts : communityPosts}
            onAskCompanion={(prompt) => handleStartNewChat(prompt)}
            onOpenReportModal={handleOpenReportModal}
            onDemoCreatePost={handleDemoCreatePost}
            onDemoHugPost={handleDemoHugPost}
            onDemoDeletePost={handleDemoDeletePost}
          />
        )}

        {activeTab === 'pregnancy' && (
          <PregnancyCareView
            uid={effectiveProfile.uid}
            onNavigate={handleSelectTab}
            onAskCompanion={(prompt) => handleStartNewChat(prompt)}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentView
            uid={effectiveProfile.uid}
            isDemoMode={isDemoMode}
            pastAssessments={effectiveAssessments}
            onNavigate={handleSelectTab}
            onAskCompanion={(prompt) => handleStartNewChat(prompt)}
            onDemoSaveAssessment={handleDemoSaveAssessment}
            onDemoDeleteAssessment={handleDemoDeleteAssessment}
          />
        )}

        {activeTab === 'support' && (
          <SupportNavigatorView
            resources={supportResources}
            isDemoMode={isDemoMode}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            uid={effectiveProfile.uid}
            isDemoMode={isDemoMode}
            conversations={effectiveConversations}
            onOpenConversation={handleOpenConversation}
            onStartNewChat={() => handleStartNewChat()}
            onDeleteDemoConversation={handleDemoDeleteConversation}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={effectiveProfile}
            isDemoMode={isDemoMode}
            emailVerified={isDemoMode ? true : Boolean(firebaseUser?.emailVerified)}
            conversations={effectiveConversations}
            onDemoUpdateProfile={handleDemoUpdateProfile}
            onDemoClearConversations={handleDemoClearConversations}
            onExitDemo={handleExitDemo}
          />
        )}

        {activeTab === 'admin' && effectiveIsAdmin && <AdminView />}
      </main>

      <footer className="hidden lg:block border-t border-[#231F1D]/8 py-5">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-xs text-[#5E5650]">
          <span>SereMate — Your Questions Deserve Care, Not Judgment.</span>
          <div className="flex items-center gap-5">
            <span>Educational support only; not a medical diagnosis.</span>
            <button
              type="button"
              onClick={() => setLegalModalOpen(true)}
              className="font-medium hover:underline"
            >
              Privacy & Terms
            </button>
          </div>
        </div>
      </footer>

      <ReportSafetyModal
        isOpen={reportModalOpen}
        uid={effectiveProfile.uid}
        isDemoMode={isDemoMode}
        initialTopic={reportTopic}
        onClose={() => setReportModalOpen(false)}
      />

      <PrivacyTermsModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SereMateAppShell />
    </ErrorBoundary>
  );
}
