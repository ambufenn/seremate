import {
  Check,
  Clock,
  Copy,
  MapPin,
  PhoneCall,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { HealthFacility } from '../types/reproguard';

interface NavigatorViewProps {
  onExploredNavigator: () => void;
}

const SERVICE_FILTERS = [
  'All Services',
  'Pregnancy Testing',
  'Period & Puberty Care',
  'Confidential Counseling',
  '24/7 Helplines',
  'STI & Contraception',
];

const VISIT_PREP_ITEMS = [
  'Write 1–2 questions in your phone notes so you do not have to remember them when nervous.',
  'Bring a list of the first day of your last period (if you track it—if not, totally okay).',
  'Ask the desk or nurse upfront: "Can you explain your teen confidentiality policy first?"',
  'Remember: You can bring a supportive friend or ask for a quiet private waiting spot.',
];

export function NavigatorView({ onExploredNavigator }: NavigatorViewProps) {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkedPrep, setCheckedPrep] = useState<Record<number, boolean>>({});

  useEffect(() => {
    onExploredNavigator();
    let mounted = true;
    fetch('/api/facilities')
      .then(async (res) => {
        if (!res.ok) throw new Error('Unable to load verified clinics directory.');
        return res.json();
      })
      .then((data: { facilities?: HealthFacility[] }) => {
        if (mounted) {
          setFacilities(data.facilities || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load directory.');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [onExploredNavigator]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return facilities.filter((fac) => {
      const matchesService =
        serviceFilter === 'All Services' || fac.services.includes(serviceFilter);
      const matchesQuery =
        !q ||
        fac.name.toLowerCase().includes(q) ||
        fac.services.some((s) => s.toLowerCase().includes(q)) ||
        fac.locationLabel.toLowerCase().includes(q);
      return matchesService && matchesQuery;
    });
  }, [facilities, serviceFilter, searchQuery]);

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#44835E]">
            Healthcare Navigator · Verified Youth-Friendly Support
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
            Find confidential care near you
          </h1>
          <p className="text-[15px] text-[#655B52] mt-2 max-w-2xl leading-relaxed">
            Every clinic and 24/7 line listed here welcomes teens aged 10–19 with clear privacy policies, free or sliding-scale support, and zero judgment.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clinic, service, or helpline..."
            aria-label="Search clinics and helplines"
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#FDFBF7] border border-[#241F1B]/12 text-sm text-[#241F1B] placeholder:text-[#8C8074] focus:outline-none focus:border-[#44835E]"
          />
        </div>
      </div>

      {/* Interactive Service Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {SERVICE_FILTERS.map((filter) => {
          const active = serviceFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setServiceFilter(filter)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#44835E] text-white'
                  : 'bg-[#F3ECE0] text-[#241F1B] hover:bg-[#EAE0CF]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Facilities Directory */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            <div className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-8 text-sm text-[#655B52]">
              Loading verified youth clinics and 24/7 helplines…
            </div>
          ) : loadError ? (
            <div className="bg-[#FFF0E5] border border-[#EA6A27]/25 rounded-3xl p-6 text-sm text-[#6A2706]">
              {loadError}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-8 text-sm text-[#655B52]">
              No matching services found for that filter. Try switching back to All Services.
            </div>
          ) : (
            filtered.map((fac) => (
              <article
                key={fac.id}
                className="bg-[#FDFBF7] border border-[#241F1B]/10 rounded-3xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#44835E]">
                      {fac.category} · {fac.cost}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[#241F1B] mt-1">
                      {fac.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopy(fac.id, fac.contactValue)}
                    className="self-start min-h-[40px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E5F2E9] hover:bg-[#D5EAD9] text-[#1E3B2A] text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    {copiedId === fac.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied contact</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{fac.contactValue}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clean unboxed metadata row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#655B52]">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA6A27]" />
                    {fac.locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#7C5CE0]" />
                    {fac.hours}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#44835E]" />
                    {fac.confidentiality}
                  </span>
                </div>

                <p className="text-xs font-medium text-[#241F1B]">
                  Services: <span className="text-[#655B52]">{fac.services.join(' · ')}</span>
                </p>

                <div className="bg-[#FAF5ED] border border-[#241F1B]/8 rounded-2xl p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-[#655B52]">
                    What to expect on your visit
                  </p>
                  <p className="text-sm text-[#3F3730] leading-relaxed">
                    {fac.whatToExpect}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Right Sidebar: Visit Preparation Checklist & Rights */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-[#EFEAFE]/70 border border-[#7C5CE0]/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Stethoscope className="w-5 h-5 text-[#5A3EC2]" />
              <h2 className="font-display text-xl font-semibold text-[#241F1B]">
                First Visit Prep Checklist
              </h2>
            </div>
            <p className="text-xs text-[#4F4568] leading-relaxed">
              Feeling nervous before calling or walking in is super normal. Tap items as you get ready:
            </p>
            <div className="space-y-2.5">
              {VISIT_PREP_ITEMS.map((item, idx) => {
                const checked = Boolean(checkedPrep[idx]);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCheckedPrep((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className={`w-full text-left p-3 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 transition-colors ${
                      checked
                        ? 'bg-[#E5F2E9] border-[#44835E]/30 text-[#1E3B2A]'
                        : 'bg-[#FDFBF7] border-[#241F1B]/8 text-[#241F1B]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        checked
                          ? 'bg-[#44835E] border-[#44835E] text-white'
                          : 'border-[#8C8074]'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#FFF0E5]/80 border border-[#EA6A27]/20 rounded-3xl p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B8470F]">
              <PhoneCall className="w-4 h-4" />
              <span>Important Reminder</span>
            </div>
            <p className="text-sm text-[#4B210B] leading-relaxed">
              Lumi and REPROGUARD provide educational guidance—never medical diagnoses. Always confirm health symptoms or pregnancy test results with a licensed clinician.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
