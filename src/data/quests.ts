import type { HealthQuest } from '../types/reproguard';

export const HEALTH_QUESTS: HealthQuest[] = [
  {
    id: 'pregnancy-awareness',
    stageNumber: 1,
    title: 'Pregnancy Awareness',
    shortTitle: 'Pregnancy',
    subtitle: 'Understand your body, testing timing, and confidential options.',
    durationLabel: '4 min',
    xpReward: 120,
    tone: 'tangerine',
    badgeId: 'badge-pathfinder',
    linkedScenarioId: 'scenario-late-period',
    steps: [
      {
        title: 'Why a late period happens',
        body: 'A missed or late period can feel scary, especially when you are not expecting it. Stress, sleep changes, illness, athletic training, or normal teen hormone fluctuations can all delay a period—so a late period alone never confirms pregnancy.',
        keyTakeaway: 'A late period is a signal to check calmly, not an automatic answer.'
      },
      {
        title: 'When a pregnancy test is actually accurate',
        body: 'Home urine tests detect a hormone called hCG. Testing too early can show a false negative. For the clearest answer, test from the first day of a missed period—or 21 days after unprotected sex if your cycle is irregular. Morning urine gives the strongest reading.',
        keyTakeaway: 'Timing matters: day of missed period or 21 days later gives ~99% accuracy.'
      },
      {
        title: 'Confidential support exists',
        body: 'If you are scared to tell family or friends, you still deserve accurate medical information. Youth-friendly clinics offer private, free or low-cost tests and calm conversations about every option without judgment.',
        keyTakeaway: 'You do not have to figure out big health questions by yourself.'
      }
    ],
    checkQuestion: {
      question: 'When does a urine pregnancy test give the most reliable result?',
      options: [
        {
          id: 'a',
          label: 'The morning right after unprotected sex',
          isCorrect: false,
          feedback: 'Not quite yet—hCG hormone takes about 2–3 weeks to build up enough for a urine test to detect.'
        },
        {
          id: 'b',
          label: 'From the first day of a missed period (or 21 days later)',
          isCorrect: true,
          feedback: 'Spot on! Waiting until a missed period or 21 days after gives the test enough hormone to be ~99% accurate.'
        },
        {
          id: 'c',
          label: 'Only if you feel morning nausea',
          isCorrect: false,
          feedback: 'Many people have zero early symptoms, and nausea can come from stress or stomach bugs. Only a test can confirm.'
        }
      ]
    }
  },
  {
    id: 'healthy-relationships',
    stageNumber: 2,
    title: 'Healthy Relationships',
    shortTitle: 'Relationships',
    subtitle: 'Spot green flags, mutual respect, and emotional safety.',
    durationLabel: '4 min',
    xpReward: 110,
    tone: 'lavender',
    badgeId: 'badge-heart-ally',
    steps: [
      {
        title: 'What respect feels like',
        body: 'In a healthy friendship or dating relationship, both people can express feelings, spend time with other friends, and disagree without fear of punishment, insults, or the silent treatment.',
        keyTakeaway: 'Healthy relationships make your world feel safer, not smaller.'
      },
      {
        title: 'Spotting subtle pressure',
        body: 'Unhealthy dynamics often start small: checking your phone without permission, guilt-tripping you for saying no, or saying "if you loved me, you would." Love never asks you to ignore your own comfort.',
        keyTakeaway: 'Guilt trips and jealousy are warning signs, not proof of caring.'
      },
      {
        title: 'Supporting a friend',
        body: 'If a friend seems pulled away from everyone or anxious about a partner’s reaction, listen without judging. Letting them know you care and sharing confidential support numbers keeps doors open.',
        keyTakeaway: 'Calm, non-judgmental listening helps friends stay connected and safe.'
      }
    ],
    checkQuestion: {
      question: 'Which sign points to a healthy relationship?',
      options: [
        {
          id: 'a',
          label: 'They expect your social media passwords to prove trust',
          isCorrect: false,
          feedback: 'Privacy is healthy in every relationship. Demanding passwords is a boundary violation, not trust.'
        },
        {
          id: 'b',
          label: 'They respect your "no" without sulking or pressuring you',
          isCorrect: true,
          feedback: 'Exactly right. Respecting boundaries calmly—even when disappointed—is a core green flag.'
        },
        {
          id: 'c',
          label: 'They get angry when you hang out with close friends',
          isCorrect: false,
          feedback: 'Isolating someone from friends is an unhealthy control signal.'
        }
      ]
    }
  },
  {
    id: 'consent',
    stageNumber: 3,
    title: 'Consent & Boundaries',
    shortTitle: 'Consent',
    subtitle: 'Clear, enthusiastic, ongoing "yes" in every situation.',
    durationLabel: '3 min',
    xpReward: 120,
    tone: 'lavender',
    badgeId: 'badge-consent-champion',
    linkedScenarioId: 'scenario-late-night-text',
    steps: [
      {
        title: 'Consent is FRIES',
        body: 'Freely given (no pressure or guilt), Reversible (you can stop anytime), Informed (everyone knows what is happening), Enthusiastic (a real yes, not "fine, whatever"), and Specific (yes to holding hands is not yes to everything else).',
        keyTakeaway: 'Only an unpressured, clear "yes" means yes.'
      },
      {
        title: 'Silence is not consent',
        body: 'When people feel nervous or surprised, it is very common to freeze or stay quiet. Freezing, saying "maybe," or being asleep or intoxicated never counts as consent.',
        keyTakeaway: 'If someone seems unsure or quiet, pause and check in gently.'
      },
      {
        title: 'Changing your mind is always allowed',
        body: 'Even if you agreed earlier, even if you are dating, and even if you already started—you always have the right to say "wait, I want to stop."',
        keyTakeaway: 'Consent is ongoing; every boundary can be updated anytime.'
      }
    ],
    checkQuestion: {
      question: 'If someone says "yes" at first, then gets uncomfortable halfway through, what is true?',
      options: [
        {
          id: 'a',
          label: 'They can ask to stop right away, and their boundary must be respected',
          isCorrect: true,
          feedback: 'Yes! Consent is always reversible at any moment, with zero guilt.'
        },
        {
          id: 'b',
          label: 'They have to finish because they already agreed earlier',
          isCorrect: false,
          feedback: 'Never. Consent can be withdrawn at any second—respecting a pause or stop is mandatory.'
        }
      ]
    }
  },
  {
    id: 'puberty',
    stageNumber: 4,
    title: 'Puberty Explorer',
    shortTitle: 'Puberty',
    subtitle: 'Every body grows on its own healthy timeline.',
    durationLabel: '4 min',
    xpReward: 100,
    tone: 'sage',
    badgeId: 'badge-curiosity-spark',
    steps: [
      {
        title: 'Hormones are messengers',
        body: 'Between ages 8 and 14, the brain sends chemical messengers that spark growth spurts, body hair, skin oil changes, voice shifts, breast development, and new emotions. Everyone’s clock runs slightly differently.',
        keyTakeaway: 'Developing earlier or later than classmates is completely normal.'
      },
      {
        title: 'Normal variations in bodies',
        body: 'Bodies are rarely perfectly symmetrical—one breast or testicle developing a bit ahead of the other is super common. So are growth aches, sudden emotional waves, and needing more sleep.',
        keyTakeaway: 'Asymmetry and uneven growth spurts are ordinary parts of growing up.'
      },
      {
        title: 'Asking questions confidently',
        body: 'If something feels painful, itchy, or just confusing, writing your question down before a clinic or school nurse visit makes it much easier to ask.',
        keyTakeaway: 'Nurses and doctors hear body questions every single day—no question is silly.'
      }
    ],
    checkQuestion: {
      question: 'If your friends are noticing body changes before you do (or after you do), what does that usually mean?',
      options: [
        {
          id: 'a',
          label: 'Everyone’s body has its own healthy internal schedule',
          isCorrect: true,
          feedback: 'True! Puberty unfolds across a wide range of normal ages between 8 and 18.'
        },
        {
          id: 'b',
          label: 'Something is automatically wrong',
          isCorrect: false,
          feedback: 'Not at all—comparing timelines often causes unnecessary worry when your body is simply on its own schedule.'
        }
      ]
    }
  },
  {
    id: 'period-health',
    stageNumber: 5,
    title: 'Period Health',
    shortTitle: 'Periods',
    subtitle: 'Cycle phases, comfort care, and when to check with a nurse.',
    durationLabel: '4 min',
    xpReward: 110,
    tone: 'tangerine',
    badgeId: 'badge-cycle-scholar',
    linkedScenarioId: 'scenario-clinic-visit',
    steps: [
      {
        title: 'What happens across a cycle',
        body: 'Your cycle is counted from Day 1 of bleeding to the day before the next period starts. In the first couple of years after periods begin, cycles between 21 and 45 days are still normal while hormones settle.',
        keyTakeaway: 'Early teen cycles often take 1–2 years to become predictable.'
      },
      {
        title: 'Colors, flow & comfort',
        body: 'Period blood can look bright red, dark brown, or rust-colored depending on how fast it flows—brown simply means older blood exposed to air. Heating pads, gentle stretching, and hydration ease mild cramps.',
        keyTakeaway: 'Shades from bright red to dark brown are all normal menstrual flow.'
      },
      {
        title: 'When pain is too much',
        body: 'Periods can feel uncomfortable, but severe pain that makes you miss school, faint, or soak through a pad every hour for several hours deserves a gentle checkup with a clinician.',
        keyTakeaway: 'Debilitating pain is not something you just have to "tough out."'
      }
    ],
    checkQuestion: {
      question: 'When should you talk to a nurse or doctor about period symptoms?',
      options: [
        {
          id: 'a',
          label: 'When bleeding is brown on the last day of your period',
          isCorrect: false,
          feedback: 'Brown blood at the start or end of a period is completely normal!'
        },
        {
          id: 'b',
          label: 'When cramps stop you from doing daily activities or bleeding is very heavy',
          isCorrect: true,
          feedback: 'Right! Severe pain or soaking through pads every 1–2 hours deserves supportive medical care.'
        }
      ]
    }
  },
  {
    id: 'digital-safety',
    stageNumber: 6,
    title: 'Digital Safety',
    shortTitle: 'Digital Safety',
    subtitle: 'Online privacy, boundaries, and handling image pressure.',
    durationLabel: '3 min',
    xpReward: 115,
    tone: 'lavender',
    badgeId: 'badge-digital-guardian',
    linkedScenarioId: 'scenario-late-night-text',
    steps: [
      {
        title: 'Your privacy belongs to you',
        body: 'Disappearing messages and private DMs can still be screenshotted or recorded. You never owe anyone a private photo to prove affection or trust.',
        keyTakeaway: 'Saying no to photo requests online is smart self-care.'
      },
      {
        title: 'If someone pressures or threatens you',
        body: 'If someone threatens to share an image unless you send more or pay money (sextortion), it is a crime against you—never your fault. Stop replying, save screenshots of threats, block them, and tell a trusted adult or helpline.',
        keyTakeaway: 'Never pay or send more—save evidence and reach out for help immediately.'
      },
      {
        title: 'Tools that protect teens',
        body: 'Services like Take It Down (NCMEC) can help remove intimate images of minors from major platforms without needing to upload the photo publicly.',
        keyTakeaway: 'Practical technical help exists to remove shared images quickly.'
      }
    ],
    checkQuestion: {
      question: 'If someone threatens to share a private photo unless you send another one, what is the safest first step?',
      options: [
        {
          id: 'a',
          label: 'Send one more photo hoping they will stop',
          isCorrect: false,
          feedback: 'Sending more almost always escalates threats. Stopping contact and getting support protects you.'
        },
        {
          id: 'b',
          label: 'Stop replying, screenshot threats, block, and contact a trusted adult or helpline',
          isCorrect: true,
          feedback: 'Exactly. Saving proof and reaching out—even anonymously—cuts off their leverage right away.'
        }
      ]
    }
  },
  {
    id: 'myth-or-fact-quest',
    stageNumber: 7,
    title: 'Myth or Fact Lab',
    shortTitle: 'Myth or Fact',
    subtitle: 'Separate viral rumors from trusted health science.',
    durationLabel: '3 min',
    xpReward: 125,
    tone: 'sage',
    badgeId: 'badge-myth-hunter',
    steps: [
      {
        title: 'Why health myths spread fast',
        body: 'Short videos and group chats often pass along confident-sounding rumors about pregnancy, periods, and contraception. Learning how to spot reliable sources protects your peace of mind.',
        keyTakeaway: 'Confidence in a social video does not equal medical accuracy.'
      },
      {
        title: 'Quick reality checks',
        body: 'You can get pregnant the very first time you have unprotected vaginal sex. Washing or jumping afterward does not prevent pregnancy. And period blood is completely healthy, normal tissue—not "dirty toxins."',
        keyTakeaway: 'Evidence-based facts replace fear with clarity.'
      },
      {
        title: 'Level up in Myth Hunter',
        body: 'Ready to put your radar to the test? Jump into the Myth Hunter mini-game after this card to earn bonus badges.',
        keyTakeaway: 'Check facts before worrying—Lumi and clinicians are always here to verify.'
      }
    ],
    checkQuestion: {
      question: 'Which statement is medically TRUE?',
      options: [
        {
          id: 'a',
          label: 'Pregnancy cannot happen the first time someone has unprotected sex',
          isCorrect: false,
          feedback: 'Myth! Pregnancy can happen any time sperm enters the vagina without effective protection, including the very first time.'
        },
        {
          id: 'b',
          label: 'Condoms are the only method that helps prevent both pregnancy and STIs',
          isCorrect: true,
          feedback: 'True! Hormonal methods prevent pregnancy, while condoms provide dual protection against pregnancy and STIs.'
        }
      ]
    }
  }
];
