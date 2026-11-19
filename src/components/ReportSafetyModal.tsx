import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Flag, X } from 'lucide-react';
import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { SafetyReportDoc } from '../types/seremate';

interface ReportSafetyModalProps {
  isOpen: boolean;
  uid: string;
  isDemoMode?: boolean;
  initialTopic: string;
  onClose: () => void;
}

export function ReportSafetyModal({
  isOpen,
  uid,
  isDemoMode = false,
  initialTopic,
  onClose,
}: ReportSafetyModalProps) {
  const [category, setCategory] = useState<SafetyReportDoc['category']>('safety_concern');
  const [relatedTopic, setRelatedTopic] = useState(initialTopic || 'General');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanTopic = (relatedTopic || 'General').trim().slice(0, 120);
    const cleanDesc = description.trim();
    if (cleanDesc.length < 5 || cleanDesc.length > 1000) {
      setErrorMsg('Please describe the issue using between 5 and 1,000 characters.');
      return;
    }

    if (isDemoMode) {
      setSubmitted(true);
      setDescription('');
      return;
    }

    setIsSubmitting(true);
    const path = 'safety_reports';
    try {
      await addDoc(collection(db, path), {
        reporterUid: uid,
        category,
        relatedTopic: cleanTopic,
        description: cleanDesc,
        status: 'open',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubmitted(true);
      setDescription('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#231F1D]/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-[#FDFBF7] border border-[#231F1D]/12 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#C65D3B]">Safety & Content Reporting</p>
            <h2 id="report-modal-title" className="font-display text-2xl font-semibold text-[#231F1D]">
              Submit a report to administrators
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              onClose();
            }}
            aria-label="Close report modal"
            className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-[#5E5650] hover:bg-[#F2EBE0]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 py-2">
            <div className="rounded-2xl bg-[#E6EFE9] border border-[#4E7D63]/25 p-4 flex items-start gap-3 text-sm text-[#244D36]">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#4E7D63]" />
              <div>
                <p className="font-semibold">Report received</p>
                <p className="text-xs mt-1 leading-relaxed">
                  Thank you for helping keep SereMate accurate and safe. Administrators review submitted reports without accessing your private conversation history.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#231F1D] text-white text-sm font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <p className="text-xs text-[#5E5650] leading-relaxed">
              Do not include sensitive personal health details here. Only share what helps administrators fix inaccurate content, outdated clinic listings, or safety concerns.
            </p>

            {errorMsg && (
              <p className="text-xs font-medium text-[#9D3E20] bg-[#FBECE6] p-3 rounded-xl">
                {errorMsg}
              </p>
            )}

            <div className="space-y-1.5">
              <label htmlFor="rep-cat" className="block text-xs font-semibold text-[#231F1D]">
                Report Category
              </label>
              <select
                id="rep-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as SafetyReportDoc['category'])}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm text-[#231F1D]"
              >
                <option value="safety_concern">Safety Concern</option>
                <option value="misinformation">Inaccurate Health Information</option>
                <option value="outdated_resource">Outdated Support Resource</option>
                <option value="platform_feedback">General Feedback</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rep-topic" className="block text-xs font-semibold text-[#231F1D]">
                Related Area or Resource
              </label>
              <input
                id="rep-topic"
                type="text"
                maxLength={120}
                required
                value={relatedTopic}
                onChange={(e) => setRelatedTopic(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm text-[#231F1D]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rep-desc" className="block text-xs font-semibold text-[#231F1D]">
                What happened or needs updating?
              </label>
              <textarea
                id="rep-desc"
                rows={4}
                minLength={5}
                maxLength={1000}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue clearly (5–1000 characters)..."
                className="w-full p-3.5 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm text-[#231F1D] focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#5E5650] hover:bg-[#F2EBE0]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C65D3B] hover:bg-[#AE4D2E] disabled:opacity-50 text-white text-sm font-semibold"
              >
                <Flag className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting…' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
