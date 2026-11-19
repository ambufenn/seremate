import type { HealthcareResource } from '../types/seremate';

export const BASELINE_SUPPORT_RESOURCES: HealthcareResource[] = [
  {
    id: 'res-emergency-notice',
    name: 'Local Emergency Services & Urgent Medical Care',
    category: '24/7 Helpline',
    services: ['Emergency Care', 'Severe Pain / Bleeding', 'Immediate Physical Safety'],
    description:
      'For sudden severe abdominal pain, heavy bleeding, fainting, or immediate physical danger, contact your country’s emergency number or nearest hospital emergency department.',
    locationLabel: 'Your local emergency number (e.g., 911 US/CA, 112 EU, 999 UK, 119/112 local)',
    hours: '24/7 · Immediate response',
    costInfo: 'Emergency medical triage',
    contactValue: 'Dial local emergency number (911 / 112 / 999)',
    verificationNote: 'Standard international emergency guidance (verify local emergency number).',
    active: true,
    isBaselineFallback: true
  },
  {
    id: 'res-placeholder-youth-clinic',
    name: 'Community Adolescent Health Clinic (Sample Placeholder)',
    category: 'Youth Clinic',
    services: ['Pregnancy Testing', 'Menstrual Care', 'STI Screening', 'Contraception Counseling'],
    description:
      'Example listing demonstrating how verified local youth-friendly clinics appear once configured by your regional SereMate administrator.',
    locationLabel: 'Placeholder Directory Slot — Configure local clinic address in Admin Panel',
    hours: 'Typical clinic hours: Mon–Fri 9:00 AM – 5:00 PM',
    costInfo: 'Placeholder — Typically free or sliding-scale for ages 10–19',
    contactValue: 'Placeholder — Replace with verified local clinic phone/URL',
    verificationNote: 'Clearly labeled placeholder demo entry — not an active local clinic.',
    active: true,
    isBaselineFallback: true
  },
  {
    id: 'res-placeholder-helpline',
    name: 'Confidential Youth Support & Crisis Text Line (Sample Placeholder)',
    category: 'Counseling & Advocacy',
    services: ['Anonymous Counseling', 'Relationship Safety', 'Digital Privacy Support'],
    description:
      'Example listing showing where verified national or regional confidential teen hotlines and text advocacy lines are published by administrators.',
    locationLabel: 'Placeholder Directory Slot — Configure verified national hotline in Admin Panel',
    hours: '24/7 Confidential Text & Voice Support (Placeholder)',
    costInfo: 'Free & anonymous',
    contactValue: 'Placeholder — Replace with verified regional helpline number',
    verificationNote: 'Clearly labeled placeholder demo entry — configure regional verified hotlines in Admin.',
    active: true,
    isBaselineFallback: true
  },
  {
    id: 'res-school-nurse',
    name: 'School Nurse or Primary Care Family Clinician',
    category: 'Community Health',
    services: ['Puberty Questions', 'Period Comfort', 'Referrals to Youth Specialists'],
    description:
      'Your school health office, community health center, or primary care clinician can answer puberty and menstrual questions and connect you with confidential youth clinics.',
    locationLabel: 'School Health Office or Local Primary Health Center',
    hours: 'School / Clinic operating hours',
    costInfo: 'Covered by school health or standard clinic services',
    contactValue: 'Ask your school health desk or family clinic reception',
    verificationNote: 'Verified general care pathway guidance.',
    active: true,
    isBaselineFallback: true
  }
];
