import { ThinkingLevel, Type } from '@google/genai';
import { getGeminiClient } from './geminiClient.ts';
import type { ChatTurn, RiskNeedsAssessment, UrgencyLevel } from './types.ts';

export async function runRiskAndNeedsAgent(
  userMessage: string,
  history: ChatTurn[]
): Promise<RiskNeedsAssessment> {
  const ai = getGeminiClient();

  const recentContext = history
    .slice(-6)
    .map((turn) => `${turn.role === 'user' ? 'Teen' : 'Lumi'}: ${turn.text}`)
    .join('\n');

  const prompt = `Analyze the adolescent user's latest message in the context of reproductive health support.
Recent conversation:
${recentContext || '(New conversation)'}

Latest message from user:
"${userMessage}"

Assess:
1. detectedTopics (e.g., "Pregnancy Awareness", "Confidential Care", "Period Health", "Consent", "Digital Safety", "Puberty", "STI & Contraception")
2. emotionalState (e.g., "worried and scared", "curious", "calm", "overwhelmed")
3. urgency ("routine", "elevated", or "immediate_support")
4. needsPregnancyTestingInfo (boolean)
5. needsConfidentialClinic (boolean)
6. needsSafetyCheck (boolean - true if user expresses fear, secrecy/being scared to tell anyone, feeling unsafe, coercion, abuse, or crisis)
7. needsCrisisHelpline (boolean - true if user expresses distress, fear of harm, coercion, or urgent emotional support needs)
8. summary (1 concise sentence summarizing what the user needs most right now)`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          emotionalState: { type: Type.STRING },
          urgency: {
            type: Type.STRING,
            enum: ['routine', 'elevated', 'immediate_support'],
          },
          needsPregnancyTestingInfo: { type: Type.BOOLEAN },
          needsConfidentialClinic: { type: Type.BOOLEAN },
          needsSafetyCheck: { type: Type.BOOLEAN },
          needsCrisisHelpline: { type: Type.BOOLEAN },
          summary: { type: Type.STRING },
        },
        required: [
          'detectedTopics',
          'emotionalState',
          'urgency',
          'needsPregnancyTestingInfo',
          'needsConfidentialClinic',
          'needsSafetyCheck',
          'needsCrisisHelpline',
          'summary',
        ],
      },
    },
  });

  const raw = (response.text ?? '{}').trim();
  const parsed = JSON.parse(raw) as Partial<RiskNeedsAssessment>;

  const urgency: UrgencyLevel =
    parsed.urgency === 'immediate_support' || parsed.urgency === 'elevated'
      ? parsed.urgency
      : 'routine';

  return {
    detectedTopics: Array.isArray(parsed.detectedTopics) && parsed.detectedTopics.length > 0
      ? parsed.detectedTopics
      : ['General Health'],
    emotionalState: parsed.emotionalState || 'curious',
    urgency,
    needsPregnancyTestingInfo: Boolean(parsed.needsPregnancyTestingInfo),
    needsConfidentialClinic: Boolean(parsed.needsConfidentialClinic),
    needsSafetyCheck: Boolean(parsed.needsSafetyCheck),
    needsCrisisHelpline: Boolean(parsed.needsCrisisHelpline),
    summary: parsed.summary || 'Provide clear, empathetic, non-judgmental reproductive health guidance.',
  };
}
