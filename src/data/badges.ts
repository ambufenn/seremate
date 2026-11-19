import type { KnowledgeBadge } from '../types/reproguard';

export const KNOWLEDGE_BADGES: KnowledgeBadge[] = [
  {
    id: 'badge-curiosity-spark',
    title: 'Curiosity Spark',
    description: 'Completed your first Health Quest at your own pace.',
    criteriaLabel: 'Complete 1 Health Quest',
    tone: 'tangerine',
    iconType: 'spark'
  },
  {
    id: 'badge-pathfinder',
    title: 'Calm Pathfinder',
    description: 'Explored Pregnancy Awareness and accurate testing timelines.',
    criteriaLabel: 'Complete Pregnancy Awareness',
    tone: 'tangerine',
    iconType: 'compass'
  },
  {
    id: 'badge-consent-champion',
    title: 'Consent Champion',
    description: 'Mastered clear, ongoing, and reversible consent boundaries.',
    criteriaLabel: 'Complete Consent Quest',
    tone: 'lavender',
    iconType: 'shield'
  },
  {
    id: 'badge-heart-ally',
    title: 'Respect Ally',
    description: 'Learned how to spot healthy green flags and support friends.',
    criteriaLabel: 'Complete Healthy Relationships',
    tone: 'lavender',
    iconType: 'heart'
  },
  {
    id: 'badge-cycle-scholar',
    title: 'Cycle Scholar',
    description: 'Learned menstrual cycle basics and when to seek comfort care.',
    criteriaLabel: 'Complete Period Health',
    tone: 'sage',
    iconType: 'book'
  },
  {
    id: 'badge-digital-guardian',
    title: 'Digital Guardian',
    description: 'Learned how to protect online privacy and block digital pressure.',
    criteriaLabel: 'Complete Digital Safety',
    tone: 'lavender',
    iconType: 'lock'
  },
  {
    id: 'badge-myth-hunter',
    title: 'Fact Finder',
    description: 'Verified 5 or more reproductive health statements in Myth Hunter.',
    criteriaLabel: 'Answer 5 Myth Hunter cards',
    tone: 'sage',
    iconType: 'star'
  },
  {
    id: 'badge-care-navigator',
    title: 'Care Explorer',
    description: 'Checked verified youth-friendly clinics and support pathways.',
    criteriaLabel: 'Explore Healthcare Navigator',
    tone: 'sage',
    iconType: 'clinic'
  }
];
