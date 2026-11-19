import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
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

export function getConfiguredModel(): string {
  const configured = process.env.SEREMATE_AI_MODEL?.trim();
  const validModels = new Set([
    'gemini-4-hydrogen',
    'gemini-3.1-flash-lite',
    'gemini-4-neon',
    'gemini-4-argon',
    'gemini-4-carbon',
  ]);
  if (configured && validModels.has(configured)) {
    return configured;
  }
  return 'gemini-4-hydrogen';
}

export function isAiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim();
  return Boolean(key && key !== 'MY_GEMINI_API_KEY');
}

function detectUrgentSafetySignals(message: string): {
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
  ];

  if (urgentCrisisTerms.some((term) => lower.includes(term))) {
    return {
      level: 'urgent',
      banner:
        'Your safety and health come first. If you are in immediate physical danger, experiencing severe pain or heavy bleeding, or facing abuse or self-harm thoughts, please contact local emergency services (such as 911 / 112), a trusted adult, or a 24/7 crisis support line right away.',
      directives: [
        'Lead with calm, compassionate validation and prioritize immediate physical and emotional safety.',
        'Clearly recommend speaking with a qualified healthcare professional, emergency service, or crisis counselor.',
        'Do not attempt to diagnose or handle acute emergencies through AI chat alone.',
      ],
    };
  }

  if (elevatedTerms.some((term) => lower.includes(term))) {
    return {
      level: 'elevated',
      banner:
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

export async function runSereMateCompanion(params: {
  message: string;
  history: SereMateChatTurn[];
  ageBracket?: string;
}): Promise<SereMateChatResponse> {
  if (!isAiConfigured()) {
    const err = new Error(
      'AI Health Companion is not configured yet because GEMINI_API_KEY is missing. Please add GEMINI_API_KEY in Settings > Secrets.'
    ) as Error & { status?: number; code?: string };
    err.status = 503;
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const modelName = getConfiguredModel();
  const safety = detectUrgentSafetySignals(params.message);
  const ragChunks = retrieveMedicalKnowledge(params.message, 3);

  const ragContext = ragChunks
    .map(
      (chunk) =>
        `[${chunk.source} — ${chunk.title}]\n${chunk.summary}\n${chunk.facts
          .map((f) => `- ${f}`)
          .join('\n')}`
    )
    .join('\n\n');

  const historyBlock = params.history
    .slice(-8)
    .map((t) => `${t.role === 'user' ? 'User' : 'SereMate'}: ${t.content}`)
    .join('\n');

  const ageGuidance =
    params.ageBracket === '10-12'
      ? 'User age group is 10–12: use extra clear, gentle, foundational explanations and encourage involving a trusted parent, guardian, or school nurse when helpful.'
      : `User age group is ${params.ageBracket || '13–19'}: use respectful, mature, clear, non-condescending adolescent language.`;

  const systemInstruction = `You are SereMate, an AI-powered adolescent reproductive health companion for users aged 10–19.
Tagline: "Your Questions Deserve Care, Not Judgment."

Mandatory clinical, ethical, and safety rules:
1. Always respond with empathy, warmth, respect, and zero judgment or moralizing.
2. NEVER diagnose medical conditions, confirm pregnancy, or prescribe/recommend specific prescription medications.
3. Clearly communicate uncertainty when a symptom or situation cannot be assessed without an in-person clinician.
4. Direct users to qualified healthcare professionals, clinics, or emergency services whenever symptoms, distress, or risks warrant human care.
5. Keep language accessible, calm, and structured in short readable paragraphs.
6. ${ageGuidance}
7. Ground medical facts in the provided Evidence-Based Reference Context rather than guessing.`;

  const prompt = `Conversation History:
${historyBlock || '(New conversation)'}

Latest User Message:
"${params.message}"

Safety Assessment Level: ${safety.level}
Safety Directives:
${safety.directives.map((d) => `- ${d}`).join('\n')}

Evidence-Based Reference Context:
${ragContext}

Return JSON with:
- reply: SereMate's supportive, clear response (no markdown heading syntax, use crisp paragraphs).
- recommendedGuidanceCategory: one of "Puberty & Growth", "Menstrual Health", "Pregnancy Awareness", "Sexual & Reproductive Health", "Healthy Relationships & Boundaries", "When & Where to Get Help".
- needsProfessionalCare: boolean (true if seeing a nurse, doctor, or counselor is recommended).
- suggestedFollowUps: 2 or 3 short natural follow-up questions (under 9 words each).`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          recommendedGuidanceCategory: {
            type: Type.STRING,
            enum: [
              'Puberty & Growth',
              'Menstrual Health',
              'Pregnancy Awareness',
              'Sexual & Reproductive Health',
              'Healthy Relationships & Boundaries',
              'When & Where to Get Help',
            ],
          },
          needsProfessionalCare: { type: Type.BOOLEAN },
          suggestedFollowUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          'reply',
          'recommendedGuidanceCategory',
          'needsProfessionalCare',
          'suggestedFollowUps',
        ],
      },
    },
  });

  const raw = (response.text ?? '{}').trim();
  const parsed = JSON.parse(raw) as Partial<SereMateChatResponse>;

  if (!parsed.reply) {
    throw new Error('The AI model returned an empty response. Please try again.');
  }

  return {
    reply: parsed.reply,
    safetyLevel: safety.level,
    safetyBanner: safety.banner,
    suggestedFollowUps:
      Array.isArray(parsed.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0
        ? parsed.suggestedFollowUps.slice(0, 3)
        : ['When should I speak to a nurse?', 'How can I prepare for a clinic visit?'],
    recommendedGuidanceCategory:
      parsed.recommendedGuidanceCategory || 'When & Where to Get Help',
    needsProfessionalCare:
      Boolean(parsed.needsProfessionalCare) || safety.level !== 'routine',
    modelUsed: modelName,
  };
}
