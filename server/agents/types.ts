export type LumiMood = 'calm' | 'empathetic' | 'encouraging' | 'thinking' | 'celebrating';

export type UrgencyLevel = 'routine' | 'elevated' | 'immediate_support';

export interface ChatTurn {
  role: 'user' | 'lumi';
  text: string;
}

export interface KnowledgeChunk {
  id: string;
  topic: string;
  title: string;
  source: string;
  summary: string;
  facts: string[];
  keywords: string[];
}

export interface HealthFacility {
  id: string;
  name: string;
  category: 'Youth Clinic' | '24/7 Helpline' | 'Community Health' | 'Counseling & Support';
  services: string[];
  confidentiality: string;
  cost: string;
  hours: string;
  locationLabel: string;
  contactLabel: string;
  contactValue: string;
  whatToExpect: string;
  youthFriendlyFeatures: string[];
}

export interface RiskNeedsAssessment {
  detectedTopics: string[];
  emotionalState: string;
  urgency: UrgencyLevel;
  needsPregnancyTestingInfo: boolean;
  needsConfidentialClinic: boolean;
  needsSafetyCheck: boolean;
  needsCrisisHelpline: boolean;
  summary: string;
}

export interface SafeguardingResult {
  passed: boolean;
  safetyCheckRequired: boolean;
  gentleSafetyQuestion: string | null;
  traumaInformedDirectives: string[];
  guardrailNotes: string;
}

export interface CareActionCard {
  id: string;
  title: string;
  description: string;
  actionType: 'navigator' | 'quest' | 'helpline' | 'scenario';
  targetId?: string;
  ctaLabel: string;
}

export interface AgentTrace {
  ragChunksUsed: Array<{ id: string; title: string; source: string }>;
  riskAssessment: RiskNeedsAssessment;
  safeguarding: SafeguardingResult;
  matchedFacilitiesCount: number;
}

export interface LumiResponsePayload {
  reply: string;
  lumiMood: LumiMood;
  gentleSafetyCheck: string | null;
  suggestedFollowUps: string[];
  careCards: CareActionCard[];
  recommendedFacilities: HealthFacility[];
  agentTrace: AgentTrace;
}
