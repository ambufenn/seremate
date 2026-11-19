import type { KnowledgeChunk } from '../agents/types.ts';

export const KNOWLEDGE_BASE: KnowledgeChunk[] = [
  {
    id: 'rag-pregnancy-testing',
    topic: 'Pregnancy Awareness',
    title: 'How & When Pregnancy Tests Give Reliable Answers',
    source: 'WHO Adolescent Sexual & Reproductive Health Guidance',
    summary:
      'Urine pregnancy tests detect hCG hormone. Taking a test too early can give a false negative; testing from the first day of a missed period (or 14–21 days after unprotected sex) gives the most accurate result.',
    facts: [
      'Home urine pregnancy tests are around 99% accurate when taken from the first day of a missed period.',
      'If cycles are irregular or you are unsure when a period is due, waiting 21 days after the encounter gives a reliable result.',
      'First-morning urine has the highest concentration of hCG, making early results clearer.',
      'Youth-friendly clinics and community health centers can provide free or low-cost confidential pregnancy tests and private counseling on all next steps.'
    ],
    keywords: [
      'pregnant',
      'pregnancy',
      'test',
      'late period',
      'missed period',
      'scared',
      'tell anyone',
      'unprotected',
      'hcg',
      'false negative'
    ]
  },
  {
    id: 'rag-pregnancy-options-support',
    topic: 'Pregnancy Awareness',
    title: 'Confidential Support & Next Steps During a Pregnancy Scare',
    source: 'UNFPA Youth-Friendly Services Framework',
    summary:
      'Feeling scared to tell family or friends is very common. Adolescents have the right to confidential medical information, accurate testing, and non-judgmental counseling with a qualified clinician.',
    facts: [
      'A missed or late period can happen for many reasons besides pregnancy, including stress, sleep shifts, illness, or natural cycle variation during teen years.',
      'Qualified youth clinics and school/community nurses can speak privately with you and explain confidentiality rules in your area before you share personal details.',
      'If unprotected sex happened within the last 72 to 120 hours (3–5 days), emergency contraception may still reduce pregnancy risk—a pharmacist or clinic nurse can guide you.',
      'You never have to navigate big health decisions completely alone; confidential hotlines let you ask questions anonymously first.'
    ],
    keywords: [
      'pregnant',
      'scared',
      'tell anyone',
      'parents',
      'confidential',
      'alone',
      'emergency contraception',
      'plan b',
      'clinic',
      'worried'
    ]
  },
  {
    id: 'rag-consent-boundaries',
    topic: 'Consent & Healthy Relationships',
    title: 'Understanding Clear, Ongoing Consent & Safety',
    source: 'UNESCO International Technical Guidance on Sexuality Education',
    summary:
      'Consent is a free, enthusiastic, specific, and reversible "yes" given without pressure, guilt, fear, or intoxication. Nobody owes anyone physical intimacy or private images.',
    facts: [
      'Silence, freezing up, or saying "maybe" is not consent.',
      'You can change your mind at any point—even if you said yes earlier or are in a relationship.',
      'Healthy partners respect "no" immediately without sulking, threatening, or making you feel guilty.',
      'If someone pressures you, isolates you from friends, or makes you feel unsafe, that is not your fault—trusted adults and confidential helplines can help you stay safe.'
    ],
    keywords: [
      'consent',
      'pressure',
      'forced',
      'boyfriend',
      'girlfriend',
      'partner',
      'relationship',
      'boundaries',
      'unsafe',
      'no'
    ]
  },
  {
    id: 'rag-period-health',
    topic: 'Period Health',
    title: 'Menstrual Cycle Basics & When to Check With a Nurse',
    source: 'AAP Adolescent Menstrual Health Guidelines',
    summary:
      'During the first few years after periods start, cycle lengths between 21 and 45 days can still be normal as hormones settle.',
    facts: [
      'Period blood can look bright red, dark brown, or pink—all can be normal across a cycle.',
      'Mild cramping is common and often eased with warmth, hydration, and rest, but pain that stops you from going to school or daily activities deserves medical care.',
      'Soaking through a pad or tampon every 1–2 hours for several hours is a reason to speak with a healthcare provider.'
    ],
    keywords: [
      'period',
      'menstruation',
      'cramps',
      'bleeding',
      'irregular',
      'cycle',
      'tampon',
      'pad',
      'spotting'
    ]
  },
  {
    id: 'rag-puberty-development',
    topic: 'Puberty',
    title: 'Every Body Grows on Its Own Timeline',
    source: 'WHO Adolescent Development Brief',
    summary:
      'Puberty usually begins between ages 8 and 14, and physical and emotional changes happen gradually at different speeds for everyone.',
    facts: [
      'Growth spurts, voice changes, acne, body hair, breast soreness, and mood shifts are driven by normal hormonal signals.',
      'Comparing timelines with friends can feel stressful, but wide variation in timing is completely healthy.',
      'If you have questions about body changes or discomfort, a pediatric or youth clinic nurse can check everything calmly.'
    ],
    keywords: [
      'puberty',
      'growing',
      'body',
      'normal',
      'acne',
      'voice',
      'breasts',
      'hormones',
      'teen'
    ]
  },
  {
    id: 'rag-digital-safety',
    topic: 'Digital Safety',
    title: 'Protecting Privacy & Responding to Online Pressure',
    source: 'UNICEF Digital Safety for Adolescents',
    summary:
      'Private photos or messages should never be coerced or shared without permission. If someone threatens to share images, help is available without blame.',
    facts: [
      'Asking for private photos repeatedly after you said no is digital pressure, not love.',
      'If someone threatens to leak a photo (sextortion), stop replying, screenshot the threats as evidence, block the account, and reach out to a trusted adult or cyber-safety helpline immediately.',
      'Never pay money or send more images—support organizations can help remove non-consensual teen images from platforms.'
    ],
    keywords: [
      'photo',
      'nude',
      'picture',
      'online',
      'text',
      'sextortion',
      'blackmail',
      'social media',
      'privacy',
      'dm'
    ]
  },
  {
    id: 'rag-sti-contraception',
    topic: 'Contraception & STI Care',
    title: 'Protection, STI Testing & Preventive Care',
    source: 'CDC & WHO Youth Preventive Care Guidelines',
    summary:
      'Barrier methods like condoms reduce both pregnancy risk and sexually transmitted infections (STIs). Many STIs have zero symptoms, so routine confidential testing is simple healthcare.',
    facts: [
      'External and internal condoms are the only methods that protect against both unintended pregnancy and STIs.',
      'Many STIs cause no visible symptoms at first—quick urine or swab tests at a youth clinic give peace of mind.',
      'Hormonal methods (pills, patches, implants, IUDs) prevent pregnancy effectively when used properly, and a clinician can explain which option fits your health.'
    ],
    keywords: [
      'condom',
      'sti',
      'std',
      'infection',
      'birth control',
      'contraception',
      'pill',
      'protection',
      'discharge',
      'itching'
    ]
  }
];
