import type { HealthFacility } from '../agents/types.ts';

export const HEALTH_FACILITIES: HealthFacility[] = [
  {
    id: 'fac-bloom-youth-clinic',
    name: 'Bloom Youth Wellness Center',
    category: 'Youth Clinic',
    services: [
      'Pregnancy Testing',
      'Period & Puberty Care',
      'STI & Contraception',
      'Confidential Counseling'
    ],
    confidentiality: 'Confidential teen appointments; private consultation before any billing',
    cost: 'Free for ages 10–19 (sliding scale / youth grant funded)',
    hours: 'Mon–Sat · 9:00 AM – 6:30 PM',
    locationLabel: 'Downtown Community Plaza · Suite 204',
    contactLabel: 'Call or Text Clinic Desk',
    contactValue: '(555) 234-8810',
    whatToExpect:
      'You check in with your first name only at the youth desk. A nurse meets you privately for 10 minutes first to answer questions—no lectures, and you can bring a friend if you want.',
    youthFriendlyFeatures: [
      'Walk-in afternoons (Tue & Thu)',
      'Private waiting lounge',
      'Multi-language nurse counselors'
    ]
  },
  {
    id: 'fac-harbor-24-7-line',
    name: 'Harbor Teen Support & Crisis Line',
    category: '24/7 Helpline',
    services: [
      '24/7 Helplines',
      'Confidential Counseling',
      'Pregnancy Testing'
    ],
    confidentiality: '100% anonymous · No caller ID logging · Text or voice',
    cost: 'Always free',
    hours: 'Open 24/7 · Every day',
    locationLabel: 'National Anonymous Text & Voice Line',
    contactLabel: 'Text "CARE" or Call',
    contactValue: 'Text CARE to 741-890 · Call 1-800-555-0199',
    whatToExpect:
      'Within 2 minutes, a trained youth counselor replies with calm, non-judgmental support. You can stay completely anonymous and leave the chat whenever you choose.',
    youthFriendlyFeatures: [
      'Silent text-only option for privacy at home',
      'Immediate safety planning if you feel pressured or unsafe',
      'Warm referrals to local clinics'
    ]
  },
  {
    id: 'fac-maple-school-health',
    name: 'Maple Grove Adolescent Health Hub',
    category: 'Community Health',
    services: [
      'Pregnancy Testing',
      'Period & Puberty Care',
      'STI & Contraception'
    ],
    confidentiality: 'Protected youth medical privacy · Separate teen entrance',
    cost: 'Free with youth pass or $0–$15 sliding scale',
    hours: 'Mon–Fri · 8:30 AM – 5:00 PM',
    locationLabel: '142 Maple Ave · Ground Floor East Wing',
    contactLabel: 'Book Quietly by Phone',
    contactValue: '(555) 391-4420',
    whatToExpect:
      'Offers same-day urine pregnancy tests with results in 5 minutes, period care kits, and gentle doctors who explain every step before doing anything.',
    youthFriendlyFeatures: [
      'Same-day walk-in pregnancy & STI testing',
      'Free menstrual supplies & comfort kits',
      'Youth-trained female & non-binary clinicians'
    ]
  },
  {
    id: 'fac-safespace-counseling',
    name: 'SafeSpace Youth & Relationship Advocacy',
    category: 'Counseling & Support',
    services: [
      'Confidential Counseling',
      '24/7 Helplines'
    ],
    confidentiality: 'Trauma-informed confidential advocacy & digital safety help',
    cost: 'Free for all adolescents & young adults',
    hours: 'Mon–Fri 9 AM – 8 PM · 24/7 urgent chat',
    locationLabel: '48 Oakridge St · Wellness Commons',
    contactLabel: 'Confidential Advocacy Line',
    contactValue: '(555) 774-2090',
    whatToExpect:
      'Specializes in helping teens who feel scared, pressured in a relationship, or worried about digital privacy/online threats. You set the pace of every conversation.',
    youthFriendlyFeatures: [
      'Relationship safety & boundary coaching',
      'Digital image takedown & cyber-harassment help',
      'Supportive peer & counselor sessions'
    ]
  },
  {
    id: 'fac-riverside-repro-care',
    name: 'Riverside Family & Teen Health Clinic',
    category: 'Youth Clinic',
    services: [
      'Pregnancy Testing',
      'STI & Contraception',
      'Period & Puberty Care',
      'Confidential Counseling'
    ],
    confidentiality: 'Adolescent confidentiality policy explained upfront',
    cost: 'Free preventive teen visits · Emergency contraception available',
    hours: 'Tue–Sun · 10:00 AM – 6:00 PM',
    locationLabel: '810 Riverside Blvd · Transit Stop B',
    contactLabel: 'Clinic Care Line',
    contactValue: '(555) 602-1185',
    whatToExpect:
      'Weekend hours make it easier to visit without missing school. Clinicians discuss options counseling, emergency contraception, and menstrual health calmly.',
    youthFriendlyFeatures: [
      'Weekend availability',
      'Near public bus & rail station',
      'Zero-judgment options counseling'
    ]
  }
];
