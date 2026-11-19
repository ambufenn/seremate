import type { MythStatement } from '../types/reproguard';

export const MYTH_STATEMENTS: MythStatement[] = [
  {
    id: 'myth-1',
    category: 'Pregnancy',
    statement: 'You cannot get pregnant the very first time you have unprotected sex.',
    isFact: false,
    explanation:
      'Pregnancy can happen any time sperm enters the vagina without effective contraception—including the very first time.',
    source: 'WHO Adolescent Reproductive Health'
  },
  {
    id: 'myth-2',
    category: 'Pregnancy',
    statement: 'A home urine pregnancy test is most accurate starting from the first day of a missed period (or 21 days after unprotected sex).',
    isFact: true,
    explanation:
      'Testing too early can miss rising hCG hormone levels. Waiting until a missed period or 21 days later makes results ~99% accurate.',
    source: 'NHS & WHO Clinical Testing Guidance'
  },
  {
    id: 'myth-3',
    category: 'Periods',
    statement: 'Period blood that looks dark brown at the start or end of a period is normal.',
    isFact: true,
    explanation:
      'Brown blood simply means slower flow that has taken longer to leave the uterus and reacted gently with air. It is completely normal.',
    source: 'AAP Menstrual Health Guide'
  },
  {
    id: 'myth-4',
    category: 'Periods',
    statement: 'You should avoid showering or washing your hair while on your period.',
    isFact: false,
    explanation:
      'Warm showers are completely safe during your period and can actually help relax crampy muscles.',
    source: 'UNFPA Menstrual Hygiene Facts'
  },
  {
    id: 'myth-5',
    category: 'Consent',
    statement: 'If someone freezes up and says nothing, that still counts as consent as long as they didn’t say "no".',
    isFact: false,
    explanation:
      'Silence or freezing is NOT consent. Consent requires a free, clear, enthusiastic, and ongoing "yes."',
    source: 'UNESCO Sexuality Education Guidance'
  },
  {
    id: 'myth-6',
    category: 'Consent',
    statement: 'Anyone has the right to change their mind and stop at any point—even if they are dating or agreed earlier.',
    isFact: true,
    explanation:
      'Consent is always reversible. Respecting a pause or stop immediately is part of every healthy relationship.',
    source: 'UNESCO Consent Framework'
  },
  {
    id: 'myth-7',
    category: 'Body & Puberty',
    statement: 'Starting puberty earlier or later than most friends in your grade means your body is unhealthy.',
    isFact: false,
    explanation:
      'Normal puberty starts anywhere between ages 8 and 14+ and unfolds at a unique pace for every individual.',
    source: 'WHO Adolescent Development'
  },
  {
    id: 'myth-8',
    category: 'Pregnancy',
    statement: 'Jumping up and down or washing right after sex prevents pregnancy.',
    isFact: false,
    explanation:
      'Gravity and washing cannot stop sperm or prevent pregnancy. Only approved contraception or emergency contraception within its time window works.',
    source: 'CDC & WHO Contraception Facts'
  },
  {
    id: 'myth-9',
    category: 'Body & Puberty',
    statement: 'Many sexually transmitted infections (STIs) cause zero noticeable symptoms at first, which is why routine testing helps.',
    isFact: true,
    explanation:
      'Feeling totally fine does not always mean an STI isn’t present. Simple, confidential urine or swab tests at a youth clinic check quickly.',
    source: 'CDC Youth Preventive Care'
  },
  {
    id: 'myth-10',
    category: 'Periods',
    statement: 'Severe menstrual cramps that regularly force you to miss school are something you should ask a nurse or doctor about.',
    isFact: true,
    explanation:
      'While mild cramps are common, pain that disrupts daily life deserves supportive evaluation and real relief options.',
    source: 'AAP Adolescent Care'
  },
  {
    id: 'myth-11',
    category: 'Pregnancy',
    statement: 'Using two condoms at once gives double the protection.',
    isFact: false,
    explanation:
      'Wearing two condoms creates friction between them, making tearing or slipping MORE likely. One properly fitted condom is far safer.',
    source: 'WHO Barrier Protection Guide'
  },
  {
    id: 'myth-12',
    category: 'Consent',
    statement: 'Pressuring someone for private photos by saying "everyone does it" is a form of digital boundary coercion.',
    isFact: true,
    explanation:
      'Healthy trust never requires sharing private images. You always own your digital privacy.',
    source: 'UNICEF Adolescent Digital Safety'
  }
];
