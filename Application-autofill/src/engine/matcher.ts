import { DetectedField, FieldMatch, UserProfile, LearnedMapping, ConfidenceLevel } from '../types';
import { SYNONYM_RULES, normalizeIdentifier } from './synonyms';

/**
 * Retrieve a nested value from the UserProfile object using a dot-notated string key
 * e.g., 'personal.firstName' -> userProfile.personal.firstName
 */
export function getProfileValue(profile: UserProfile, keyPath: string): string {
  if (!profile || !keyPath) return '';

  // Specialized resolution for default resume
  if (keyPath === 'resumes.default' || keyPath === 'resumes.default.fileName' || keyPath === 'resumes.fileName') {
    const defaultResume = profile.resumes?.find((r) => r.isDefault) || profile.resumes?.[0];
    return defaultResume?.fileName || '';
  }
  if (keyPath === 'resumes.default.title' || keyPath === 'resumes.title') {
    const defaultResume = profile.resumes?.find((r) => r.isDefault) || profile.resumes?.[0];
    return defaultResume?.title || defaultResume?.fileName || '';
  }
  if (keyPath === 'resumes.default.textContent' || keyPath === 'resumes.textContent') {
    const defaultResume = profile.resumes?.find((r) => r.isDefault) || profile.resumes?.[0];
    return defaultResume?.textContent || '';
  }

  // Links resolution with customLinks fallback
  if (keyPath.startsWith('links.')) {
    const linkKey = keyPath.replace('links.', '');
    const directVal = (profile.links as any)?.[linkKey];
    if (typeof directVal === 'string' && directVal.trim()) return directVal;

    const customLinks = profile.links?.customLinks || [];
    const matched = customLinks.find((l) => {
      const cat = l.category.toLowerCase();
      const lbl = l.label.toLowerCase();
      const target = linkKey.toLowerCase().replace('url', '');
      return cat.includes(target) || target.includes(cat) || lbl.includes(target);
    });
    if (matched?.url) return matched.url;
  }

  // Custom Q&A resolution from "Other" section
  if (keyPath.startsWith('otherQuestions.') || keyPath.startsWith('other.')) {
    const qId = keyPath.replace(/^(otherQuestions|other)\./, '');
    const found = profile.otherQuestions?.find(
      (q) => q.id === qId || q.question.toLowerCase() === qId.toLowerCase()
    );
    if (found?.answer) return found.answer;
  }

  const parts = keyPath.split('.');
  let curr: any = profile;

  for (const part of parts) {
    if (curr === undefined || curr === null) return '';
    curr = curr[part];
  }

  if (typeof curr === 'string') return curr;
  if (typeof curr === 'number' || typeof curr === 'boolean') return String(curr);
  return '';
}

/**
 * Match detected fields against UserProfile and Learned Mappings
 * Adheres to FR-10, FR-11, FR-15, FR-16
 */
export function matchDetectedFields(
  fields: DetectedField[],
  profile: UserProfile,
  learnedMappings: LearnedMapping[] = [],
  currentDomain: string = window.location.hostname || '*'
): FieldMatch[] {
  return fields.map((field) => {
    // 1. Check Learned Mappings first (User Corrections)
    const matchingLearned = learnedMappings.find((m) => {
      const domainMatch = m.domain === '*' || m.domain === currentDomain || currentDomain.includes(m.domain);
      const identifierMatch =
        (field.name && field.name.toLowerCase() === m.fieldIdentifier.toLowerCase()) ||
        (field.elementId && field.elementId.toLowerCase() === m.fieldIdentifier.toLowerCase());
      return domainMatch && identifierMatch;
    });

    if (matchingLearned) {
      const val = getProfileValue(profile, matchingLearned.profileKey);
      const matchingRule = SYNONYM_RULES.find((r) => r.profileKey === matchingLearned.profileKey);
      return {
        fieldId: field.id,
        profileKey: matchingLearned.profileKey,
        profileKeyLabel: matchingRule?.label || matchingLearned.profileKey,
        matchedValue: val,
        confidenceScore: 98,
        confidenceLevel: 'high' as ConfidenceLevel,
        ruleOrigin: 'learned',
        needsReview: false,
        status: 'approved',
      };
    }

    // 2. Prepare normalized signals from the element
    const normalizedName = normalizeIdentifier(field.name);
    const normalizedId = normalizeIdentifier(field.elementId);
    const normalizedLabel = normalizeIdentifier(field.labelText);
    const normalizedPlaceholder = normalizeIdentifier(field.placeholder);
    const normalizedAria = normalizeIdentifier(field.ariaLabel);
    const normalizedContext = normalizeIdentifier(field.surroundingContext);
    const rawAutocomplete = (field.autocomplete || '').toLowerCase().trim();

    let bestRule = null;
    let bestScore = 0;
    let bestOrigin: 'exact' | 'synonym' | 'learned' | 'context' | 'autocomplete' = 'synonym';

    // Iterate through all known rules to find the highest match score
    for (const rule of SYNONYM_RULES) {
      let currentScore = 0;
      let origin: 'exact' | 'synonym' | 'context' | 'autocomplete' = 'synonym';

      // Signal A: Autocomplete attribute exact match
      if (rawAutocomplete && rule.autocompletes.includes(rawAutocomplete)) {
        currentScore = 98;
        origin = 'autocomplete';
      }

      // Signal B: Exact name/id match against rule.exactNames
      if (currentScore < 95) {
        const cleanName = field.name.toLowerCase().replace(/[-_]/g, '');
        const cleanId = field.elementId.toLowerCase().replace(/[-_]/g, '');
        if (rule.exactNames.some((en) => en.replace(/[-_]/g, '') === cleanName || en.replace(/[-_]/g, '') === cleanId)) {
          currentScore = Math.max(currentScore, 95);
          origin = 'exact';
        }
      }

      // Signal C: Regex patterns matched against name, id, label, placeholder
      if (currentScore < 92) {
        for (const pattern of rule.regexPatterns) {
          if (pattern.test(field.name) || pattern.test(field.elementId)) {
            currentScore = Math.max(currentScore, 92);
            origin = 'exact';
            break;
          }
          if (pattern.test(field.labelText)) {
            currentScore = Math.max(currentScore, 90);
            origin = 'synonym';
            break;
          }
        }
      }

      // Signal D: Label or Placeholder exact phrase match
      if (currentScore < 88) {
        for (const syn of rule.commonSynonyms) {
          if (normalizedLabel.includes(syn) || syn.includes(normalizedLabel)) {
            currentScore = Math.max(currentScore, 86);
            origin = 'synonym';
            break;
          }
          if (normalizedPlaceholder.includes(syn)) {
            currentScore = Math.max(currentScore, 82);
            origin = 'synonym';
            break;
          }
          if (normalizedAria.includes(syn)) {
            currentScore = Math.max(currentScore, 84);
            origin = 'synonym';
            break;
          }
        }
      }

      // Signal E: Contextual clues (nearby header / fieldset legend)
      if (currentScore < 75 && normalizedContext) {
        for (const syn of rule.commonSynonyms) {
          if (normalizedContext.includes(syn)) {
            currentScore = Math.max(currentScore, 72);
            origin = 'context';
            break;
          }
        }
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestRule = rule;
        bestOrigin = origin;
      }
    }

    // Check Custom Questions from "Other" section if standard rules didn't strongly match
    if (bestScore < 70 && profile.otherQuestions && profile.otherQuestions.length > 0) {
      const fieldText = `${field.labelText} ${field.name} ${field.placeholder} ${field.ariaLabel}`.toLowerCase();
      for (const qna of profile.otherQuestions) {
        if (!qna.question || !qna.answer) continue;
        const qText = qna.question.toLowerCase();
        
        const qWords = qText.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
        const matchingWords = qWords.filter((w) => fieldText.includes(w));
        const overlapRatio = qWords.length > 0 ? matchingWords.length / qWords.length : 0;

        if (fieldText.includes(qText) || qText.includes(fieldText.trim()) || overlapRatio >= 0.5) {
          const customScore = fieldText.includes(qText) ? 92 : Math.round(75 + overlapRatio * 15);
          const customConfidence: ConfidenceLevel = customScore >= 85 ? 'high' : 'medium';
          return {
            fieldId: field.id,
            profileKey: `otherQuestions.${qna.id}`,
            profileKeyLabel: `Other: ${qna.question.slice(0, 30)}...`,
            matchedValue: qna.answer,
            confidenceScore: customScore,
            confidenceLevel: customConfidence,
            ruleOrigin: 'context',
            needsReview: customConfidence !== 'high',
            status: customConfidence === 'high' ? 'approved' : 'pending',
          };
        }
      }
    }

    if (!bestRule || bestScore < 60) {
      // Unmatched or very low confidence
      return {
        fieldId: field.id,
        profileKey: '',
        profileKeyLabel: 'Unmatched Field',
        matchedValue: '',
        confidenceScore: Math.min(bestScore, 50),
        confidenceLevel: 'low',
        ruleOrigin: 'context',
        needsReview: true,
        status: 'pending',
      };
    }

    const matchedValue = getProfileValue(profile, bestRule.profileKey);
    const confidenceLevel: ConfidenceLevel = bestScore >= 90 ? 'high' : bestScore >= 70 ? 'medium' : 'low';
    const needsReview = confidenceLevel !== 'high';

    return {
      fieldId: field.id,
      profileKey: bestRule.profileKey,
      profileKeyLabel: bestRule.label,
      matchedValue,
      confidenceScore: bestScore,
      confidenceLevel,
      ruleOrigin: bestOrigin,
      needsReview,
      status: confidenceLevel === 'high' ? 'approved' : 'pending',
    };
  });
}
