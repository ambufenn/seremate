import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, BookOpen, Flag, MessageCircleHeart, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { db } from '../firebase';
import type { GuidanceArticle, GuidanceCategory } from '../types/seremate';

interface GuidanceViewProps {
  articles: GuidanceArticle[];
  isDemoMode?: boolean;
  onAskCompanion: (prompt: string) => void;
  onOpenReportModal: (relatedTopic: string) => void;
}

const CATEGORIES: Array<'All' | GuidanceCategory> = [
  'All',
  'Puberty & Growth',
  'Menstrual Health',
  'Pregnancy Awareness',
  'Sexual & Reproductive Health',
  'Healthy Relationships & Boundaries',
  'When & Where to Get Help',
];

export function GuidanceView({
  articles,
  isDemoMode = false,
  onAskCompanion,
  onOpenReportModal,
}: GuidanceViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'All' | GuidanceCategory>('All');
  const [search, setSearch] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [articles, selectedCategory, search]);

  const activeArticle = articles.find((a) => a.id === activeArticleId) || null;

  const handleOpenArticle = (article: GuidanceArticle) => {
    setActiveArticleId(article.id);
    if (!isDemoMode) {
      void addDoc(collection(db, 'usage_events'), {
        eventType: 'guidance_viewed',
        topicCategory: article.category.slice(0, 80),
        safetyTriggered: false,
        createdAt: serverTimestamp(),
      }).catch(() => {});
    }
  };

  if (activeArticle) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveArticleId(null)}
            className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#231F1D] hover:bg-[#F2EBE0] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Health Guidance</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenReportModal(activeArticle.title)}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#5E5650] hover:bg-[#F2EBE0]"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report content</span>
          </button>
        </div>

        <article className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#553CB5]">
              {activeArticle.category} · {activeArticle.ageRange}
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#241F1B]">
              {activeArticle.title}
            </h1>
            <p className="text-[15px] text-[#5F554D] leading-relaxed">
              {activeArticle.summary}
            </p>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#241F1B]/8 text-[15px] leading-[1.7] text-[#352F2C]">
            {activeArticle.bodyParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="bg-[#E5F2E9]/85 border border-[#44835E]/20 rounded-2xl p-5 space-y-1.5">
            <p className="text-xs font-semibold text-[#2E5E44]">
              When & Where to Seek Professional Help
            </p>
            <p className="text-sm text-[#244D36] leading-relaxed">
              {activeArticle.whenToSeekHelp}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                onAskCompanion(
                  `I just read "${activeArticle.title}" and would like to ask a question.`
                )
              }
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA6A27] hover:bg-[#D45819] text-white text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <MessageCircleHeart className="w-4 h-4" />
              <span>Ask Sere About This</span>
            </button>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#553CB5]">
            Health Guidance Library
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#241F1B] mt-1">
            Friendly, trustworthy health guides
          </h1>
          <p className="text-sm text-[#5F554D] mt-2 max-w-2xl leading-relaxed">
            Explore gentle guides written clearly for teens and young adults. Educational guidance only—never a substitute for medical care.
          </p>
        </div>

        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#8C8074] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search health topics..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl bg-[#FFFDF9] border border-[#241F1B]/12 text-sm text-[#241F1B] focus:outline-none focus:border-[#6B4FD3]"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#6B4FD3] text-white'
                  : 'bg-[#F3ECE1] text-[#241F1B] hover:bg-[#EFEAFE]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#FFFDF9] border border-[#241F1B]/10 rounded-3xl p-8 text-center text-sm text-[#5F554D]">
          No guidance articles matched your filter. Try selecting “All”.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article, idx) => {
            const cardTint =
              idx % 3 === 0
                ? 'bg-[#FFF0E5]/65 hover:bg-[#FFF0E5] border-[#EA6A27]/15'
                : idx % 3 === 1
                ? 'bg-[#EFEAFE]/65 hover:bg-[#EFEAFE] border-[#6B4FD3]/15'
                : 'bg-[#E5F2E9]/65 hover:bg-[#E5F2E9] border-[#44835E]/15';
            return (
              <button
                key={article.id}
                type="button"
                onClick={() => handleOpenArticle(article)}
                className={`text-left border rounded-3xl p-6 flex flex-col justify-between transition-colors ${cardTint}`}
              >
                <div>
                  <p className="text-xs font-medium text-[#5F554D]">
                    {article.category} · {article.ageRange}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-[#241F1B] mt-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-[#5F554D] mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B44A14] mt-5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
