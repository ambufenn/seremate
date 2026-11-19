import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { getUiStrings, type AppLanguage } from '../i18n/languages';
import type { AgeBracket } from '../types/seremate';
import { LanguageSelector } from './LanguageSelector';
import { PrivacyTermsModal } from './PrivacyTermsModal';
import { SereMascot, SereMateLogoMark } from './SereMascot';

export { SereMateLogoMark };

type AuthMode = 'login' | 'register' | 'reset';

const AGE_BRACKETS: Array<{ value: AgeBracket; label: string }> = [
  { value: '10-12', label: '10–12 years' },
  { value: '13-15', label: '13–15 years' },
  { value: '16-17', label: '16–17 years' },
  { value: '18-19', label: '18–19 years' },
  { value: 'guardian_educator', label: 'Parent / Guardian / Educator' },
];

function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password did not match an account. Please double-check or reset your password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (at least 8 characters).';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled yet. You can use Try Instant Demo above or Continue with Google below.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing. You can try again anytime.';
    default:
      return error instanceof Error ? error.message : 'Unable to complete authentication.';
  }
}

interface AuthPortalProps {
  onStartDemo: () => void;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
}

export function AuthPortal({
  onStartDemo,
  language,
  onChangeLanguage,
}: AuthPortalProps) {
  const ui = getUiStrings(language);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ageBracket, setAgeBracket] = useState<AgeBracket>('16-17');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState<'privacy' | 'terms'>('privacy');

  const ensureUserProfileDoc = async (params: {
    uid: string;
    email: string;
    displayName: string;
    ageBracket: AgeBracket;
  }) => {
    const profileRef = doc(db, 'users', params.uid);
    try {
      const existingSnap = await getDoc(profileRef);
      if (!existingSnap.exists()) {
        await setDoc(profileRef, {
          uid: params.uid,
          displayName: params.displayName.trim().slice(0, 80) || 'SereMate Member',
          email: params.email.trim().slice(0, 160),
          ageBracket: params.ageBracket,
          role: 'user',
          privacyOptOutTraining: true,
          acceptedPrivacyPolicy: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${params.uid}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await ensureUserProfileDoc({
        uid: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: cred.user.displayName || 'SereMate Member',
        ageBracket: '16-17',
      });
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanName = displayName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length > 80) {
      setErrorMessage('Please enter a nickname or display name (1–80 characters).');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please check and try again.');
      return;
    }
    if (!acceptedPrivacy) {
      setErrorMessage('Please review and accept the Privacy Policy, Terms of Use, and age notice.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName: cleanName });
      await ensureUserProfileDoc({
        uid: cred.user.uid,
        email: cleanEmail,
        displayName: cleanName,
        ageBracket,
      });
      try {
        await sendEmailVerification(cred.user);
      } catch {
        // Non-blocking
      }
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Enter the email address linked to your SereMate account.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setStatusMessage(
        'If an account exists for that email, a password reset link has been sent. Please check your inbox and spam folder.'
      );
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await ensureUserProfileDoc({
        uid: cred.user.uid,
        email: cred.user.email || 'user@seremate.local',
        displayName: cred.user.displayName || 'SereMate Member',
        ageBracket: '16-17',
      });
    } catch (error) {
      setErrorMessage(mapFirebaseAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#241F1B] flex flex-col justify-between">
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <SereMateLogoMark className="w-8 h-8 shrink-0" />
          <span className="font-display text-xl font-semibold tracking-tight text-[#241F1B]">
            SereMate
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector language={language} onChange={onChangeLanguage} compact />
          <button
            type="button"
            onClick={() => {
              setLegalSection('privacy');
              setLegalModalOpen(true);
            }}
            className="text-xs sm:text-sm font-medium text-[#5F554D] hover:text-[#241F1B] whitespace-nowrap shrink-0"
          >
            Privacy &amp; Safeguarding
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left: Cute Companion Welcome & Pastel Trust Cards */}
        <section className="lg:col-span-6 space-y-5">
          <div className="bg-[#FFF0E5] border border-[#EA6A27]/15 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-5">
            <SereMascot mood="encouraging" size="lg" />
            <div className="text-center sm:text-left space-y-2">
              <p className="text-xs font-semibold text-[#B44A14]">
                Adolescent Health Companion · Ages 10–19
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#241F1B] leading-[1.14]">
                {ui.auth.welcomeHi}
              </h1>
              <p className="text-[15px] text-[#5F554D] leading-relaxed">
                {ui.auth.welcomeSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#EFEAFE] border border-[#6B4FD3]/15 rounded-3xl p-5 space-y-1.5">
              <p className="text-sm font-semibold text-[#3C2885]">Private Safe Space</p>
              <p className="text-xs text-[#4C3B87] leading-relaxed">
                Your questions stay private to you—gentle, inclusive, and never shared without consent.
              </p>
            </div>
            <div className="bg-[#E5F2E9] border border-[#44835E]/15 rounded-3xl p-5 space-y-1.5">
              <p className="text-sm font-semibold text-[#244D36]">Supportive Guidance</p>
              <p className="text-xs text-[#315C44] leading-relaxed">
                Clear educational answers with built-in safeguarding that connects you to real care.
              </p>
            </div>
          </div>

          <div className="bg-[#FEF6DF] border border-[#D49B2A]/20 rounded-2xl p-4 text-xs text-[#5E4410] leading-relaxed">
            <strong>Need urgent help right now?</strong> If you are in immediate danger or experiencing severe pain or heavy bleeding, please call your local emergency number (911, 112, or 999) or visit the nearest emergency department.
          </div>
        </section>

        {/* Right: Instant Demo Entry + Account Auth Card */}
        <section className="lg:col-span-6">
          <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Prominent One-Click Demo Entry (No Username / Password Required) */}
            <div className="rounded-2xl bg-[#FFF0E5]/85 border border-[#EA6A27]/20 p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-semibold text-[#241F1B]">
                    {ui.auth.demoTitle}
                  </h2>
                  <p className="text-xs text-[#5F554D] leading-relaxed">
                    {ui.auth.demoDesc}
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#EA6A27] shrink-0 mt-0.5" />
              </div>
              <button
                type="button"
                onClick={onStartDemo}
                className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>{ui.auth.demoButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <span className="border-t border-[#241F1B]/10 w-full" />
              <span className="bg-[#FFFDF9] px-3 text-[11px] font-medium text-[#8C8074] whitespace-nowrap">
                {ui.auth.orSignIn}
              </span>
              <span className="border-t border-[#241F1B]/10 w-full" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F3ECE1] rounded-2xl">
              {(
                [
                  { id: 'login', label: ui.auth.signIn },
                  { id: 'register', label: ui.auth.createAccount },
                  { id: 'reset', label: 'Reset' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setMode(tab.id);
                    setErrorMessage(null);
                    setStatusMessage(null);
                  }}
                  className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                    mode === tab.id
                      ? 'bg-[#FFFDF9] text-[#241F1B] shadow-xs'
                      : 'text-[#5F554D] hover:text-[#241F1B]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl bg-[#FFF0E5] border border-[#EA6A27]/30 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[#7A2D15]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#EA6A27]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {statusMessage && (
              <div
                role="status"
                className="rounded-2xl bg-[#E5F2E9] border border-[#44835E]/30 p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[#244D36]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#44835E]" />
                <span>{statusMessage}</span>
              </div>
            )}

            {mode === 'login' && (
              <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="block text-xs font-semibold text-[#241F1B]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-semibold text-[#241F1B]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-[#EA6A27] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#5F554D] hover:text-[#241F1B]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-[#241F1B] hover:bg-[#3A322C] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign In with Email'}
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-[#241F1B]">
                      Nickname / Display Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="reg-name"
                        type="text"
                        maxLength={80}
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., Alex"
                        className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-age" className="block text-xs font-semibold text-[#241F1B]">
                      Age Group
                    </label>
                    <select
                      id="reg-age"
                      value={ageBracket}
                      onChange={(e) => setAgeBracket(e.target.value as AgeBracket)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    >
                      {AGE_BRACKETS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {ageBracket === '10-12' && (
                  <div className="rounded-2xl bg-[#E5F2E9] border border-[#44835E]/25 p-3 text-xs text-[#244D36] leading-relaxed">
                    <strong>Age & Guardian Notice (Ages 10–12):</strong> Depending on your country’s digital consent rules, please explore SereMate with a trusted parent, legal guardian, or school health counselor.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-[#241F1B]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reg-email"
                      type="email"
                      autoComplete="email"
                      maxLength={160}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-pass" className="block text-xs font-semibold text-[#241F1B]">
                      Password (min 8 chars)
                    </label>
                    <div className="relative">
                      <input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full min-h-[44px] pl-3.5 pr-10 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-[#5F554D]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-confirm" className="block text-xs font-semibold text-[#241F1B]">
                      Confirm Password
                    </label>
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#5F554D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 rounded border-[#241F1B]/30 text-[#EA6A27] focus:ring-[#EA6A27]"
                  />
                  <span>
                    I understand SereMate is educational (not medical diagnosis) and accept the{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLegalSection('privacy');
                        setLegalModalOpen(true);
                      }}
                      className="font-semibold text-[#EA6A27] hover:underline"
                    >
                      Privacy Policy & Terms of Use
                    </button>
                    . My private conversations are never used for AI model training without explicit consent.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-[#241F1B] hover:bg-[#3A322C] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Creating account…' : 'Create SereMate Account'}
                </button>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={(e) => void handlePasswordReset(e)} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className="block text-xs font-semibold text-[#241F1B]">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF5EE] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#EA6A27]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[44px] py-2.5 px-5 rounded-2xl bg-[#241F1B] hover:bg-[#3A322C] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isSubmitting ? 'Sending reset link…' : 'Send Reset Link'}
                </button>
              </form>
            )}

            {/* Google Sign-In Option */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleGoogleSignIn()}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#EFEAFE]/70 hover:bg-[#EFEAFE] border border-[#6B4FD3]/15 text-sm font-semibold text-[#3C2885] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#6B4FD3]" />
              <span>Continue with Google</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-[#241F1B]/8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5F554D]">
        <span>SereMate — Your Questions Deserve Care, Not Judgment.</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setLegalSection('privacy');
              setLegalModalOpen(true);
            }}
            className="hover:underline"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => {
              setLegalSection('terms');
              setLegalModalOpen(true);
            }}
            className="hover:underline"
          >
            Terms of Use
          </button>
        </div>
      </footer>

      <PrivacyTermsModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialSection={legalSection}
      />
    </div>
  );
}
