# SereMate — Adolescent Reproductive Health Companion

> **Your Questions Deserve Care, Not Judgment.**

**SereMate** is a full-stack, privacy-first web application designed for adolescents aged **10–19**. It provides a warm, supportive, non-judgmental space to ask reproductive health questions, explore evidence-based guidance, reflect on personal care needs, connect safely with peer circles, and find confidential youth-friendly healthcare support.

---

## Key Features

### 1. Ask Sere — Bilingual AI Health Companion
- **Empathetic, Non-Judgmental Chat:** Powered server-side by Google Gemini (`gemini-3.1-flash-lite` with automatic fallback to `gemini-4-hydrogen`) via `@google/genai`, grounded in an evidence-based adolescent health knowledge base (WHO, UNFPA, UNESCO, AAP, CDC references).
- **Bilingual Support (English & Indonesian):** Automatically responds in the same language the user writes in, with context-aware follow-up suggestions.
- **Clinical Guardrails:** Never diagnoses conditions, confirms pregnancy, or prescribes medication; clearly communicates uncertainty and encourages professional care when needed.
- **Safety & Safeguarding Triage:** Detects elevated or urgent distress/medical warning signals and surfaces immediate care banners and clinic/helpline links.

### 2. "Are You Pregnant Right Now?" — Safe Care & Keep Healthy
- **3 Gentle Entry Paths:** Tailored support for *Currently Pregnant*, *Not Sure / Late Period*, or *Supporting a Friend / Learning*.
- **Daily Keep-Healthy & Safe Checklist:** Interactive self-care tracker (hydration, folate & iron nutrition, prenatal consultation, rest, avoiding alcohol/vaping/unverified remedies, and youth clinic visits) persisted privately in the browser's `localStorage`.
- **Testing Timing & Urgent Red Flags:** Clear guidance on accurate pregnancy test timing and symptoms that require immediate medical care.

### 3. Peer & Community Activity (Safe & Anonymous)
- **Youth Wellness Circles & Activities:** Self-paced challenges and workshops with Join / Done progress tracking.
- **Anonymous Peer Encouragement Wall:** Users share uplifting notes under nature-themed aliases (zero real names or contact info) and send **Hugs (+1)** reactions. Client-side and Firestore security checks prevent emails, phone numbers, or external URLs.
- **Weekly Peer Poll:** Interactive anonymous voting on upcoming Q&A topics.

### 4. Structured Health Guidance & Needs Assessment
- **Health Guidance Library:** Searchable, categorized guides covering *Puberty & Growth*, *Menstrual Health*, *Pregnancy Awareness*, *Sexual & Reproductive Health*, *Healthy Relationships & Boundaries*, and *When & Where to Get Help*.
- **Guided Risk & Needs Self-Assessment:** Step-by-step multiple-choice check-in categorizing informational, guided, or priority support needs—paired with personalized next steps.
- **Healthcare & Support Navigator:** Filterable directory of youth clinics, 24/7 helplines, community health centers, and counseling resources.

### 5. Authentication & Instant Demo Mode
- **Instant Demo Mode:** Try every feature immediately without creating an account (demo data remains strictly in the browser session).
- **Full Firebase Authentication:** Email/Password sign-up & login, Google Sign-In, password reset, email verification notice, age-bracket personalization, privacy settings, and saved conversation history.
- **Admin Moderation Console:** Protected role-based console (`admins/{uid}`) to manage published articles, healthcare directories, safety reports, and anonymized aggregate usage counts (admins cannot read private user chats).

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend:** Express (`server.ts`) running with Vite middleware in development and static serving in production
- **AI Engine:** `@google/genai` (`gemini-3.1-flash-lite` primary + `gemini-4-hydrogen` fallback) with Retrieval-Augmented Generation (RAG) & safeguarding directives
- **Database & Auth:** Firebase Authentication + Cloud Firestore (`firestore.rules`, `firebase-blueprint.json`)

---

## Project Structure

```text
├── server.ts                        # Express server + API routes (/api/seremate/chat, /api/config/status)
├── server/
│   ├── agents/
│   │   ├── seremateEngine.ts        # Gemini orchestration, hedged retry/fallback, safety triage
│   │   └── medicalKnowledgeAgent.ts # Keyword-scored RAG retriever
│   └── data/
│       └── knowledgeBase.ts         # Evidence-based adolescent health reference chunks
├── src/
│   ├── App.tsx                      # App shell, auth state, Demo Mode, Firestore listeners
│   ├── firebase.ts                  # Firebase SDK initialization & error helpers
│   ├── components/
│   │   ├── AuthPortal.tsx           # Login, Register, Password Reset & Instant Demo entry
│   │   ├── DashboardView.tsx        # Home hub, mood check-in & feature navigation
│   │   ├── CompanionView.tsx        # Ask Sere AI chat interface
│   │   ├── PregnancyCareView.tsx    # Pregnancy check & Keep-Healthy daily checklist
│   │   ├── CommunityView.tsx        # Youth activities, anonymous peer wall & weekly poll
│   │   ├── GuidanceView.tsx         # Structured health articles
│   │   ├── AssessmentView.tsx       # Guided risk & needs questionnaire
│   │   ├── SupportNavigatorView.tsx # Verified clinics & 24/7 helplines directory
│   │   ├── HistoryView.tsx          # Saved conversation threads
│   │   ├── ProfileView.tsx          # Account & privacy settings
│   │   ├── AdminView.tsx            # Content & safety report moderation
│   │   ├── SereMascot.tsx           # Expressive companion character & logo mark
│   │   └── SereMateNav.tsx          # Responsive desktop header & mobile bottom nav
│   ├── data/                        # Baseline guides, clinics, assessment & community seeds
│   └── types/                       # Shared TypeScript interfaces
├── firestore.rules                  # Hardened Cloud Firestore security rules
└── firebase-blueprint.json          # Firestore schema & entity blueprint
