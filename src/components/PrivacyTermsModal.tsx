import { X } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: 'privacy' | 'terms';
}

export function PrivacyTermsModal({
  isOpen,
  onClose,
  initialSection = 'privacy',
}: PrivacyTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#231F1D]/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-terms-title"
    >
      <div className="bg-[#FDFBF7] border border-[#231F1D]/12 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
        <div className="px-6 py-5 border-b border-[#231F1D]/10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#4E7D63]">SereMate Legal & Safeguarding</p>
            <h2 id="privacy-terms-title" className="font-display text-2xl font-semibold text-[#231F1D]">
              {initialSection === 'terms' ? 'Terms of Use & Privacy Policy' : 'Privacy Policy & Terms of Use'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5E5650] hover:bg-[#F2EBE0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#3E3732] leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-display text-lg font-semibold text-[#231F1D]">
              1. Privacy Policy & Data Minimization
            </h3>
            <p>
              SereMate collects only the minimum information required to operate your private account: your chosen display nickname, email address for authentication, age bracket (to tailor age-appropriate educational language), and your private conversations and self-assessment entries.
            </p>
            <p>
              <strong>Strict Conversation Privacy:</strong> Your private conversations with the AI Health Companion and your self-assessment results are isolated to your account. Administrators cannot read your private conversation logs by default.
            </p>
            <p>
              <strong>No Unconsented AI Training:</strong> SereMate does not use your private conversations to train AI models without explicit authorization and consent. You can confirm or review this preference anytime in your Profile settings.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-lg font-semibold text-[#231F1D]">
              2. Age-Related Consent & Safeguarding Notice
            </h3>
            <p>
              SereMate is designed for adolescents aged 10–19. Depending on your country or region, users under the local digital age of consent (such as under 13 or under 16 in certain jurisdictions) should review SereMate with a parent, legal guardian, or trusted school health counselor.
            </p>
            <p>
              When safety concerns arise—such as mentions of physical harm, abuse, coercion, or urgent medical distress—our safeguarding layer provides immediate guidance toward qualified healthcare professionals and emergency services.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-lg font-semibold text-[#231F1D]">
              3. Terms of Use & Medical Disclaimer
            </h3>
            <p>
              SereMate is an educational and support platform. It is <strong>not</strong> a medical diagnosis system, does not prescribe medication, and never replaces licensed doctors, nurses, or mental health professionals.
            </p>
            <p>
              In a medical or safety emergency, always contact local emergency services or go to the nearest clinic or hospital immediately.
            </p>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-[#231F1D]/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#231F1D] hover:bg-[#3A3430] text-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
