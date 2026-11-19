# SereMate — Adolescent Reproductive Health Companion

**Tagline:** *Your Questions Deserve Care, Not Judgment.*

SereMate is a privacy-first, responsive web application providing adolescents aged 10–19 with an empathetic AI health companion, structured reproductive health guidance, guided risk & needs self-assessment, safeguarding referrals, healthcare navigation, and a protected admin content console.

## Architecture Overview

- **Frontend:** React 19, Vite, Tailwind CSS v4, TypeScript
- **Authentication & Database:** Firebase Authentication + Cloud Firestore (`firebase-applet-config.json` & `firestore.rules`)
- **Backend & Configurable AI Engine:** Express (`server.ts`) calling Google `@google/genai` (`SEREMATE_AI_MODEL`, defaulting to `gemini-4-hydrogen`) with a RAG knowledge base and safety/safeguarding triage layer.

## Setup & Deployment Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` or configure the following secrets in your hosting environment:
   - `GEMINI_API_KEY`: Server-side Gemini API key (never exposed to the client).
   - `SEREMATE_AI_MODEL`: Optional model override (default: `gemini-4-hydrogen`).
   - `PORT`: Server port (default: `3000`).

3. **Firebase Authentication Providers:**
   - Google Sign-In is enabled by default.
   - To use Email/Password sign-up, sign-in, and password reset in Firebase Authentication, ensure **Email/Password** is enabled under **Firebase Console > Authentication > Sign-in method**.

4. **Deploy Firestore Security Rules:**
   Rules in `firestore.rules` isolate private user profiles, conversations, and assessments strictly to the owning `uid` (administrators are denied access to private user conversations by default).

5. **Run locally or build for production:**
   ```bash
   # Development
   npm run dev

   # Production build & start
   npm run build
   npm start
   ```
