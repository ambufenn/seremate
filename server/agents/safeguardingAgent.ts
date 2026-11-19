import type { RiskNeedsAssessment, SafeguardingResult } from './types.ts';

export function runSafeguardingAgent(
  userMessage: string,
  assessment: RiskNeedsAssessment
): SafeguardingResult {
  const lower = userMessage.toLowerCase();

  const secrecyOrFearSignals =
    lower.includes('scared') ||
    lower.includes('afraid') ||
    lower.includes('terrified') ||
    lower.includes('tell anyone') ||
    lower.includes('no one knows') ||
    lower.includes('hurt me') ||
    lower.includes('kick me out') ||
    lower.includes('forced') ||
    lower.includes('blackmail') ||
    lower.includes('threaten');

  const safetyCheckRequired =
    assessment.needsSafetyCheck ||
    assessment.urgency === 'immediate_support' ||
    secrecyOrFearSignals;

  let gentleSafetyQuestion: string | null = null;
  if (safetyCheckRequired) {
    gentleSafetyQuestion =
      'Before we go any further, are you in a safe place right now, and do you feel physically safe with the people around you?';
  }

  const traumaInformedDirectives = [
    'Validate feelings first without minimizing or lecturing.',
    'Never judge, shame, blame, or moralize about sexual activity or choices.',
    'Never diagnose pregnancy or medical conditions; explain reliable testing and clinical confirmation.',
    'Empower autonomy: emphasize confidential options and let the teen choose their next step at their own pace.',
  ];

  if (safetyCheckRequired) {
    traumaInformedDirectives.push(
      'Include a gentle, optional safety check and highlight 24/7 anonymous support pathways.'
    );
  }

  return {
    passed: true,
    safetyCheckRequired,
    gentleSafetyQuestion,
    traumaInformedDirectives,
    guardrailNotes: safetyCheckRequired
      ? 'Elevated emotional fear or secrecy detected; trauma-informed safety check and confidential clinic/helpline routing activated.'
      : 'Standard empathetic, non-diagnostic adolescent guidance mode active.',
  };
}
