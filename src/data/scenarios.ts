import type { InteractiveScenario } from '../types/reproguard';

export const INTERACTIVE_SCENARIOS: InteractiveScenario[] = [
  {
    id: 'scenario-late-period',
    title: 'The Late Period & Quiet Fear',
    subtitle: 'Navigating a pregnancy scare calmly when you feel afraid to tell anyone.',
    durationLabel: '3 min story',
    tone: 'tangerine',
    xpReward: 140,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        sceneTitle: 'Tuesday Evening · Bedroom Desk',
        settingDescription: 'Your calendar app shows your period is 6 days late. Your chest feels tight, and you worry what people around you would say if you asked for help.',
        dialogueSpeaker: 'Maya (16)',
        dialogueText: 'My period is almost a week late. My stomach is in knots and I am honestly terrified to tell my parents or even my best friend.',
        lumiWhisper: 'Take one slow breath with me. Feeling scared when you do not have answers yet is completely human. What feels like the kindest next step right now?',
        choices: [
          {
            id: 'c1-test',
            label: 'Learn when a pregnancy test actually works best',
            supportiveResponse: 'Smart move. Knowing how testing works replaces guessing with real clarity. Urine tests are most accurate from the first day of a missed period—or 21 days after unprotected sex—using first-morning urine.',
            lumiNote: 'Remember: stress itself can delay a period, so testing calmly gives you real information instead of spirals.',
            nextNodeId: 'step-2-support',
            xpBonus: 30
          },
          {
            id: 'c1-panic',
            label: 'Hide it and wait weeks hoping it goes away',
            supportiveResponse: 'It makes total sense why hiding feels safer when you feel overwhelmed. At the same time, waiting without answers often makes anxiety louder—and if you ever need care or options, having accurate info earlier gives you more choices.',
            lumiNote: 'You do not have to tell your family to get accurate medical information privately.',
            nextNodeId: 'step-2-support',
            xpBonus: 20
          },
          {
            id: 'c1-lumi',
            label: 'Check what confidential clinics or hotlines exist',
            supportiveResponse: 'Reaching out to a youth-friendly clinic or anonymous text line lets you talk to a real nurse or counselor without having to tell anyone at home first.',
            lumiNote: 'Clinics like Bloom Youth Wellness offer free, confidential teen tests in a private lounge.',
            nextNodeId: 'step-2-support',
            xpBonus: 35
          }
        ]
      },
      'step-2-support': {
        id: 'step-2-support',
        sceneTitle: 'Wednesday Afternoon · Choosing Safe Support',
        settingDescription: 'You decide to take a confidential urine test and want to make sure you stay emotionally and physically safe regardless of the result.',
        dialogueSpeaker: 'Maya (16)',
        dialogueText: 'Okay, I feel a little calmer knowing I can check privately. What if the result is positive, or what if I feel unsafe telling someone?',
        lumiWhisper: 'No matter what two lines or one line show up, you deserve safety and respectful care. How would you like to prepare?',
        choices: [
          {
            id: 'c2-clinic',
            label: 'Book a free confidential visit with a youth nurse',
            supportiveResponse: 'A youth-trained nurse will confirm the result gently, explain all options calmly, and never lecture or judge you. You are always in charge of the conversation.',
            lumiNote: 'Great choice—knowing a clinic’s confidentiality rules beforehand takes away so much fear.',
            nextNodeId: null,
            xpBonus: 40
          },
          {
            id: 'c2-trusted',
            label: 'Reach out to a 24/7 anonymous teen support line first',
            supportiveResponse: 'Starting with an anonymous text or phone counselor is a wonderful bridge. They can help you plan your safety, calm your nerves, and walk you through local clinics step by step.',
            lumiNote: 'You took care of your safety and your health at your own pace.',
            nextNodeId: null,
            xpBonus: 40
          }
        ]
      }
    }
  },
  {
    id: 'scenario-late-night-text',
    title: 'The Late-Night Text',
    subtitle: 'Handling relationship pressure, consent, and private photo boundaries.',
    durationLabel: '3 min story',
    tone: 'lavender',
    xpReward: 130,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        sceneTitle: '10:42 PM · Direct Messages',
        settingDescription: 'Someone you have been talking to sends a message asking for a private picture, adding "everyone does it, don’t you trust me?"',
        dialogueSpeaker: 'Jordan (15)',
        dialogueText: 'I actually like them, and I don’t want things to get awkward at school tomorrow—but my gut feels uncomfortable.',
        lumiWhisper: 'That uneasy feeling in your gut is your boundary radar working. Trusting it does not make you rude. How do you want to respond?',
        choices: [
          {
            id: 'd1-clear',
            label: 'Say clearly: "I’m not comfortable sending photos like that."',
            supportiveResponse: 'Clear, direct, and calm! Someone who truly respects you will accept that boundary immediately without arguing or guilt-tripping.',
            lumiNote: 'Respectful partners never treat your boundaries like a test of loyalty.',
            nextNodeId: 'step-2-reaction',
            xpBonus: 35
          },
          {
            id: 'd1-deflect',
            label: 'Lightly change the subject and put the phone down',
            supportiveResponse: 'Stepping away from the screen gives you breathing room. You never owe anyone an instant reply late at night—especially when feeling pressured.',
            lumiNote: 'Taking space is a totally valid boundary too.',
            nextNodeId: 'step-2-reaction',
            xpBonus: 25
          }
        ]
      },
      'step-2-reaction': {
        id: 'step-2-reaction',
        sceneTitle: 'Next Message · Testing Your Boundary',
        settingDescription: 'They reply again, pushing a little harder: "Come on, I promised I’d delete it right away."',
        dialogueSpeaker: 'Jordan (15)',
        dialogueText: 'Ugh, they didn’t drop it. Now I know this isn’t really about trust—it’s pressure.',
        lumiWhisper: 'You spotted the red flag right away. Repeatedly asking after you hesitated or said no is disrespect. What is your next move?',
        choices: [
          {
            id: 'd2-hold',
            label: 'Hold firm, mute/block if they keep pushing, and talk to a trusted friend',
            supportiveResponse: 'Protecting your privacy is strong, healthy self-respect. Screenshots of persistent pressure can also help if you ever need support from a counselor.',
            lumiNote: 'Healthy connections never require you to trade away your comfort.',
            nextNodeId: null,
            xpBonus: 40
          },
          {
            id: 'd2-advocate',
            label: 'Save the SafeSpace Digital Advocacy contact just in case',
            supportiveResponse: 'Smart preparedness! Knowing where confidential digital safety advocates are means you and your friends are always backed up.',
            lumiNote: 'You mastered digital boundaries and consent!',
            nextNodeId: null,
            xpBonus: 40
          }
        ]
      }
    }
  },
  {
    id: 'scenario-clinic-visit',
    title: 'First Clinic Visit Nerves',
    subtitle: 'What actually happens when you walk into a youth-friendly health center.',
    durationLabel: '2 min story',
    tone: 'sage',
    xpReward: 120,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        sceneTitle: 'Friday · Outside Bloom Youth Wellness',
        settingDescription: 'You have had really painful cramps for three months, and you finally booked a visit. Standing outside the door, your heart beats fast.',
        dialogueSpeaker: 'Sam (14)',
        dialogueText: 'What if the nurse judges me or thinks my questions are awkward? I don’t even know what to say at the front desk.',
        lumiWhisper: 'Walking through the door for the first time is the hardest part! You can keep it super simple at check-in. What helps you step inside?',
        choices: [
          {
            id: 'cv1-notes',
            label: 'Read off two quick notes saved on your phone',
            supportiveResponse: 'Clinicians love when teens bring notes on their phone! Saying "I’m here for a confidential checkup about my period cramps" is all you need.',
            lumiNote: 'You can even hand your phone note to the nurse if talking feels hard.',
            nextNodeId: 'step-2-exam',
            xpBonus: 30
          },
          {
            id: 'cv1-privacy',
            label: 'Ask the receptionist about teen confidentiality first',
            supportiveResponse: 'Awesome question to ask upfront! Youth clinics clearly explain what stays 100% private before you share personal health details.',
            lumiNote: 'Knowing your privacy rights helps you relax and ask honestly.',
            nextNodeId: 'step-2-exam',
            xpBonus: 30
          }
        ]
      },
      'step-2-exam': {
        id: 'step-2-exam',
        sceneTitle: 'Inside the Private Consultation Room',
        settingDescription: 'The nurse greets you warmly, offers water, and says: "We’ll just chat first—nothing happens today without your permission."',
        dialogueSpeaker: 'Sam (14)',
        dialogueText: 'Oh wow, that was way gentler than I expected. She actually listened without rushing me.',
        lumiWhisper: 'You deserved respectful healthcare the whole time. How do you wrap up your visit?',
        choices: [
          {
            id: 'cv2-plan',
            label: 'Ask about comfort options and when to follow up',
            supportiveResponse: 'You leave with a clear pain-relief plan, free period supplies, and confidence knowing clinics are on your side.',
            lumiNote: 'Taking care of your body is something to feel proud of!',
            nextNodeId: null,
            xpBonus: 35
          }
        ]
      }
    }
  }
];
