import type { CommunityActivityItem, CommunityPostDoc } from '../types/seremate';

export const PEER_ALIASES = [
  'Sunny Sprout',
  'Lavender Cloud',
  'Mint Blossom',
  'Gentle Star',
  'Peach Breeze',
  'Kind Meadow',
];

export const COMMUNITY_ACTIVITIES: CommunityActivityItem[] = [
  {
    id: 'act-period-circle',
    title: 'Period Positivity & Myth-Busting Circle',
    category: 'Peer Workshop',
    scheduleLabel: 'Self-paced · 10 min',
    description:
      'Break everyday taboos around menstruation, learn what cycle variations are normal, and share supportive tips with peers.',
    hostLabel: 'Youth Health Peer Educators',
    participantsCount: 48,
    promptForSere:
      'Can you share 3 common period myths and facts from the Period Positivity Circle?',
  },
  {
    id: 'act-boundaries-club',
    title: 'Digital Safety & Healthy Boundaries Hangout',
    category: 'Peer Activity',
    scheduleLabel: 'Interactive · 15 min',
    description:
      'Practice saying no without guilt, spotting online pressure early, and supporting friends who feel pressured in relationships.',
    hostLabel: 'Safe Youth Circle',
    participantsCount: 62,
    promptForSere:
      'How can I practice setting healthy boundaries with a partner or friend?',
  },
  {
    id: 'act-pregnancy-calm',
    title: 'Calm Steps for Late Period & Pregnancy Worries',
    category: 'Supportive Learning',
    scheduleLabel: 'Guided · 8 min',
    description:
      'Learn accurate testing timing, clinic confidentiality basics, and calm breathing steps when anxiety feels overwhelming.',
    hostLabel: 'Community Nurse Guide',
    participantsCount: 39,
    promptForSere:
      'What are calm, accurate first steps if someone is worried about a late period?',
  },
  {
    id: 'act-wellness-challenge',
    title: '7-Day Keep Healthy & Self-Kindness Challenge',
    category: 'Community Challenge',
    scheduleLabel: 'Daily Habit · 5 min/day',
    description:
      'Build gentle everyday habits—hydration, iron-rich snacks, restful sleep, and kind self-talk—alongside peers aged 10–19.',
    hostLabel: 'Sere Wellness Club',
    participantsCount: 74,
    promptForSere:
      'Help me plan a gentle 7-day keep-healthy and hydration routine for a teenager.',
  },
];

export const BASELINE_COMMUNITY_POSTS: CommunityPostDoc[] = [
  {
    id: 'seed-post-1',
    authorUid: 'community-seed',
    authorAlias: 'Lavender Cloud',
    topic: 'Encouragement',
    message:
      'Reminder to anyone panicking tonight: asking questions about your body is brave, not shameful. Take a deep breath and go one step at a time.',
    hugsCount: 19,
    approved: true,
    isBaseline: true,
  },
  {
    id: 'seed-post-2',
    authorUid: 'community-seed',
    authorAlias: 'Sunny Sprout',
    topic: 'Period Health',
    message:
      'Tracking my sleep and hydration actually helped me understand why my cycle shifted during exam week. Heating pads + ginger tea really help my cramps!',
    hugsCount: 14,
    approved: true,
    isBaseline: true,
  },
  {
    id: 'seed-post-3',
    authorUid: 'community-seed',
    authorAlias: 'Mint Blossom',
    topic: 'Pregnancy Worry',
    message:
      'When I thought I might be pregnant, reading when a test is actually accurate stopped me from spiraling. Talking to a friendly clinic nurse made everything feel manageable.',
    hugsCount: 23,
    approved: true,
    isBaseline: true,
  },
  {
    id: 'seed-post-4',
    authorUid: 'community-seed',
    authorAlias: 'Gentle Star',
    topic: 'Boundaries & Consent',
    message:
      'If someone gets angry when you say no or asks for private photos to "prove" you care, that is pressure—not love. Protect your peace.',
    hugsCount: 31,
    approved: true,
    isBaseline: true,
  },
];

export const WEEKLY_POLL_OPTIONS = [
  { id: 'poll-cycle', label: 'Understanding irregular periods & cramps', baseVotes: 34 },
  { id: 'poll-pregnancy', label: 'What to do right away if worried about pregnancy', baseVotes: 29 },
  { id: 'poll-boundaries', label: 'Saying no & handling peer/online pressure', baseVotes: 25 },
  { id: 'poll-clinic', label: 'What actually happens at a youth health clinic', baseVotes: 18 },
];
