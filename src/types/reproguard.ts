export type AppTab = 'home' | 'quests' | 'scenarios' | 'lumi' | 'myths' | 'navigator';

export type LumiMood = 'calm' | 'empathetic' | 'encouraging' | 'thinking' | 'celebrating';

export type CheckInMood = 'calm' | 'curious' | 'worried' | 'overwhelmed' | 'hopeful';

export type AccentTone = 'tangerine' | 'lavender' | 'sage';

export interface QuestCardStep {
  title: string;
  body: string;
  keyTakeaway: string;
}

export interface QuestCheckQuestion {
  question: string;
  options: Array<{
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }>;
}

export interface HealthQuest {
  id: string;
  stageNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  durationLabel: string;
  xpReward: number;
  tone: AccentTone;
  badgeId: string;
  linkedScenarioId?: string;
  steps: QuestCardStep[];
  checkQuestion: QuestCheckQuestion;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  supportiveResponse: string;
  lumiNote: string;
  nextNodeId: string | null; // null means story completes
  xpBonus: number;
}

export interface ScenarioNode {
  id: string;
  sceneTitle: string;
  settingDescription: string;
  dialogueSpeaker: string;
  dialogueText: string;
  lumiWhisper: string;
  choices: ScenarioChoice[];
}

export interface InteractiveScenario {
  id: string;
  title: string;
  subtitle: string;
  durationLabel: string;
  tone: AccentTone;
  xpReward: number;
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
}

export interface MythStatement {
  id: string;
  category: 'Pregnancy' | 'Periods' | 'Consent' | 'Body & Puberty';
  statement: string;
  isFact: boolean;
  explanation: string;
  source: string;
}

export interface KnowledgeBadge {
  id: string;
  title: string;
  description: string;
  criteriaLabel: string;
  tone: AccentTone;
  iconType: 'compass' | 'shield' | 'heart' | 'spark' | 'book' | 'lock' | 'clinic' | 'star';
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
  riskAssessment: {
    detectedTopics: string[];
    emotionalState: string;
    urgency: 'routine' | 'elevated' | 'immediate_support';
    summary: string;
  };
  safeguarding: {
    passed: boolean;
    safetyCheckRequired: boolean;
    gentleSafetyQuestion: string | null;
    guardrailNotes: string;
  };
  matchedFacilitiesCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'lumi';
  text: string;
  timestamp: string;
  lumiMood?: LumiMood;
  gentleSafetyCheck?: string | null;
  suggestedFollowUps?: string[];
  careCards?: CareActionCard[];
  recommendedFacilities?: HealthFacility[];
  agentTrace?: AgentTrace;
}

export interface UserProgress {
  xp: number;
  checkInMood: CheckInMood | null;
  completedQuestIds: string[];
  completedScenarioIds: string[];
  answeredMythIds: string[];
  correctMythIds: string[];
  exploredNavigator: boolean;
  talkedToLumi: boolean;
  unlockedBadgeIds: string[];
}
