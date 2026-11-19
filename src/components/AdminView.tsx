import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flag,
  Lock,
  Plus,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BASELINE_GUIDANCE_ARTICLES } from '../data/guidanceLibrary';
import { BASELINE_SUPPORT_RESOURCES } from '../data/supportResources';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type {
  GuidanceArticle,
  GuidanceCategory,
  HealthcareResource,
  SafetyReportDoc,
  UsageEventDoc,
} from '../types/seremate';

type AdminSubTab = 'guidance' | 'resources' | 'reports' | 'analytics';

export function AdminView() {
  const [subTab, setSubTab] = useState<AdminSubTab>('guidance');
  const [articles, setArticles] = useState<GuidanceArticle[]>([]);
  const [resources, setResources] = useState<HealthcareResource[]>([]);
  const [reports, setReports] = useState<SafetyReportDoc[]>([]);
  const [events, setEvents] = useState<UsageEventDoc[]>([]);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // New Guidance Article form state
  const [artTitle, setArtTitle] = useState('');
  const [artCat, setArtCat] = useState<GuidanceCategory>('Puberty & Growth');
  const [artSummary, setArtSummary] = useState('');
  const [artBody, setArtBody] = useState('');
  const [artHelp, setArtHelp] = useState('');

  // New Healthcare Resource form state
  const [resName, setResName] = useState('');
  const [resCat, setResCat] = useState<HealthcareResource['category']>('Youth Clinic');
  const [resServices, setResServices] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resLocation, setResLocation] = useState('');
  const [resHours, setResHours] = useState('');
  const [resCost, setResCost] = useState('');
  const [resContact, setResContact] = useState('');
  const [resNote, setResNote] = useState('Verified regional resource');

  // Report notes draft map
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubArticles = onSnapshot(
      collection(db, 'guidance_articles'),
      (snap) => {
        setArticles(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GuidanceArticle, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'guidance_articles')
    );

    const unsubResources = onSnapshot(
      collection(db, 'healthcare_resources'),
      (snap) => {
        setResources(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<HealthcareResource, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'healthcare_resources')
    );

    const unsubReports = onSnapshot(
      query(collection(db, 'safety_reports'), orderBy('createdAt', 'desc')),
      (snap) => {
        setReports(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SafetyReportDoc, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'safety_reports')
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'usage_events'), orderBy('createdAt', 'desc')),
      (snap) => {
        setEvents(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UsageEventDoc, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'usage_events')
    );

    return () => {
      unsubArticles();
      unsubResources();
      unsubReports();
      unsubEvents();
    };
  }, []);

  const analyticsSummary = useMemo(() => {
    const chatTurns = events.filter((e) => e.eventType === 'chat_turn').length;
    const assessments = events.filter((e) => e.eventType === 'assessment_completed').length;
    const guidanceViews = events.filter((e) => e.eventType === 'guidance_viewed').length;
    const supportViews = events.filter((e) => e.eventType === 'support_viewed').length;
    const safetyTriggers = events.filter((e) => e.safetyTriggered).length;
    return { chatTurns, assessments, guidanceViews, supportViews, safetyTriggers };
  }, [events]);

  const handleSeedArticles = async () => {
    setAdminMessage(null);
    try {
      await Promise.all(
        BASELINE_GUIDANCE_ARTICLES.map((art) =>
          setDoc(doc(db, 'guidance_articles', art.id), {
            title: art.title.slice(0, 140),
            category: art.category,
            summary: art.summary.slice(0, 400),
            bodyParagraphs: art.bodyParagraphs.slice(0, 8),
            whenToSeekHelp: art.whenToSeekHelp.slice(0, 500),
            ageRange: art.ageRange.slice(0, 40),
            published: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      );
      setAdminMessage('Published baseline educational articles to Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'guidance_articles');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);
    const paragraphs = artBody
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (!artTitle.trim() || !artSummary.trim() || paragraphs.length === 0 || !artHelp.trim()) {
      setAdminMessage('Please fill in all guidance article fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'guidance_articles'), {
        title: artTitle.trim().slice(0, 140),
        category: artCat,
        summary: artSummary.trim().slice(0, 400),
        bodyParagraphs: paragraphs,
        whenToSeekHelp: artHelp.trim().slice(0, 500),
        ageRange: 'Ages 10–19',
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setArtTitle('');
      setArtSummary('');
      setArtBody('');
      setArtHelp('');
      setAdminMessage('Guidance article published.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'guidance_articles');
    }
  };

  const handleToggleArticlePublish = async (art: GuidanceArticle) => {
    try {
      await updateDoc(doc(db, 'guidance_articles', art.id), {
        published: !art.published,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `guidance_articles/${art.id}`);
    }
  };

  const handleSeedResources = async () => {
    setAdminMessage(null);
    try {
      await Promise.all(
        BASELINE_SUPPORT_RESOURCES.map((res) =>
          setDoc(doc(db, 'healthcare_resources', res.id), {
            name: res.name.slice(0, 140),
            category: res.category,
            services: res.services.slice(0, 8),
            description: res.description.slice(0, 500),
            locationLabel: res.locationLabel.slice(0, 180),
            hours: res.hours.slice(0, 120),
            costInfo: res.costInfo.slice(0, 120),
            contactValue: res.contactValue.slice(0, 160),
            verificationNote: res.verificationNote.slice(0, 180),
            active: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        )
      );
      setAdminMessage('Published baseline healthcare resource directory to Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'healthcare_resources');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMessage(null);
    const servicesList = resServices
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (
      !resName.trim() ||
      servicesList.length === 0 ||
      !resDesc.trim() ||
      !resLocation.trim() ||
      !resHours.trim() ||
      !resCost.trim() ||
      !resContact.trim()
    ) {
      setAdminMessage('Please complete all healthcare resource fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'healthcare_resources'), {
        name: resName.trim().slice(0, 140),
        category: resCat,
        services: servicesList,
        description: resDesc.trim().slice(0, 500),
        locationLabel: resLocation.trim().slice(0, 180),
        hours: resHours.trim().slice(0, 120),
        costInfo: resCost.trim().slice(0, 120),
        contactValue: resContact.trim().slice(0, 160),
        verificationNote: resNote.trim().slice(0, 180) || 'Verified by administrator',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setResName('');
      setResServices('');
      setResDesc('');
      setResLocation('');
      setResHours('');
      setResCost('');
      setResContact('');
      setAdminMessage('Healthcare resource added to directory.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'healthcare_resources');
    }
  };

  const handleUpdateReportStatus = async (
    report: SafetyReportDoc,
    nextStatus: SafetyReportDoc['status']
  ) => {
    const note = (notesDraft[report.id] ?? report.adminNotes).slice(0, 600);
    try {
      await updateDoc(doc(db, 'safety_reports', report.id), {
        status: nextStatus,
        adminNotes: note,
        updatedAt: serverTimestamp(),
      });
      setAdminMessage(`Updated report status to "${nextStatus}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `safety_reports/${report.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#4E7D63]">
            Protected Admin & Content Management
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
            SereMate Admin Console
          </h1>
        </div>
        <div className="rounded-2xl bg-[#E6EFE9] border border-[#4E7D63]/20 px-4 py-2.5 flex items-center gap-2 text-xs text-[#244D36]">
          <Lock className="w-4 h-4 shrink-0" />
          <span>Private user conversations remain strictly inaccessible to administrators.</span>
        </div>
      </div>

      {adminMessage && (
        <div className="rounded-2xl bg-[#E6EFE9] border border-[#4E7D63]/25 p-3.5 flex items-center gap-2 text-sm text-[#244D36]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{adminMessage}</span>
        </div>
      )}

      {/* Admin Sub-Navigation */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'guidance', label: 'Educational Guidance', icon: BookOpen },
            { id: 'resources', label: 'Healthcare Listings', icon: Stethoscope },
            { id: 'reports', label: `Safety Reports (${reports.filter((r) => r.status !== 'resolved').length})`, icon: Flag },
            { id: 'analytics', label: 'Aggregated Analytics', icon: BarChart3 },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#231F1D] text-white'
                  : 'bg-[#FDFBF7] border border-[#231F1D]/10 text-[#231F1D] hover:bg-[#F2EBE0]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {subTab === 'guidance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-[#231F1D]">
                Firestore Guidance Articles ({articles.length})
              </h2>
              <button
                type="button"
                onClick={() => void handleSeedArticles()}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#E6EFE9] hover:bg-[#D7E6DC] text-xs font-semibold text-[#244D36]"
              >
                Seed Baseline Library
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-6 text-sm text-[#5E5650]">
                No custom articles in Firestore yet. Click “Seed Baseline Library” or create a new article on the right.
              </div>
            ) : (
              articles.map((art) => (
                <div
                  key={art.id}
                  className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#4E7D63]">
                      {art.category} · {art.published ? 'Published' : 'Draft'}
                    </p>
                    <h3 className="text-sm font-semibold text-[#231F1D]">{art.title}</h3>
                    <p className="text-xs text-[#5E5650]">{art.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void handleToggleArticlePublish(art)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF5EE] text-xs font-semibold text-[#231F1D]"
                    >
                      {art.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteDoc(doc(db, 'guidance_articles', art.id))}
                      aria-label="Delete article"
                      className="p-2 rounded-lg text-[#877D74] hover:text-[#C65D3B]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => void handleCreateArticle(e)}
            className="lg:col-span-5 bg-[#FDFBF7] border border-[#231F1D]/10 rounded-3xl p-6 space-y-3.5"
          >
            <h3 className="font-display text-lg font-semibold text-[#231F1D] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C65D3B]" />
              Add Educational Article
            </h3>
            <input
              type="text"
              maxLength={140}
              required
              value={artTitle}
              onChange={(e) => setArtTitle(e.target.value)}
              placeholder="Article title"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <select
              value={artCat}
              onChange={(e) => setArtCat(e.target.value as GuidanceCategory)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            >
              <option value="Puberty & Growth">Puberty & Growth</option>
              <option value="Menstrual Health">Menstrual Health</option>
              <option value="Pregnancy Awareness">Pregnancy Awareness</option>
              <option value="Sexual & Reproductive Health">Sexual & Reproductive Health</option>
              <option value="Healthy Relationships & Boundaries">
                Healthy Relationships & Boundaries
              </option>
              <option value="When & Where to Get Help">When & Where to Get Help</option>
            </select>
            <textarea
              rows={2}
              maxLength={400}
              required
              value={artSummary}
              onChange={(e) => setArtSummary(e.target.value)}
              placeholder="Short summary..."
              className="w-full p-3 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <textarea
              rows={4}
              required
              value={artBody}
              onChange={(e) => setArtBody(e.target.value)}
              placeholder="Article paragraphs (separate paragraphs with a new line)..."
              className="w-full p-3 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <textarea
              rows={2}
              maxLength={500}
              required
              value={artHelp}
              onChange={(e) => setArtHelp(e.target.value)}
              placeholder="When to seek professional help..."
              className="w-full p-3 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-[#C65D3B] hover:bg-[#AE4D2E] text-white text-sm font-semibold"
            >
              Publish Article
            </button>
          </form>
        </div>
      )}

      {subTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-[#231F1D]">
                Firestore Healthcare Listings ({resources.length})
              </h2>
              <button
                type="button"
                onClick={() => void handleSeedResources()}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#E6EFE9] hover:bg-[#D7E6DC] text-xs font-semibold text-[#244D36]"
              >
                Seed Baseline Directory
              </button>
            </div>

            {resources.length === 0 ? (
              <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-6 text-sm text-[#5E5650]">
                No healthcare listings in Firestore yet. Click “Seed Baseline Directory” or add a verified local listing.
              </div>
            ) : (
              resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#4E7D63]">
                      {res.category} · {res.active ? 'Active' : 'Hidden'}
                    </p>
                    <h3 className="text-sm font-semibold text-[#231F1D]">{res.name}</h3>
                    <p className="text-xs text-[#5E5650]">
                      {res.contactValue} · {res.locationLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteDoc(doc(db, 'healthcare_resources', res.id))}
                    aria-label="Delete healthcare resource"
                    className="p-2 rounded-lg text-[#877D74] hover:text-[#C65D3B]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => void handleCreateResource(e)}
            className="lg:col-span-5 bg-[#FDFBF7] border border-[#231F1D]/10 rounded-3xl p-6 space-y-3"
          >
            <h3 className="font-display text-lg font-semibold text-[#231F1D] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#4E7D63]" />
              Add Verified Resource
            </h3>
            <input
              type="text"
              maxLength={140}
              required
              value={resName}
              onChange={(e) => setResName(e.target.value)}
              placeholder="Clinic or helpline name"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <select
              value={resCat}
              onChange={(e) => setResCat(e.target.value as HealthcareResource['category'])}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            >
              <option value="Youth Clinic">Youth Clinic</option>
              <option value="24/7 Helpline">24/7 Helpline</option>
              <option value="Community Health">Community Health</option>
              <option value="Counseling & Advocacy">Counseling & Advocacy</option>
            </select>
            <input
              type="text"
              required
              value={resServices}
              onChange={(e) => setResServices(e.target.value)}
              placeholder="Services (comma-separated)"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <textarea
              rows={2}
              maxLength={500}
              required
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              placeholder="Short description..."
              className="w-full p-3 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <input
              type="text"
              maxLength={180}
              required
              value={resLocation}
              onChange={(e) => setResLocation(e.target.value)}
              placeholder="Address or coverage region"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                maxLength={120}
                required
                value={resHours}
                onChange={(e) => setResHours(e.target.value)}
                placeholder="Operating hours"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
              />
              <input
                type="text"
                maxLength={120}
                required
                value={resCost}
                onChange={(e) => setResCost(e.target.value)}
                placeholder="Cost (e.g., Free)"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
              />
            </div>
            <input
              type="text"
              maxLength={160}
              required
              value={resContact}
              onChange={(e) => setResContact(e.target.value)}
              placeholder="Verified phone or official URL"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <input
              type="text"
              maxLength={180}
              required
              value={resNote}
              onChange={(e) => setResNote(e.target.value)}
              placeholder="Verification note"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-sm"
            />
            <button
              type="submit"
              className="w-full min-h-[44px] rounded-xl bg-[#4E7D63] hover:bg-[#3D6650] text-white text-sm font-semibold"
            >
              Add Resource Listing
            </button>
          </form>
        </div>
      )}

      {subTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#231F1D]">
            Safety & Content Reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-3xl p-8 text-sm text-[#5E5650]">
              No safety or content reports submitted yet.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-3xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#C65D3B]">
                    {rep.category.replace('_', ' ')} · {rep.relatedTopic}
                  </p>
                  <span className="text-xs font-semibold text-[#231F1D] uppercase">
                    Status: {rep.status}
                  </span>
                </div>
                <p className="text-sm text-[#231F1D] leading-relaxed">{rep.description}</p>

                {rep.status !== 'resolved' ? (
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      maxLength={600}
                      value={notesDraft[rep.id] ?? rep.adminNotes}
                      onChange={(e) =>
                        setNotesDraft((prev) => ({ ...prev, [rep.id]: e.target.value }))
                      }
                      placeholder="Add admin triage note..."
                      className="flex-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-[#FAF5EE] border border-[#231F1D]/12 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => void handleUpdateReportStatus(rep, 'reviewing')}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F2EBE0] text-xs font-semibold text-[#231F1D]"
                    >
                      Mark Reviewing
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUpdateReportStatus(rep, 'resolved')}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#4E7D63] text-xs font-semibold text-white"
                    >
                      Resolve
                    </button>
                  </div>
                ) : (
                  rep.adminNotes && (
                    <p className="text-xs text-[#4E7D63]">Resolution note: {rep.adminNotes}</p>
                  )
                )}
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#231F1D]">
            Aggregated Usage Metrics (De-Identified)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 tabular-nums">
            <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-5">
              <p className="text-xs text-[#5E5650]">AI Companion Turns</p>
              <p className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
                {analyticsSummary.chatTurns}
              </p>
            </div>
            <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-5">
              <p className="text-xs text-[#5E5650]">Assessments Completed</p>
              <p className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
                {analyticsSummary.assessments}
              </p>
            </div>
            <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-5">
              <p className="text-xs text-[#5E5650]">Guidance Views</p>
              <p className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
                {analyticsSummary.guidanceViews}
              </p>
            </div>
            <div className="bg-[#FDFBF7] border border-[#231F1D]/10 rounded-2xl p-5">
              <p className="text-xs text-[#5E5650]">Support Directory Views</p>
              <p className="font-display text-3xl font-semibold text-[#231F1D] mt-1">
                {analyticsSummary.supportViews}
              </p>
            </div>
            <div className="bg-[#FBECE6] border border-[#C65D3B]/20 rounded-2xl p-5">
              <p className="text-xs text-[#7A2D15]">Safeguarding Triggers</p>
              <p className="font-display text-3xl font-semibold text-[#7A2D15] mt-1">
                {analyticsSummary.safetyTriggers}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
