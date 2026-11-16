export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ProfessionalInfo {
  currentTitle: string;
  currentCompany: string;
  yearsExperience: string;
  professionalSummary: string;
  noticePeriod: string;
  expectedSalary: string;
  currentSalary: string;
  preferredJobTitle: string;
  workAuthorization: string;
  requireSponsorship: 'Yes' | 'No';
  willingToRelocate: 'Yes' | 'No';
}

export interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gradeGpa: string;
}

export interface ExperienceRecord {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Frontend' | 'Backend' | 'Languages' | 'Databases' | 'DevOps' | 'Tools' | 'Soft Skills';
}

export interface LinkRecord {
  id: string;
  label: string;
  url: string;
  category: string;
}

export interface ProfessionalLinks {
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  personalWebsite: string;
  twitterUrl?: string;
  blogUrl?: string;
  customLinks?: LinkRecord[];
}

export interface ResumeFile {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  isDefault: boolean;
  textContent: string;
  fileData?: string;
}

export interface CustomQuestionAnswer {
  id: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
}

export interface UserProfile {
  personal: PersonalInfo;
  professional: ProfessionalInfo;
  education: EducationRecord[];
  experience: ExperienceRecord[];
  skills: SkillItem[];
  links: ProfessionalLinks;
  resumes: ResumeFile[];
  otherQuestions?: CustomQuestionAnswer[];
}

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface DetectedField {
  id: string;
  elementId: string;
  name: string;
  type: string;
  tagName: string;
  placeholder: string;
  labelText: string;
  ariaLabel: string;
  autocomplete: string;
  surroundingContext: string;
  options?: { value: string; label: string }[];
  currentValue: string;
  stepIndex?: number;
  selector: string;
  domElementRef?: HTMLElement;
}

export interface FieldMatch {
  fieldId: string;
  profileKey: string;
  profileKeyLabel: string;
  matchedValue: string;
  confidenceScore: number; // 0 to 100
  confidenceLevel: ConfidenceLevel; // high >= 90, medium >= 70, low < 70
  ruleOrigin: 'exact' | 'synonym' | 'learned' | 'context' | 'autocomplete';
  needsReview: boolean;
  userOverridden?: boolean;
  status: 'pending' | 'approved' | 'skipped' | 'filled';
}

export interface LearnedMapping {
  id: string;
  domain: string; // '*' or specific site like 'greenhouse.io'
  fieldIdentifier: string; // name or id pattern
  profileKey: string;
  timesUsed: number;
  createdAt: string;
}

export interface ApplicationHistoryItem {
  id: string;
  company: string;
  jobTitle: string;
  portalUrl: string;
  status: 'Draft' | 'Applied' | 'Reviewing' | 'Interviewing' | 'Archived';
  appliedDate: string;
  detectedFieldsCount: number;
  autofilledCount: number;
  notes: string;
}

export interface AIQuestionRequest {
  question: string;
  company?: string;
  jobTitle?: string;
  tone?: 'professional' | 'concise' | 'passionate';
}

export interface AIQuestionSuggestion {
  category: string;
  suggestedAnswer: string;
  confidenceScore: number;
  reasoning: string;
}
