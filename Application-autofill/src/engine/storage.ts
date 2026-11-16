import { UserProfile, LearnedMapping, ApplicationHistoryItem } from '../types';

const PROFILE_STORAGE_KEY = 'job_autofill_profile_v1';
const MAPPINGS_STORAGE_KEY = 'job_autofill_mappings_v1';
const APPLICATIONS_STORAGE_KEY = 'job_autofill_applications_v1';
const SETTINGS_STORAGE_KEY = 'job_autofill_settings_v1';

export interface ExtensionSettings {
  autoDetectOnLoad: boolean;
  confidenceThreshold: number; // default 90
  reviewThreshold: number; // default 70
  highlightMatchesInPage: boolean;
  theme: 'dark' | 'light';
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  autoDetectOnLoad: true,
  confidenceThreshold: 90,
  reviewThreshold: 70,
  highlightMatchesInPage: true,
  theme: 'dark',
};

export const INITIAL_PROFILE: UserProfile = {
  personal: {
    firstName: 'Alex',
    middleName: 'J.',
    lastName: 'Morgan',
    preferredName: 'Alex',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 382-9012',
    address: '742 Market Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94103',
  },
  professional: {
    currentTitle: 'Senior Full Stack Engineer',
    currentCompany: 'HyperScale Labs',
    yearsExperience: '6',
    professionalSummary:
      'Senior Full Stack Engineer with 6+ years building high-throughput web applications, React frontends, and Python/Django distributed microservices. Proven success leading architectural migrations and improving application latency by 40%.',
    noticePeriod: '2 weeks',
    expectedSalary: '$165,000',
    currentSalary: '$145,000',
    preferredJobTitle: 'Senior Software Engineer / Tech Lead',
    workAuthorization: 'Authorized to work in the US without restriction',
    requireSponsorship: 'No',
    willingToRelocate: 'Yes',
  },
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      fieldOfStudy: 'Computer Science',
      startDate: '2015',
      endDate: '2019',
      gradeGpa: '3.84 / 4.0',
    },
    {
      id: 'edu-2',
      degree: 'Full Stack Engineering Specialization',
      institution: 'Stanford Online Certificate',
      fieldOfStudy: 'Distributed Systems & Cloud Computing',
      startDate: '2020',
      endDate: '2020',
      gradeGpa: 'Distinction',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'HyperScale Labs',
      title: 'Senior Full Stack Engineer',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2022-03',
      endDate: 'Present',
      current: true,
      responsibilities:
        'Led architecture of customer-facing dashboard using React, TypeScript, and Django REST Framework. Reduced API p99 latency from 450ms to 95ms through query optimization and Redis caching. Mentored 4 engineers.',
    },
    {
      id: 'exp-2',
      company: 'Nexus Cloud Systems',
      title: 'Software Engineer',
      location: 'San Jose, CA',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      responsibilities:
        'Engineered microservices in Python/Django and Node.js. Built real-time WebSocket event pipelines and modernized legacy jQuery forms to responsive React components.',
    },
  ],
  skills: [
    { id: 'sk-1', name: 'TypeScript', level: 'Expert', category: 'Languages' },
    { id: 'sk-2', name: 'React', level: 'Expert', category: 'Frontend' },
    { id: 'sk-3', name: 'Python', level: 'Advanced', category: 'Languages' },
    { id: 'sk-4', name: 'Django / DRF', level: 'Advanced', category: 'Backend' },
    { id: 'sk-5', name: 'PostgreSQL', level: 'Advanced', category: 'Databases' },
    { id: 'sk-6', name: 'Tailwind CSS', level: 'Expert', category: 'Frontend' },
    { id: 'sk-7', name: 'Docker & CI/CD', level: 'Intermediate', category: 'DevOps' },
    { id: 'sk-8', name: 'System Architecture', level: 'Advanced', category: 'Tools' },
  ],
  links: {
    linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
    githubUrl: 'https://github.com/alexmorgan-code',
    portfolioUrl: 'https://alexmorgan.dev',
    personalWebsite: 'https://alexmorgan.dev/notes',
    twitterUrl: 'https://twitter.com/alexmorgan_dev',
    customLinks: [
      { id: 'link-1', label: 'LinkedIn Profile', url: 'https://linkedin.com/in/alexmorgan-dev', category: 'linkedin' },
      { id: 'link-2', label: 'GitHub Profile', url: 'https://github.com/alexmorgan-code', category: 'github' },
      { id: 'link-3', label: 'Portfolio Website', url: 'https://alexmorgan.dev', category: 'portfolio' },
      { id: 'link-4', label: 'Personal Website / Notes', url: 'https://alexmorgan.dev/notes', category: 'website' },
      { id: 'link-5', label: 'Twitter / X Profile', url: 'https://twitter.com/alexmorgan_dev', category: 'twitter' },
    ],
  },
  resumes: [
    {
      id: 'res-1',
      title: 'Alex_Morgan_Software_Engineer_2026.pdf',
      fileName: 'Alex_Morgan_Software_Engineer_2026.pdf',
      fileSize: '142 KB',
      uploadedAt: '2026-03-15T10:00:00Z',
      isDefault: true,
      textContent:
        'Alex Morgan - Senior Full Stack Engineer. Specializing in TypeScript, React, Python, Django, Cloud Architecture. 6+ years experience.',
    },
    {
      id: 'res-2',
      title: 'Alex_Morgan_FullStack_Leader.pdf',
      fileName: 'Alex_Morgan_FullStack_Leader.pdf',
      fileSize: '165 KB',
      uploadedAt: '2026-01-10T14:20:00Z',
      isDefault: false,
      textContent:
        'Alex Morgan - Technical Lead & Senior Engineer. Systems engineering, agile mentoring, distributed architecture.',
    },
  ],
  otherQuestions: [
    {
      id: 'qna-1',
      question: 'Why are you interested in joining our company?',
      answer: 'I am excited by your engineering mission, scalable systems, and developer-centric culture. My background in full-stack architecture and high-throughput web apps directly matches your engineering goals.',
      category: 'Behavioral',
    },
    {
      id: 'qna-2',
      question: 'What is your preferred start date or notice period?',
      answer: '2 weeks from offer acceptance.',
      category: 'Logistics',
    },
    {
      id: 'qna-3',
      question: 'Are you open to remote or hybrid work arrangements?',
      answer: 'Yes, fully equipped for high-velocity remote work and comfortable with hybrid schedules.',
      category: 'Logistics',
    },
    {
      id: 'qna-4',
      question: 'Describe your proudest technical achievement.',
      answer: 'Architected and led the migration of a mission-critical dashboard to an asynchronous microservices pipeline with React and automated CI/CD, reducing p99 latency by 40% and cutting build times in half.',
      category: 'Technical',
    },
    {
      id: 'qna-5',
      question: 'Are you legally authorized to work in the country of employment?',
      answer: 'Yes, fully authorized with no visa sponsorship required.',
      category: 'Authorization',
    },
  ],
};

export const INITIAL_LEARNED_MAPPINGS: LearnedMapping[] = [
  {
    id: 'learn-1',
    domain: '*',
    fieldIdentifier: 'cand_first_name',
    profileKey: 'personal.firstName',
    timesUsed: 42,
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'learn-2',
    domain: 'greenhouse.io',
    fieldIdentifier: 'job_application_answers_attributes_0_boolean_value',
    profileKey: 'professional.workAuthorization',
    timesUsed: 19,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'learn-3',
    domain: 'lever.co',
    fieldIdentifier: 'comments',
    profileKey: 'professional.professionalSummary',
    timesUsed: 8,
    createdAt: '2026-02-18T00:00:00Z',
  },
];

export const INITIAL_APPLICATIONS: ApplicationHistoryItem[] = [
  {
    id: 'app-1',
    company: 'Stripe',
    jobTitle: 'Senior Full Stack Engineer',
    portalUrl: 'https://boards.greenhouse.io/stripe/jobs/482910',
    status: 'Applied',
    appliedDate: '2026-09-20',
    detectedFieldsCount: 26,
    autofilledCount: 24,
    notes: 'Greenhouse form filled in 4 seconds. 2 custom questions reviewed.',
  },
  {
    id: 'app-2',
    company: 'Figma',
    jobTitle: 'Staff Frontend Infrastructure Engineer',
    portalUrl: 'https://jobs.lever.co/figma/6389201',
    status: 'Interviewing',
    appliedDate: '2026-09-18',
    detectedFieldsCount: 19,
    autofilledCount: 19,
    notes: 'Lever dynamic form autofilled with 100% confidence.',
  },
  {
    id: 'app-3',
    company: 'Linear',
    jobTitle: 'Product Engineer - Core App',
    portalUrl: 'https://jobs.ashbyhq.com/linear/app',
    status: 'Reviewing',
    appliedDate: '2026-09-14',
    detectedFieldsCount: 15,
    autofilledCount: 14,
    notes: 'Used AI assistant for "Why Linear?" question.',
  },
];

export class LocalStorageManager {
  // Profile
  static getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (!parsed.otherQuestions || parsed.otherQuestions.length === 0) {
          parsed.otherQuestions = INITIAL_PROFILE.otherQuestions || [];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed reading profile from local storage', e);
    }
    return INITIAL_PROFILE;
  }

  static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed saving profile', e);
    }
  }

  // Learned Mappings
  static getLearnedMappings(): LearnedMapping[] {
    try {
      const stored = localStorage.getItem(MAPPINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading mappings', e);
    }
    return INITIAL_LEARNED_MAPPINGS;
  }

  static saveLearnedMapping(mapping: Omit<LearnedMapping, 'id' | 'createdAt' | 'timesUsed'>): LearnedMapping {
    const mappings = this.getLearnedMappings();
    const existingIndex = mappings.findIndex(
      (m) => m.fieldIdentifier === mapping.fieldIdentifier && (m.domain === mapping.domain || m.domain === '*')
    );

    let updated: LearnedMapping;
    if (existingIndex >= 0) {
      updated = {
        ...mappings[existingIndex],
        profileKey: mapping.profileKey,
        timesUsed: mappings[existingIndex].timesUsed + 1,
      };
      mappings[existingIndex] = updated;
    } else {
      updated = {
        id: `learned-${Date.now()}`,
        domain: mapping.domain || '*',
        fieldIdentifier: mapping.fieldIdentifier,
        profileKey: mapping.profileKey,
        timesUsed: 1,
        createdAt: new Date().toISOString(),
      };
      mappings.unshift(updated);
    }

    try {
      localStorage.setItem(MAPPINGS_STORAGE_KEY, JSON.stringify(mappings));
    } catch (e) {
      console.error('Failed saving learned mapping', e);
    }

    return updated;
  }

  // Application History
  static getApplications(): ApplicationHistoryItem[] {
    try {
      const stored = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading applications', e);
    }
    return INITIAL_APPLICATIONS;
  }

  static saveApplication(app: ApplicationHistoryItem): void {
    const apps = this.getApplications();
    const existingIdx = apps.findIndex((a) => a.id === app.id);
    if (existingIdx >= 0) {
      apps[existingIdx] = app;
    } else {
      apps.unshift(app);
    }
    try {
      localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed saving application', e);
    }
  }

  // Settings
  static getSettings(): ExtensionSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed reading settings', e);
    }
    return DEFAULT_SETTINGS;
  }

  static saveSettings(settings: ExtensionSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed saving settings', e);
    }
  }
}
