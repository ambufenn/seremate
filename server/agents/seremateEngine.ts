import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { retrieveMedicalKnowledge } from './medicalKnowledgeAgent.ts';

export type SafetyLevel = 'routine' | 'elevated' | 'urgent';

export interface SereMateChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface SereMateChatResponse {
  reply: string;
  safetyLevel: SafetyLevel;
  safetyBanner: string | null;
  suggestedFollowUps: string[];
  recommendedGuidanceCategory: string;
  needsProfessionalCare: boolean;
  modelUsed: string;
}

export type SereMateStreamEvent =
  | {
      type: 'meta';
      safetyLevel: SafetyLevel;
      safetyBanner: string | null;
      recommendedGuidanceCategory: string;
      needsProfessionalCare: boolean;
      modelUsed: string;
    }
  | { type: 'delta'; text: string }
  | {
      type: 'done';
      reply: string;
      safetyLevel: SafetyLevel;
      safetyBanner: string | null;
      suggestedFollowUps: string[];
      recommendedGuidanceCategory: string;
      needsProfessionalCare: boolean;
      modelUsed: string;
    };

const VALID_MODELS = new Set([
  'gemini-3.1-flash-lite',
  'gemini-4-hydrogen',
  'gemini-4-neon',
  'gemini-4-argon',
  'gemini-4-carbon',
]);

let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | undefined;

function getAiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'AI Health Companion is not configured yet because GEMINI_API_KEY is missing. Please add GEMINI_API_KEY in Settings > Secrets.'
    ) as Error & { status?: number; code?: string };
    err.status = 503;
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  if (!cachedClient || cachedKey !== key) {
    cachedKey = key;
    cachedClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export function getConfiguredModel(): string {
  const configured = process.env.SEREMATE_AI_MODEL?.trim();
  if (configured && VALID_MODELS.has(configured)) {
    return configured;
  }
  // gemini-3.1-flash-lite with ThinkingLevel.MINIMAL gives lowest latency for live chat
  return 'gemini-3.1-flash-lite';
}

function getModelFallbacks(): string[] {
  const primary = getConfiguredModel();
  const ordered = [primary, 'gemini-3.1-flash-lite', 'gemini-4-hydrogen'];
  return Array.from(new Set(ordered));
}

function getThinkingLevelForModel(model: string): ThinkingLevel {
  if (model === 'gemini-3.1-flash-lite') {
    return ThinkingLevel.MINIMAL;
  }
  if (model === 'gemini-4-argon' || model === 'gemini-4-carbon') {
    return ThinkingLevel.MEDIUM;
  }
  return ThinkingLevel.LOW;
}

export function isAiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

function looksIndonesian(text: string): boolean {
  const lower = text.toLowerCase();
  const strongIdWords = new Set([
    'aku',
    'saya',
    'kamu',
    'haid',
    'mens',
    'menstruasi',
    'hamil',
    'kehamilan',
    'telat',
    'takut',
    'gimana',
    'bagaimana',
    'kenapa',
    'apakah',
    'boleh',
    'bahaya',
    'dokter',
    'bidan',
    'puskesmas',
    'pacar',
    'nyeri',
    'kram',
    'keputihan',
    'sakit',
    'tolong',
    'dong',
    'banget',
    'nggak',
    'tidak',
    'kalau',
    'klo',
    'hai',
    'halo',
  ]);
  const words = lower.split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, '');
    if (strongIdWords.has(clean)) return true;
  }
  return /\b(telat haid|datang bulan|apa kabar|terima kasih|bisa gak|bisa ga)\b/i.test(lower);
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  zh: 'Simplified Chinese (中文)',
  ja: 'Japanese (日本語)',
  sw: 'Kiswahili (Swahili)',
  fr: 'French (Français)',
  ar: 'Arabic (العربية)',
  es: 'Spanish (Español)',
  ko: 'Korean (한국어)',
  hi: 'Hindi (हिन्दी)',
};

function resolveTargetLanguage(preferredLanguage: string | undefined, message: string): {
  code: string;
  label: string;
} {
  if (looksIndonesian(message)) {
    return { code: 'id', label: LANGUAGE_NAMES.id };
  }
  if (/[\u4e00-\u9fff]/.test(message) && !/[\u3040-\u309f\u30a0-\u30ff]/.test(message)) {
    return { code: 'zh', label: LANGUAGE_NAMES.zh };
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(message)) {
    return { code: 'ja', label: LANGUAGE_NAMES.ja };
  }
  if (/[\u0600-\u06ff]/.test(message)) {
    return { code: 'ar', label: LANGUAGE_NAMES.ar };
  }
  if (/[\uac00-\ud7af]/.test(message)) {
    return { code: 'ko', label: LANGUAGE_NAMES.ko };
  }
  if (/[\u0900-\u097f]/.test(message)) {
    return { code: 'hi', label: LANGUAGE_NAMES.hi };
  }
  const code = preferredLanguage && LANGUAGE_NAMES[preferredLanguage] ? preferredLanguage : 'en';
  return { code, label: LANGUAGE_NAMES[code] };
}

function detectUrgentSafetySignals(message: string, langCode: string): {
  level: SafetyLevel;
  banner: string | null;
  directives: string[];
} {
  const lower = message.toLowerCase();

  const urgentCrisisTerms = [
    'hurt myself',
    'kill myself',
    'suicide',
    'end my life',
    'want to die',
    'being abused',
    'hurting me',
    'hit me',
    'assaulted',
    'raped',
    'forced me',
    'severe pain',
    'passing out',
    'fainting',
    'soaking through',
    'heavy bleeding',
    'blackmail',
    'sextortion',
    'threaten to share',
    'bunuh diri',
    'menyakiti diri',
    'lukai diri',
    'ingin mati',
    'dipukul',
    'kekerasan',
    'diperkosa',
    'dipaksa berhubungan',
    'nyeri hebat',
    'pendarahan hebat',
    'pendarahan banyak',
    'pingsan',
    'diancam sebar',
    'pemerasan',
  ];

  const elevatedTerms = [
    'pregnant',
    'missed period',
    'late period',
    'scared',
    'afraid',
    'tell anyone',
    'unsafe',
    'pressured',
    'unprotected',
    'emergency contraception',
    'plan b',
    'painful cramps',
    'worried',
    'hamil',
    'telat haid',
    'telat mens',
    'terlambat haid',
    'takut',
    'khawatir',
    'panik',
    'tidak aman',
    'dipaksa',
    'tanpa pengaman',
    'kontrasepsi darurat',
    'kram parah',
  ];

  if (urgentCrisisTerms.some((term) => lower.includes(term))) {
    const urgentBanners: Record<string, string> = {
      id: 'Keselamatan dan kesehatanmu adalah yang utama. Jika kamu mengalami nyeri hebat, pendarahan sangat banyak, bahaya fisik, kekerasan, atau pikiran untuk menyakiti diri, segera hubungi layanan darurat (112 / 119 / IGD terdekat), orang dewasa tepercaya, atau layanan konseling krisis.',
      zh: '你的安全与健康永远是第一位的。如果你正处于危险中、出现剧烈疼痛或大量出血，请立即联系当地急救服务、信任的成年人或危机支持热线。',
      ja: 'あなたの安全と健康が何より大切です。激しい痛みや大量出血、危険や暴力がある場合は、すぐに救急・緊急窓口や信頼できる大人へ連絡してください。',
      sw: 'Usalama na afya yako ni kipaumbele cha kwanza. Ikiwa uko hatarini au una maumivu makali au kutokwa na damu nyingi, tafadhali wasiliana na huduma za dharura au mtu mzima unayemwamini mara moja.',
      fr: 'Ta sécurité et ta santé passent avant tout. En cas de danger immédiat, de douleur intense ou de saignement abondant, contacte les services d’urgence ou un adulte de confiance sans attendre.',
    };
    return {
      level: 'urgent',
      banner:
        urgentBanners[langCode] ||
        'Your safety and health come first. If you are in immediate physical danger, experiencing severe pain or heavy bleeding, or facing abuse or self-harm thoughts, please contact local emergency services (such as 911 / 112), a trusted adult, or a 24/7 crisis support line right away.',
      directives: [
        'Lead with calm, compassionate validation and prioritize immediate physical and emotional safety.',
        'Clearly recommend speaking with a qualified healthcare professional, emergency service, or crisis counselor.',
        'Do not attempt to diagnose or handle acute emergencies through AI chat alone.',
      ],
    };
  }

  if (elevatedTerms.some((term) => lower.includes(term))) {
    const elevatedBanners: Record<string, string> = {
      id: 'Terima kasih sudah berani bercerita tentang hal yang membuatmu cemas. Kamu tidak harus menanggung ini sendirian—klinik ramah remaja, puskesmas, atau tenaga kesehatan profesional siap membantu secara rahasia.',
      zh: '谢谢你愿意分享让你紧张的事情。你不需要独自面对——青少年友好诊所和专业医护人员可以为你提供保密支持。',
      ja: '不安な気持ちを話してくれてありがとう。一人で抱え込む必要はありません。ユースクリニックや専門の相談窓口が秘密厳守でサポートします。',
      sw: 'Asante kwa kushirikisha jambo linalokupa wasiwasi. Hauko peke yako—kliniki za vijana na wataalamu wa afya wako tayari kukusaidia kwa siri.',
      fr: 'Merci d’avoir partagé ce qui t’inquiète. Tu n’as pas à traverser cela seul·e : des cliniques jeunesse confidentielles sont là pour t’aider.',
    };
    return {
      level: 'elevated',
      banner:
        elevatedBanners[langCode] ||
        'Thank you for sharing something that feels stressful. You do not have to carry this alone—confidential youth clinics and support counselors are available if you want human care.',
      directives: [
        'Validate feelings warmly without judgment, blame, or lecturing.',
        'Provide clear, factual information (such as accurate pregnancy testing windows or boundary rights) while noting when to check with a nurse or doctor.',
        'Offer gentle next steps without pressuring disclosure.',
      ],
    };
  }

  return {
    level: 'routine',
    banner: null,
    directives: [
      'Provide clear, supportive, age-appropriate educational guidance.',
      'Be transparent if a medical question requires an in-person exam or clinician evaluation.',
    ],
  };
}

function mapTopicToGuidanceCategory(topic: string | undefined): string {
  switch (topic) {
    case 'Puberty':
      return 'Puberty & Growth';
    case 'Period Health':
      return 'Menstrual Health';
    case 'Pregnancy Awareness':
      return 'Pregnancy Awareness';
    case 'Contraception & STI Care':
      return 'Sexual & Reproductive Health';
    case 'Consent & Healthy Relationships':
    case 'Digital Safety':
      return 'Healthy Relationships & Boundaries';
    default:
      return 'When & Where to Get Help';
  }
}

function buildSuggestedFollowUps(category: string, langCode: string): string[] {
  if (langCode === 'id') {
    switch (category) {
      case 'Pregnancy Awareness':
        return [
          'Kapan waktu paling akurat untuk tes kehamilan?',
          'Kenapa haid bisa telat selain karena hamil?',
          'Bagaimana cara periksa ke puskesmas/klinik dengan tenang?',
        ];
      case 'Menstrual Health':
        return [
          'Cara aman meredakan nyeri haid di rumah?',
          'Tanda haid apa yang perlu diperiksa dokter?',
        ];
      case 'Healthy Relationships & Boundaries':
        return [
          'Bagaimana cara menolak tekanan dengan tegas?',
          'Siapa yang bisa kuhubungi jika merasa tidak aman?',
        ];
      default:
        return [
          'Kapan sebaiknya aku berkonsultasi ke dokter atau bidan?',
          'Apa yang terjadi saat pemeriksaan di klinik remaja?',
        ];
    }
  }
  if (langCode === 'zh') {
    return ['什么时候去医院或诊所检查比较好？', '青少年保密门诊一般会问什么问题？'];
  }
  if (langCode === 'ja') {
    return ['医療機関やクリニックにはいつ相談すべき？', 'ユースクリニックの受診は秘密が守られますか？'];
  }
  if (langCode === 'sw') {
    return ['Ni lini ninapaswa kumwona muuguzi au daktari?', 'Nijiandae vipi kwa ziara ya kliniki ya siri?'];
  }
  if (langCode === 'fr') {
    return ['Quand consulter un·e professionnel·le de santé ?', 'Comment se passe une visite confidentielle ?'];
  }

  switch (category) {
    case 'Pregnancy Awareness':
      return [
        'When is a pregnancy test most accurate?',
        'What else can make a period late?',
        'How do confidential youth clinic visits work?',
      ];
    case 'Menstrual Health':
      return [
        'How can I soothe period cramps safely?',
        'What bleeding signs need a doctor check?',
      ];
    case 'Healthy Relationships & Boundaries':
      return [
        'How can I say no safely under pressure?',
        'Where can I get confidential safety help?',
      ];
    default:
      return [
        'When should I speak to a nurse?',
        'How can I prepare for a clinic visit?',
      ];
  }
}

function buildPromptAndContext(params: {
  message: string;
  history: SereMateChatTurn[];
  ageBracket?: string;
  preferredLanguage?: string;
}) {
  const targetLang = resolveTargetLanguage(params.preferredLanguage, params.message);
  const safety = detectUrgentSafetySignals(params.message, targetLang.code);
  const ragChunks = retrieveMedicalKnowledge(params.message, 2);
  const recommendedGuidanceCategory = mapTopicToGuidanceCategory(ragChunks[0]?.topic);

  const ragContext = ragChunks
    .map(
      (chunk) =>
        `[${chunk.title}]\n${chunk.summary}\n${chunk.facts
          .slice(0, 3)
          .map((f) => `- ${f}`)
          .join('\n')}`
    )
    .join('\n\n');

  const historyBlock = params.history
    .slice(-6)
    .map((t) => `${t.role === 'user' ? 'User' : 'Sere'}: ${t.content.slice(0, 450)}`)
    .join('\n');

  const ageGuidance =
    params.ageBracket === '10-12'
      ? 'User age group is 10-12: use extra simple, warm explanations and encourage involving a trusted parent, guardian, or school nurse.'
      : `User age group is ${params.ageBracket || '13-19'}: use respectful, warm, clear, non-condescending adolescent language.`;

  const systemInstruction = `You are Sere, the AI health companion inside SereMate for adolescents aged 10-19 ("Your Questions Deserve Care, Not Judgment.").
Rules:
1. Reply naturally in ${targetLang.label} (or match the exact language the user writes in if clearly different).
2. Be empathetic, gentle, and non-judgmental. Never lecture or shame.
3. NEVER diagnose conditions, confirm pregnancy, or prescribe medications.
4. Keep replies concise and clear for mobile reading (2-3 short paragraphs, ~70-120 words, no # markdown headings).
5. Recommend a qualified doctor, midwife, youth clinic, or trusted adult when medical care or safety is needed.
6. ${ageGuidance}`;

  const prompt = `History:
${historyBlock || '(New chat)'}

User: "${params.message}"
Safety: ${safety.level} (${safety.directives.join(' ')})
Facts:
${ragContext}`;

  return {
    targetLang,
    safety,
    recommendedGuidanceCategory,
    suggestedFollowUps: buildSuggestedFollowUps(recommendedGuidanceCategory, targetLang.code),
    systemInstruction,
    prompt,
  };
}

export function formatFriendlyGeminiError(error: unknown): {
  status: number;
  message: string;
  code: string;
} {
  const err = error as { status?: number; code?: string; message?: string };
  const raw = err?.message || 'Unable to reach Sere AI right now.';

  if (
    raw.includes('API_KEY_INVALID') ||
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('API key not valid')
  ) {
    return {
      status: 403,
      code: 'API_KEY_INVALID',
      message:
        'Kunci API Gemini belum valid atau ditolak. Periksa GEMINI_API_KEY di menu Settings > Secrets.',
    };
  }
  if (raw.includes('AI_NOT_CONFIGURED') || err?.code === 'AI_NOT_CONFIGURED') {
    return {
      status: 503,
      code: 'AI_NOT_CONFIGURED',
      message:
        'GEMINI_API_KEY belum terpasang di server. Tambahkan GEMINI_API_KEY di Settings > Secrets untuk mengaktifkan chat.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || err?.status === 429) {
    return {
      status: 429,
      code: 'RESOURCE_EXHAUSTED',
      message:
        'Layanan Gemini sedang mencapai batas permintaan sementara. Coba kirim ulang sebentar lagi.',
    };
  }
  if (
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand') ||
    raw.includes('TIMEOUT') ||
    err?.status === 503
  ) {
    return {
      status: 503,
      code: 'MODEL_BUSY',
      message:
        'Server Gemini sedang padat sesaat. Silakan klik kirim ulang dalam beberapa detik.',
    };
  }
  return {
    status: typeof err?.status === 'number' && err.status >= 400 ? err.status : 500,
    code: err?.code || 'GEMINI_ERROR',
    message: 'Maaf, Sere mengalami gangguan koneksi sementara ke Gemini. Coba kirim lagi ya.',
  };
}

function isRetryableModelError(err: unknown): boolean {
  const e = err as { status?: number; message?: string };
  const msg = e?.message || '';
  return (
    e?.status === 503 ||
    e?.status === 429 ||
    e?.status === 404 ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('high demand') ||
    msg.includes('TIMEOUT') ||
    msg.includes('NOT_FOUND')
  );
}

async function generateOnce(
  ai: GoogleGenAI,
  modelName: string,
  prompt: string,
  systemInstruction: string,
  timeoutMs: number
): Promise<{ reply: string; modelUsed: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: getThinkingLevelForModel(modelName) },
        abortSignal: controller.signal,
      },
    });
    const reply = (response.text ?? '').trim();
    if (!reply) {
      throw new Error('The AI model returned an empty response.');
    }
    return { reply, modelUsed: modelName };
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function* streamSereMateCompanion(params: {
  message: string;
  history: SereMateChatTurn[];
  ageBracket?: string;
  preferredLanguage?: string;
}): AsyncGenerator<SereMateStreamEvent> {
  const result = await runSereMateCompanion(params);
  yield {
    type: 'meta',
    safetyLevel: result.safetyLevel,
    safetyBanner: result.safetyBanner,
    recommendedGuidanceCategory: result.recommendedGuidanceCategory,
    needsProfessionalCare: result.needsProfessionalCare,
    modelUsed: result.modelUsed,
  };
  yield { type: 'delta', text: result.reply };
  yield {
    type: 'done',
    ...result,
  };
}

export async function runSereMateCompanion(params: {
  message: string;
  history: SereMateChatTurn[];
  ageBracket?: string;
  preferredLanguage?: string;
}): Promise<SereMateChatResponse> {
  const ai = getAiClient();
  const ctx = buildPromptAndContext(params);
  const modelsToTry = getModelFallbacks();
  const primaryModel = modelsToTry[0];
  const backupModel = modelsToTry[1] || primaryModel;

  const formatSuccess = (res: { reply: string; modelUsed: string }): SereMateChatResponse => ({
    reply: res.reply,
    safetyLevel: ctx.safety.level,
    safetyBanner: ctx.safety.banner,
    suggestedFollowUps: ctx.suggestedFollowUps,
    recommendedGuidanceCategory: ctx.recommendedGuidanceCategory,
    needsProfessionalCare: ctx.safety.level !== 'routine',
    modelUsed: res.modelUsed,
  });

  // Launch primary immediately; fire backup hedge if primary fails or stalls past 8s
  let hedgeTimer: ReturnType<typeof setTimeout> | null = null;

  const primaryPromise = generateOnce(
    ai,
    primaryModel,
    ctx.prompt,
    ctx.systemInstruction,
    18000
  );

  const hedgedPromise = new Promise<{ reply: string; modelUsed: string }>((resolve, reject) => {
    let settled = false;
    let backupStarted = false;
    let primaryFailed = false;
    let backupFailed = false;
    let lastErr: unknown = null;

    const tryRejectIfAllDone = () => {
      if (!settled && primaryFailed && (!backupStarted || backupFailed)) {
        settled = true;
        reject(lastErr ?? new Error('Unable to generate a response.'));
      }
    };

    const startBackup = () => {
      if (settled || backupStarted) return;
      backupStarted = true;
      if (hedgeTimer) {
        clearTimeout(hedgeTimer);
        hedgeTimer = null;
      }

      // Retry primaryModel after brief backoff AND race backupModel in parallel
      const retryPrimary = new Promise<{ reply: string; modelUsed: string }>((res, rej) => {
        setTimeout(() => {
          generateOnce(ai, primaryModel, ctx.prompt, ctx.systemInstruction, 14000)
            .then(res)
            .catch(rej);
        }, 250);
      });

      const tryBackup =
        backupModel !== primaryModel
          ? generateOnce(ai, backupModel, ctx.prompt, ctx.systemInstruction, 14000)
          : retryPrimary;

      Promise.any([retryPrimary, tryBackup])
        .then((res) => {
          if (!settled) {
            settled = true;
            resolve(res);
          }
        })
        .catch((aggErr) => {
          backupFailed = true;
          const firstInner =
            aggErr && typeof aggErr === 'object' && 'errors' in aggErr && Array.isArray((aggErr as { errors: unknown[] }).errors)
              ? (aggErr as { errors: unknown[] }).errors[0]
              : aggErr;
          lastErr = firstInner || lastErr;
          tryRejectIfAllDone();
        });
    };

    hedgeTimer = setTimeout(() => {
      startBackup();
    }, 8000);

    primaryPromise
      .then((res) => {
        if (hedgeTimer) clearTimeout(hedgeTimer);
        if (!settled) {
          settled = true;
          resolve(res);
        }
      })
      .catch((err) => {
        if (hedgeTimer) clearTimeout(hedgeTimer);
        primaryFailed = true;
        lastErr = err;
        if (!isRetryableModelError(err)) {
          if (!settled) {
            settled = true;
            reject(err);
          }
          return;
        }
        if (!backupStarted) {
          startBackup();
        } else {
          tryRejectIfAllDone();
        }
      });
  });

  const winner = await hedgedPromise;
  return formatSuccess(winner);
}
