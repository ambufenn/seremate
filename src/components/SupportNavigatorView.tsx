import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Clock, Flag, MapPin, PhoneCall, Search, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import type { HealthcareResource } from '../types/seremate';

interface SupportNavigatorViewProps {
  resources: HealthcareResource[];
  isDemoMode?: boolean;
  onOpenReportModal: (relatedTopic: string) => void;
}

const CATEGORIES: Array<'All' | HealthcareResource['category']> = [
  'All',
  'Youth Clinic',
  '24/7 Helpline',
  'Community Health',
  'Counseling & Advocacy',
];

export function SupportNavigatorView({
  resources,
  isDemoMode = false,
  onOpenReportModal,
}: SupportNavigatorViewProps) {
  const [category, setCategory] = useState<'All' | HealthcareResource['category']>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isDemoMode) return;
    void addDoc(collection(db, 'usage_events'), {
      eventType: 'support_viewed',
      topicCategory: 'Healthcare Navigation',
      safetyTriggered: false,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  }, [isDemoMode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((res) => {
      const matchesCat = category === 'All' || res.category === category;
      const matchesSearch =
        !q ||
        res.name.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.services.some((s) => s.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [resources, category, search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#44835E]">
            Healthcare Navigation & Verified Support
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
            Find caring clinics & helplines
          </h1>
          <p className="text-sm text-[#5F554D] mt-2 max-w-2xl leading-relaxed">
            Explore youth-friendly clinics and support lines, or check urgent care signs. Sample entries are clearly marked until updated locally.
          </p>
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics or services..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#44835E]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`min-h-[40px] px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-[#44835E] text-white'
                : 'bg-[#F3ECE1] text-[#241F1B] hover:bg-[#E5F2E9]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-8 text-sm text-[#5F554D]">
              No matching support resources found. Try clearing your filter.
            </div>
          ) : (
            filtered.map((res) => (
              <article
                key={res.id}
                className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#44835E]">
                      {res.category} · {res.costInfo}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-1">
                      {res.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenReportModal(`Resource: ${res.name}`)}
                    className="self-start inline-flex items-center gap-1 text-xs font-medium text-[#5F554D] hover:text-[#EA6A27]"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report outdated info</span>
                  </button>
                </div>

                <p className="text-sm text-[#3E3732] leading-relaxed">{res.description}</p>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#5F554D]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA6A27]" />
                    {res.locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#44835E]" />
                    {res.hours}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#241F1B]">
                    <PhoneCall className="w-3.5 h-3.5 text-[#44835E]" />
                    {res.contactValue}
                  </span>
                </div>

                <p className="text-xs text-[#5F554D]">
                  <span className="font-semibold text-[#241F1B]">Services:</span>{' '}
                  {res.services.join(' · ')}
                </p>

                <div className="bg-[#FAF5EE] border border-[#241F1B]/8 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs text-[#5F554D]">
                  <ShieldCheck className="w-4 h-4 text-[#44835E] shrink-0" />
                  <span>{res.verificationNote}</span>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFF0E5]/90 border border-[#EA6A27]/20 rounded-3xl p-6 space-y-2.5">
            <p className="text-xs font-semibold text-[#B44A14]">
              When Professional Help Is Recommended
            </p>
            <ul className="text-xs text-[#5C2918] space-y-2 leading-relaxed list-disc pl-4">
              <li>Severe lower abdominal or pelvic pain, fever, or fainting</li>
              <li>Soaking through a pad or tampon every 1–2 hours for several hours</li>
              <li>A missed period alongside pregnancy concern or uncertainty</li>
              <li>Any form of physical harm, sexual coercion, threats, or digital blackmail</li>
            </ul>
          </div>

          <div className="bg-[#EFEAFE]/85 border border-[#6B4FD3]/15 rounded-3xl p-6 space-y-2">
            <p className="text-xs font-semibold text-[#553CB5]">Notice a safety or resource issue?</p>
            <p className="text-xs text-[#453973] leading-relaxed">
              Let our administrators know if a listing needs updating or if you encountered inaccurate information.
            </p>
            <button
              type="button"
              onClick={() => onOpenReportModal('Healthcare Navigation')}
              className="mt-2 min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FFFDF9] text-xs font-semibold text-[#241F1B] hover:bg-white transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-[#EA6A27]" />
              <span>Submit Safety / Resource Report</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
