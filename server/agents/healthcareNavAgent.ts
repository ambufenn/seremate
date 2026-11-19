import { HEALTH_FACILITIES } from '../data/facilities.ts';
import type { CareActionCard, HealthFacility, RiskNeedsAssessment } from './types.ts';

export function runHealthcareNavigationAgent(
  assessment: RiskNeedsAssessment
): { facilities: HealthFacility[]; careCards: CareActionCard[] } {
  const topicsLower = assessment.detectedTopics.join(' ').toLowerCase();

  const scored = HEALTH_FACILITIES.map((facility) => {
    let score = 0;
    const servicesText = facility.services.join(' ').toLowerCase();

    if (assessment.needsPregnancyTestingInfo && servicesText.includes('pregnancy')) {
      score += 5;
    }
    if (assessment.needsCrisisHelpline && facility.category === '24/7 Helpline') {
      score += 6;
    }
    if (assessment.needsConfidentialClinic && facility.category === 'Youth Clinic') {
      score += 4;
    }
    if (topicsLower.includes('consent') || topicsLower.includes('digital') || topicsLower.includes('relationship')) {
      if (facility.category === 'Counseling & Support' || facility.category === '24/7 Helpline') {
        score += 4;
      }
    }
    if (topicsLower.includes('period') || topicsLower.includes('puberty')) {
      if (servicesText.includes('period')) {
        score += 4;
      }
    }

    return { facility, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topFacilities = scored.slice(0, 3).map((item) => item.facility);

  const careCards: CareActionCard[] = [];

  if (assessment.needsPregnancyTestingInfo) {
    careCards.push({
      id: 'card-pregnancy-quest',
      title: 'Pregnancy Awareness & Testing Guide',
      description: 'Learn when urine pregnancy tests are most accurate and what confidential options exist.',
      actionType: 'quest',
      targetId: 'pregnancy-awareness',
      ctaLabel: 'Open Quest',
    });
  }

  if (assessment.needsConfidentialClinic || assessment.urgency !== 'routine') {
    careCards.push({
      id: 'card-care-navigator',
      title: 'Verified Youth-Friendly Clinics',
      description: 'See confidential testing centers, hours, costs ($0–sliding scale), and what to expect.',
      actionType: 'navigator',
      ctaLabel: 'Browse Clinics',
    });
  }

  if (assessment.needsCrisisHelpline || assessment.needsSafetyCheck) {
    careCards.push({
      id: 'card-helpline',
      title: 'Harbor 24/7 Anonymous Text & Voice Line',
      description: 'Talk or text silently with a trained youth counselor anytime—no caller ID required.',
      actionType: 'helpline',
      targetId: 'fac-harbor-24-7-line',
      ctaLabel: 'View Support Info',
    });
  }

  if (careCards.length === 0) {
    careCards.push({
      id: 'card-myth-hunter',
      title: 'Test Your Knowledge in Myth Hunter',
      description: 'Explore quick fact-vs-myth cards backed by youth health clinicians.',
      actionType: 'scenario',
      ctaLabel: 'Explore Quests',
    });
  }

  return {
    facilities: topFacilities,
    careCards: careCards.slice(0, 3),
  };
}
