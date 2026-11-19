import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CheckCircle2, KeyRound, LogOut, MailCheck, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import type { AgeBracket, ConversationThread, UserProfile } from '../types/seremate';
import { PrivacyTermsModal } from './PrivacyTermsModal';

interface ProfileViewProps {
  profile: UserProfile;
  isDemoMode?: boolean;
  emailVerified: boolean;
  conversations: ConversationThread[];
  onDemoUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onDemoClearConversations?: () => void;
  onExitDemo?: () => void;
}

export function ProfileView({
  profile,
  isDemoMode = false,
  emailVerified,
  conversations,
  onDemoUpdateProfile,
  onDemoClearConversations,
  onExitDemo,
}: ProfileViewProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [ageBracket, setAgeBracket] = useState<AgeBracket>(profile.ageBracket);
  const [optOutTraining, setOptOutTraining] = useState(profile.privacyOptOutTraining);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [isClearingChats, setIsClearingChats] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const cleanName = displayName.trim().slice(0, 80);
    if (!cleanName) {
      setFeedback('Display name cannot be empty.');
      return;
    }

    if (isDemoMode) {
      onDemoUpdateProfile?.({
        displayName: cleanName,
        ageBracket,
        privacyOptOutTraining: optOutTraining,
      });
      setFeedback('Demo profile settings updated.');
      return;
    }

    setIsSaving(true);
    const path = `users/${profile.uid}`;
    try {
      await updateDoc(doc(db, path), {
        displayName: cleanName,
        ageBracket,
        privacyOptOutTraining: optOutTraining,
        acceptedPrivacyPolicy: true,
        updatedAt: serverTimestamp(),
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: cleanName });
      }
      setFeedback('Profile and privacy settings saved.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (isDemoMode) {
      setFeedback('Demo sessions run locally without email verification.');
      return;
    }
    if (!auth.currentUser) return;
    setFeedback(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setFeedback('Verification email sent. Please check your inbox.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to send verification email.');
    }
  };

  const handlePasswordReset = async () => {
    if (isDemoMode) {
      setFeedback('Password reset applies to registered email accounts.');
      return;
    }
    setFeedback(null);
    try {
      await sendPasswordResetEmail(auth, profile.email);
      setFeedback(`Password reset link sent to ${profile.email}.`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to send password reset email.');
    }
  };

  const handleClearConversations = async () => {
    if (conversations.length === 0) return;
    if (isDemoMode) {
      onDemoClearConversations?.();
      setFeedback('Demo conversation history cleared.');
      return;
    }
    setIsClearingChats(true);
    setFeedback(null);
    try {
      await Promise.all(
        conversations.map((c) =>
          deleteDoc(doc(db, `users/${profile.uid}/conversations/${c.id}`))
        )
      );
      setFeedback('All saved conversation threads have been removed from your history.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/conversations`);
    } finally {
      setIsClearingChats(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#4E7D63]">Account & Privacy Settings</p>
        <h1 className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
          Your Profile
        </h1>
        <p className="text-sm text-[#5E5650] mt-1">
          Manage your display settings, privacy preferences, and session security.
        </p>
      </div>

      {feedback && (
        <div className="rounded-2xl bg-[#E6EFE9] border border-[#4E7D63]/25 p-4 flex items-center gap-2.5 text-sm text-[#244D36]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4E7D63]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Preferences Form */}
      <form
        onSubmit={(e) => void handleSaveProfile(e)}
        className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-3xl p-6 sm:p-8 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="prof-name" className="block text-xs font-semibold text-[#231F1D]">
              Nickname / Display Name
            </label>
            <input
              id="prof-name"
              type="text"
              maxLength={80}
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm text-[#231F1D]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prof-age" className="block text-xs font-semibold text-[#231F1D]">
              Age Group
            </label>
            <select
              id="prof-age"
              value={ageBracket}
              onChange={(e) => setAgeBracket(e.target.value as AgeBracket)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm text-[#231F1D]"
            >
              <option value="10-12">10–12 years</option>
              <option value="13-15">13–15 years</option>
              <option value="16-17">16–17 years</option>
              <option value="18-19">18–19 years</option>
              <option value="guardian_educator">Parent / Guardian / Educator</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#231F1D]">Email Address</label>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/8 text-sm">
            <span className="text-[#5E5650]">{profile.email}</span>
            {emailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E7D63]">
                <MailCheck className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleResendVerification()}
                className="text-xs font-semibold text-[#C65D3B] hover:underline self-start sm:self-auto"
              >
                Send verification email
              </button>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#E6EFE9]/60 border border-[#4E7D63]/15 cursor-pointer">
          <input
            type="checkbox"
            checked={optOutTraining}
            onChange={(e) => setOptOutTraining(e.target.checked)}
            className="mt-1 rounded border-[#231F1D]/30 text-[#4E7D63]"
          />
          <div className="text-xs text-[#244D36] leading-relaxed">
            <p className="font-semibold">Do not use my conversations for AI model training</p>
            <p className="mt-0.5">
              Private conversations stay isolated to your account and are never used to train models without explicit authorization and consent.
            </p>
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setLegalOpen(true)}
            className="text-xs font-semibold text-[#5F554D] hover:underline inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#44835E]" />
            <span>Read Privacy Policy & Terms of Use</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Account Actions */}
      <section className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {!isDemoMode && (
            <button
              type="button"
              onClick={() => void handlePasswordReset()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FAF5EE] hover:bg-[#F3ECE1] text-xs font-semibold text-[#241F1B]"
            >
              <KeyRound className="w-4 h-4 text-[#5F554D]" />
              <span>Send Password Reset Email</span>
            </button>
          )}

          {conversations.length > 0 && (
            <button
              type="button"
              disabled={isClearingChats}
              onClick={() => void handleClearConversations()}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#FFF0E5] hover:bg-[#FFE3D0] text-xs font-semibold text-[#B44A14] disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isClearingChats ? 'Clearing…' : 'Clear Conversation History'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isDemoMode) {
              onExitDemo?.();
            } else {
              void signOut(auth);
            }
          }}
          className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#241F1B] hover:bg-[#3A322C] text-white text-sm font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isDemoMode ? 'Exit Demo / Sign In' : 'Sign Out'}</span>
        </button>
      </section>

      <PrivacyTermsModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
    </div>
  );
}
