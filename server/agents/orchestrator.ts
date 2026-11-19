import { ThinkingLevel, Type } from '@google/genai';
import { getGeminiClient } from './geminiClient.ts';
import { runHealthcareNavigationAgent } from './healthcareNavAgent.ts';
import { retrieveMedicalKnowledge } from './medicalKnowledgeAgent.ts';
import { runRiskAndNeedsAgent } from './riskNeedsAgent.ts';
import { runSafeguardingAgent } from './safeguardingAgent.ts';
import type { ChatTurn, LumiMood, LumiResponsePayload } from './types.ts';

export async function runLumiOrchestrator(
  userMessage: string,
  history: ChatTurn[],
  userMoodContext?: string
): Promise<LumiResponsePayload> {
  // 1. Run Risk & Needs Assessment Agent + Medical RAG Agent in parallel
  const [riskAssessment, ragChunks] = await Promise.all([
    runRiskAndNeedsAgent(userMessage, history),
    Promise.resolve(retrieveMedicalKnowledge(userMessage, 3)),
  ]);

  // 2. Run Safety & Safeguarding Agent
  const safeguarding = runSafeguardingAgent(userMessage, riskAssessment);

  // 3. Run Healthcare Navigation Agent
  const { facilities, careCards } = runHealthcareNavigationAgent(riskAssessment);

  // 4. Conversational Health Agent (Lumi) synthesizes grounded, trauma-informed reply
  const ai = getGeminiClient();

  const ragContextBlock = ragChunks
    .map(
      (chunk) =>
        `[Source: ${chunk.source} — ${chunk.title}]\nSummary: ${chunk.summary}\nFacts:\n${chunk.facts
          .map((f) => `- ${f}`)
          .join('\n')}`
    )
    .join('\n\n');

  const facilitiesBlock = facilities
    .map((f) => `- ${f.name} (${f.category}): ${f.services.join(', ')} | ${f.cost} | ${f.contactValue}`)
    .join('\n');

  const recentHistory = history
    .slice(-8)
    .map((t) => `${t.role === 'user' ? 'User' : 'Lumi'}: ${t.text}`)
    .join('\n');

  const systemInstruction = `You are Lumi, the friendly, warm, non-judgmental AI reproductive health companion for adolescents aged 10–19 inside REPROGUARD ("Your questions deserve care, not judgment").

Core personality & clinical guardrails:
- Always be empathetic, respectful, inclusive, trauma-informed, and calm.
- NEVER shame, blame, lecture, moralize, scold, or pressure the user.
- NEVER diagnose pregnancy, STIs, or medical conditions, and NEVER replace qualified healthcare professionals.
- Keep your response clear, warm, well-structured, and easy to read on a mobile screen (short paragraphs, max ~180 words unless detailed step-by-step testing options are needed).
- When someone expresses fear, pregnancy worry, or being scared to tell anyone:
  1. Acknowledge their courage and validate how overwhelming that feeling can be right away.
  2. Explain practical, accurate facts clearly (e.g., how and when urine pregnancy tests work best, why late periods can have multiple causes, emergency contraception window if relevant).
  3. Reassure them about confidential youth-friendly clinics and anonymous support pathways—they don't have to face it alone.
  4. Never force disclosure to parents or anyone else; respect their autonomy while encouraging safe support.
- Base medical facts strictly on the Verified Medical Knowledge Context provided.`;

  const prompt = `User emotional check-in context: ${userMoodContext || 'Not specified'}

Recent Conversation:
${recentHistory || '(First message)'}

Latest User Message:
"${userMessage}"

Risk & Needs Assessment:
- Emotional state: ${riskAssessment.emotionalState}
- Urgency: ${riskAssessment.urgency}
- Core need: ${riskAssessment.summary}

Safeguarding Directives:
${safeguarding.traumaInformedDirectives.map((d) => `- ${d}`).join('\n')}
${safeguarding.safetyCheckRequired ? `- Gentle safety check to weave in naturally or offer calmly: "${safeguarding.gentleSafetyQuestion}"` : ''}

Verified Medical Knowledge Context (RAG):
${ragContextBlock}

Matched Support & Clinics:
${facilitiesBlock}

Respond as Lumi in JSON format with:
- reply: Lumi's warm, structured, readable message to the adolescent (use simple line breaks for readability, no markdown headers).
- lumiMood: one of "calm", "empathetic", "encouraging", "celebrating"
- suggestedFollowUps: 2 to 3 short, natural follow-up questions the teen might want to tap next (each under 9 words).`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          lumiMood: {
            type: Type.STRING,
            enum: ['calm', 'empathetic', 'encouraging', 'celebrating'],
          },
          suggestedFollowUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['reply', 'lumiMood', 'suggestedFollowUps'],
      },
    },
  });

  const raw = (response.text ?? '{}').trim();
  const parsed = JSON.parse(raw) as {
    reply?: string;
    lumiMood?: LumiMood;
    suggestedFollowUps?: string[];
  };

  if (!parsed.reply) {
    throw new Error('Lumi received an empty response from the model.');
  }

  return {
    reply: parsed.reply,
    lumiMood: parsed.lumiMood || (safeguarding.safetyCheckRequired ? 'empathetic' : 'calm'),
    gentleSafetyCheck: safeguarding.gentleSafetyQuestion,
    suggestedFollowUps:
      Array.isArray(parsed.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0
        ? parsed.suggestedFollowUps.slice(0, 3)
        : [
            'How do pregnancy tests work accurately?',
            'What happens at a youth-friendly clinic?',
            'How can I talk to someone anonymously?',
          ],
    careCards,
    recommendedFacilities: facilities,
    agentTrace: {
      ragChunksUsed: ragChunks.map((c) => ({
        id: c.id,
        title: c.title,
        source: c.source,
      })),
      riskAssessment,
      safeguarding,
      matchedFacilitiesCount: facilities.length,
    },
  };
}
