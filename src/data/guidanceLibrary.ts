import type { GuidanceArticle } from '../types/seremate';

export const BASELINE_GUIDANCE_ARTICLES: GuidanceArticle[] = [
  {
    id: 'guide-puberty-changes',
    title: 'Understanding Puberty on Your Own Timeline',
    category: 'Puberty & Growth',
    summary:
      'Physical, hormonal, and emotional changes begin at different ages for everyone—usually between 8 and 14—and unfold gradually.',
    bodyParagraphs: [
      'Puberty starts when the brain releases gentle hormonal signals that guide body growth, skin changes, body hair, voice shifts, and reproductive maturity.',
      'It is completely normal for friends in the same grade to develop at very different speeds. One side of the chest or body may also grow slightly ahead of the other before balancing out.',
      'Mood swings, new questions about your body, and needing extra sleep are ordinary parts of growth—not signs that something is wrong with you.'
    ],
    whenToSeekHelp:
      'Speak with a pediatrician, school nurse, or youth clinician if you experience severe pain, sudden unexplained swelling, or feel overwhelmed by emotional changes.',
    ageRange: 'Ages 10–19',
    published: true,
    isBaselineFallback: true
  },
  {
    id: 'guide-menstrual-health',
    title: 'Menstrual Cycle Basics & Managing Cramps Safely',
    category: 'Menstrual Health',
    summary:
      'What counts as a normal cycle during adolescence, why flow colors vary, and signs that deserve medical care.',
    bodyParagraphs: [
      'During the first one to two years after your first period, cycle lengths anywhere between 21 and 45 days can still be normal while your body settles into a rhythm.',
      'Period blood can look bright red, pink, or dark brown. Darker brown blood simply means slower flow that took longer to exit and reacted gently with air.',
      'Warmth (a heating pad), gentle stretching, hydration, and rest often ease mild cramping. Tracking your start dates privately can help you spot your body’s personal pattern.'
    ],
    whenToSeekHelp:
      'Consult a nurse or doctor if cramps force you to miss school regularly, cause dizziness or fainting, or if you soak through a pad or tampon every 1–2 hours.',
    ageRange: 'Ages 10–19',
    published: true,
    isBaselineFallback: true
  },
  {
    id: 'guide-pregnancy-awareness',
    title: 'Pregnancy Awareness: Missed Periods & Reliable Testing',
    category: 'Pregnancy Awareness',
    summary:
      'Clear facts on why periods can be late, when urine pregnancy tests give accurate answers, and how to access confidential care.',
    bodyParagraphs: [
      'A missed or late period can feel stressful, but stress, sleep shifts, illness, intense exercise, or normal teen hormone fluctuations can all delay a cycle.',
      'Home urine pregnancy tests measure the hCG hormone. Testing too early can cause a false negative; for ~99% accuracy, test from the first day of a missed period or 21 days after unprotected vaginal sex, using first-morning urine.',
      'If unprotected sex occurred within the past 72 to 120 hours (3–5 days), emergency contraception may reduce pregnancy risk—a pharmacist or youth clinic nurse can explain options privately.'
    ],
    whenToSeekHelp:
      'Reach out to a youth-friendly clinic or qualified clinician for confidential confirmation testing, private options counseling, or immediately if you have sharp one-sided abdominal pain or heavy bleeding.',
    ageRange: 'Ages 13–19',
    published: true,
    isBaselineFallback: true
  },
  {
    id: 'guide-srh-protection',
    title: 'Preventive Sexual & Reproductive Health Basics',
    category: 'Sexual & Reproductive Health',
    summary:
      'Evidence-based overview of contraception, barrier protection, and routine confidential STI testing.',
    bodyParagraphs: [
      'External and internal condoms are the only methods that help protect against both unintended pregnancy and sexually transmitted infections (STIs). Using two condoms at once increases friction and tearing risk—one properly fitted condom is safer.',
      'Hormonal methods (such as pills, patches, implants, or IUDs) help prevent pregnancy effectively when used correctly, though they do not prevent STIs.',
      'Many STIs cause zero visible symptoms early on. Quick, confidential urine or swab tests at a clinic are routine preventive healthcare—nothing to feel ashamed of.'
    ],
    whenToSeekHelp:
      'Visit a clinic if you notice unusual pain, sores, burning during urination, unexpected discharge, or if you want personalized guidance choosing protection.',
    ageRange: 'Ages 13–19',
    published: true,
    isBaselineFallback: true
  },
  {
    id: 'guide-healthy-relationships',
    title: 'Healthy Relationships, Consent & Digital Boundaries',
    category: 'Healthy Relationships & Boundaries',
    summary:
      'Recognizing mutual respect, enthusiastic ongoing consent, and handling online pressure safely.',
    bodyParagraphs: [
      'Consent is a free, enthusiastic, informed, specific, and reversible "yes." Silence, freezing up, or agreeing after repeated guilt trips is never real consent, and anyone can stop at any moment.',
      'Healthy friendships and dating relationships respect your privacy, your time with friends, and your right to say "no" without punishment or sulking.',
      'No one owes anyone private photos online. If someone threatens to share an image (sextortion), stop replying, save screenshots of threats, block them, and contact a trusted adult or cyber-safety advocate—it is never your fault.'
    ],
    whenToSeekHelp:
      'Seek confidential support immediately if someone pressures, isolates, monitors, threatens, or physically hurts you—trained advocates can help you plan safely.',
    ageRange: 'Ages 10–19',
    published: true,
    isBaselineFallback: true
  },
  {
    id: 'guide-when-to-get-help',
    title: 'When & Where to Seek Professional Healthcare',
    category: 'When & Where to Get Help',
    summary:
      'How to prepare for a clinic visit, understand teen privacy rights, and recognize symptoms that need prompt care.',
    bodyParagraphs: [
      'You never need to know medical terms before talking to a nurse or doctor. Writing two short notes on your phone ahead of time makes appointments much easier.',
      'Before sharing sensitive details at a clinic, you can ask: "Can you explain how adolescent confidentiality works here?" Clinicians trained in youth care welcome that question.',
      'Bring a friend or trusted adult if it helps you feel comfortable, or ask for a few private minutes with the clinician.'
    ],
    whenToSeekHelp:
      'Seek urgent medical care right away for severe pelvic or abdominal pain, fever with pelvic pain, dizziness/fainting, heavy bleeding, or after any non-consensual experience.',
    ageRange: 'Ages 10–19',
    published: true,
    isBaselineFallback: true
  }
];
