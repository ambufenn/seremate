export type SereMateTab =
  | 'dashboard'
  | 'companion'
  | 'guidance'
  | 'community'
  | 'pregnancy'
  | 'assessment'
  | 'support'
  | 'history'
  | 'profile'
  | 'admin';

export type CommunityTopic =
  | 'Encouragement'
  | 'Period Health'
  | 'Pregnancy Worry'
  | 'Boundaries & Consent'
  | 'Wellness Habits';

export interface CommunityPostDoc {
  id: string;
  authorUid: string;
  authorAlias: string;
  topic: CommunityTopic;
  message: string;
  hugsCount: number;
  approved: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  isBaseline?: boolean;
}

export interface CommunityActivityItem {
  id: string;
  title: string;
  category: string;
  scheduleLabel: string;
  description: string;
  hostLabel: string;
  participantsCount: number;
  promptForSere: string;
}

export type AgeBracket = '10-12' | '13-15' | '16-17' | '18-19' | 'guardian_educator';

export type SafetyLevel = 'routine' | 'elevated' | 'urgent';

export type GuidanceCategory =
  | 'Puberty & Growth'
  | 'Menstrual Health'
  | 'Pregnancy Awareness'
  | 'Sexual & Reproductive Health'
  | 'Healthy Relationships & Boundaries'
  | 'When & Where to Get Help';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  ageBracket: AgeBracket;
  role: 'user' | 'admin';
  privacyOptOutTraining: boolean;
  acceptedPrivacyPolicy: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ConversationThread {
  id: string;
  userId: string;
  title: string;
  lastMessagePreview: string;
  safetyFlagged: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ChatMessageDoc {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  safetyLevel: SafetyLevel;
  createdAt?: unknown;
}

export interface AssessmentResultDoc {
  id: string;
  userId: string;
  primaryCategory: string;
  supportLevel: 'informational' | 'guided_support' | 'priority_care';
  summaryNote: string;
  recommendedTopics: string[];
  createdAt?: unknown;
}

export interface GuidanceArticle {
  id: string;
  title: string;
  category: GuidanceCategory;
  summary: string;
  bodyParagraphs: string[];
  whenToSeekHelp: string;
  ageRange: string;
  published: boolean;
  isBaselineFallback?: boolean;
}

export interface HealthcareResource {
  id: string;
  name: string;
  category: 'Youth Clinic' | '24/7 Helpline' | 'Community Health' | 'Counseling & Advocacy';
  services: string[];
  description: string;
  locationLabel: string;
  hours: string;
  costInfo: string;
  contactValue: string;
  verificationNote: string;
  active: boolean;
  isBaselineFallback?: boolean;
}

export interface SafetyReportDoc {
  id: string;
  reporterUid: string;
  category: 'safety_concern' | 'misinformation' | 'outdated_resource' | 'platform_feedback';
  relatedTopic: string;
  description: string;
  status: 'open' | 'reviewing' | 'resolved';
  adminNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UsageEventDoc {
  id: string;
  eventType: 'chat_turn' | 'assessment_completed' | 'guidance_viewed' | 'support_viewed';
  topicCategory: string;
  safetyTriggered: boolean;
  createdAt?: unknown;
}
