import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  Upload,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Building,
  Briefcase,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { DetectedField, FieldMatch, UserProfile } from '../../types';

interface JobPortalSimulatorProps {
  formContainerRef: React.RefObject<HTMLDivElement | null>;
  activePreset: 'greenhouse' | 'lever' | 'workday' | 'raw';
  setActivePreset: (preset: 'greenhouse' | 'lever' | 'workday' | 'raw') => void;
  detectedFields: DetectedField[];
  fieldMatches: FieldMatch[];
  onTriggerAutofill: () => void;
  onOpenInspector: () => void;
  profile: UserProfile;
}

export const JobPortalSimulator: React.FC<JobPortalSimulatorProps> = ({
  formContainerRef,
  activePreset,
  setActivePreset,
  detectedFields,
  fieldMatches,
  onTriggerAutofill,
  onOpenInspector,
  profile,
}) => {
  // Workday multi-step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [floatingWidgetVisible, setFloatingWidgetVisible] = useState<boolean>(true);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Map fieldId to match info for quick badge rendering
  const matchMap = new Map<string, FieldMatch>();
  fieldMatches.forEach((m) => matchMap.set(m.fieldId, m));

  const getMatchByElementId = (id: string, name: string) => {
    const field = detectedFields.find((f) => f.elementId === id || f.name === name);
    if (!field) return null;
    return matchMap.get(field.id);
  };

  const renderBadge = (elementId: string, name: string) => {
    const match = getMatchByElementId(elementId, name);
    if (!match || !match.matchedValue) return null;

    const isHigh = match.confidenceLevel === 'high';
    return (
      <span
        onClick={onOpenInspector}
        title={`Matched to: ${match.profileKey} (${match.confidenceScore}% confidence). Click to remap.`}
        className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-transform hover:scale-105 inline-flex items-center gap-1 ${
          isHigh
            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
        }`}
      >
        <span>{isHigh ? '✓' : '?'}</span>
        <span>{match.confidenceScore}%</span>
      </span>
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedMessage('Application form received for user review. (Note: JobAutoFill never auto-submits!)');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  return (
    <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-xl relative">
      {/* Mock Browser URL Bar */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800">
            <button
              onClick={() => { setActivePreset('greenhouse'); setCurrentStep(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'greenhouse' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Greenhouse Style
            </button>
            <button
              onClick={() => { setActivePreset('lever'); setCurrentStep(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'lever' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lever Style
            </button>
            <button
              onClick={() => { setActivePreset('workday'); setCurrentStep(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'workday' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Workday Multi-Step
            </button>
            <button
              onClick={() => { setActivePreset('raw'); setCurrentStep(1); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activePreset === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw HTML Edge Cases
            </button>
          </div>
        </div>

        {/* Browser simulated URL */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded border border-slate-800/80 text-[11px] text-slate-400 font-mono w-72 truncate">
          <Globe className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">
            {activePreset === 'greenhouse' && 'https://boards.greenhouse.io/stripe/jobs/482910'}
            {activePreset === 'lever' && 'https://jobs.lever.co/figma/frontend-infra'}
            {activePreset === 'workday' && `https://myworkdayjobs.com/enterprise/step-${currentStep}`}
            {activePreset === 'raw' && 'https://apply.techcorp.io/careers/senior-eng'}
          </span>
        </div>
      </div>

      {/* Target Form Viewport */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60" ref={formContainerRef}>
        {submittedMessage && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {submittedMessage}
            </span>
            <button
              onClick={() => setSubmittedMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Preset 1: Greenhouse Style Application */}
        {activePreset === 'greenhouse' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
            <div className="border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Senior Full Stack Engineer</h1>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Stripe</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> San Francisco, CA / Remote</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> $150k - $190k</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Section 1: Personal Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-xs font-medium text-slate-300 mb-1">
                      First Name * {renderBadge('first_name', 'first_name')}
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      autoComplete="given-name"
                      placeholder="Jane"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-xs font-medium text-slate-300 mb-1">
                      Last Name * {renderBadge('last_name', 'last_name')}
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      autoComplete="family-name"
                      placeholder="Doe"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
                      Email * {renderBadge('email', 'email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      placeholder="jane.doe@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number * {renderBadge('phone', 'phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-xs font-medium text-slate-300 mb-1">
                      Current City {renderBadge('city', 'city')}
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="San Francisco"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="block text-xs font-medium text-slate-300 mb-1">
                      ZIP {renderBadge('postal_code', 'postal_code')}
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      placeholder="94103"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Links */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Professional Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedin_profile" className="block text-xs font-medium text-slate-300 mb-1">
                      LinkedIn Profile {renderBadge('linkedin_profile', 'linkedin_profile')}
                    </label>
                    <input
                      type="url"
                      id="linkedin_profile"
                      name="linkedin_profile"
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="github_profile" className="block text-xs font-medium text-slate-300 mb-1">
                      GitHub Profile {renderBadge('github_profile', 'github_profile')}
                    </label>
                    <input
                      type="url"
                      id="github_profile"
                      name="github_profile"
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Questions & Work Authorization */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                  Work Authorization & Logistics
                </h3>

                <fieldset>
                  <legend className="text-xs font-medium text-slate-300 mb-2">
                    Are you legally authorized to work in the country of this role? * {renderBadge('authorized_yes', 'work_auth')}
                  </legend>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" id="authorized_yes" name="work_auth" value="yes" defaultChecked className="text-indigo-600 bg-slate-950 border-slate-800" />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" id="authorized_no" name="work_auth" value="no" className="text-indigo-600 bg-slate-950 border-slate-800" />
                      <span>No</span>
                    </label>
                  </div>
                </fieldset>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="notice_period" className="block text-xs font-medium text-slate-300 mb-1">
                      Notice Period / Availability {renderBadge('notice_period', 'notice_period')}
                    </label>
                    <input
                      type="text"
                      id="notice_period"
                      name="notice_period"
                      placeholder="e.g. 2 weeks"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="expected_salary" className="block text-xs font-medium text-slate-300 mb-1">
                      Desired Salary Expectation {renderBadge('expected_salary', 'expected_salary')}
                    </label>
                    <input
                      type="text"
                      id="expected_salary"
                      name="expected_salary"
                      placeholder="e.g. $160,000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Open-ended Question */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="open_question_1" className="block text-xs font-medium text-slate-300">
                      Why are you interested in joining Stripe's infrastructure team?
                    </label>
                    {renderBadge('open_question_1', 'interest_reason')}
                  </div>
                  <textarea
                    id="open_question_1"
                    name="interest_reason"
                    rows={3}
                    placeholder="Describe your motivation and alignment with our mission..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA (User Responsible as per SRS Section 4) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Manual user submission required (Reliability Rule #23)
                </span>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preset 2: Lever Style Application */}
        {activePreset === 'lever' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
            <div className="border-b border-slate-800 pb-5 mb-6">
              <h1 className="text-xl font-bold text-white tracking-tight">Staff Frontend Infrastructure Engineer</h1>
              <p className="text-xs text-slate-400 mt-1">Figma · San Francisco / Remote · Engineering</p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-5">
              <div>
                <label htmlFor="cand_name" className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name ✱ {renderBadge('cand_name', 'name')}
                </label>
                <input
                  type="text"
                  id="cand_name"
                  name="name"
                  placeholder="Full Legal Name"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cand_email" className="block text-xs font-medium text-slate-300 mb-1">
                    Email ✱ {renderBadge('cand_email', 'email')}
                  </label>
                  <input
                    type="email"
                    id="cand_email"
                    name="email"
                    placeholder="email@domain.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="cand_phone" className="block text-xs font-medium text-slate-300 mb-1">
                    Phone ✱ {renderBadge('cand_phone', 'phone')}
                  </label>
                  <input
                    type="tel"
                    id="cand_phone"
                    name="phone"
                    placeholder="Phone number"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="current_company" className="block text-xs font-medium text-slate-300 mb-1">
                    Current Company {renderBadge('current_company', 'org')}
                  </label>
                  <input
                    type="text"
                    id="current_company"
                    name="org"
                    placeholder="Employer name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="current_title" className="block text-xs font-medium text-slate-300 mb-1">
                    Current Title {renderBadge('current_title', 'title')}
                  </label>
                  <input
                    type="text"
                    id="current_title"
                    name="title"
                    placeholder="Current Job Title"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="urls_portfolio" className="block text-xs font-medium text-slate-300 mb-1">
                  Portfolio / Personal Website URL {renderBadge('urls_portfolio', 'urls[Portfolio]')}
                </label>
                <input
                  type="url"
                  id="urls_portfolio"
                  name="urls[Portfolio]"
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="comments" className="block text-xs font-medium text-slate-300 mb-1">
                  Additional Information / Cover Note
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows={4}
                  placeholder="Add any additional context or highlights..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preset 3: Workday Dynamic Multi-Step Application */}
        {activePreset === 'workday' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
            <div className="border-b border-slate-800 pb-4 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Cloud Engineer</h1>
                <p className="text-xs text-slate-400 mt-0.5">Enterprise Workday Multi-Step Portal</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Step {currentStep} of 3</span>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className={`h-1.5 rounded-full ${currentStep >= 1 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full ${currentStep >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <div className={`h-1.5 rounded-full ${currentStep >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-5">
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Step 1: Contact & Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wd_fname" className="block text-xs font-medium text-slate-300 mb-1">
                        First Name {renderBadge('wd_fname', 'fname')}
                      </label>
                      <input type="text" id="wd_fname" name="fname" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                    <div>
                      <label htmlFor="wd_lname" className="block text-xs font-medium text-slate-300 mb-1">
                        Last Name {renderBadge('wd_lname', 'lname')}
                      </label>
                      <input type="text" id="wd_lname" name="lname" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="wd_email" className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address {renderBadge('wd_email', 'email')}
                    </label>
                    <input type="email" id="wd_email" name="email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                  </div>

                  <div>
                    <label htmlFor="wd_address" className="block text-xs font-medium text-slate-300 mb-1">
                      Street Address {renderBadge('wd_address', 'address')}
                    </label>
                    <input type="text" id="wd_address" name="address" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Step 2: Experience & Education History
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wd_school" className="block text-xs font-medium text-slate-300 mb-1">
                        Institution / University {renderBadge('wd_school', 'school')}
                      </label>
                      <input type="text" id="wd_school" name="school" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                    <div>
                      <label htmlFor="wd_degree" className="block text-xs font-medium text-slate-300 mb-1">
                        Degree Level {renderBadge('wd_degree', 'degree')}
                      </label>
                      <input type="text" id="wd_degree" name="degree" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wd_employer" className="block text-xs font-medium text-slate-300 mb-1">
                        Current Employer {renderBadge('wd_employer', 'employer')}
                      </label>
                      <input type="text" id="wd_employer" name="employer" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                    <div>
                      <label htmlFor="wd_yoe" className="block text-xs font-medium text-slate-300 mb-1">
                        Total Years Experience {renderBadge('wd_yoe', 'years_experience')}
                      </label>
                      <input type="text" id="wd_yoe" name="years_experience" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Step 3: Verification & Questions
                  </h3>

                  <div>
                    <label htmlFor="wd_linkedin" className="block text-xs font-medium text-slate-300 mb-1">
                      LinkedIn URL {renderBadge('wd_linkedin', 'linkedin')}
                    </label>
                    <input type="url" id="wd_linkedin" name="linkedin" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="wd_q_challenge" className="block text-xs font-medium text-slate-300">
                        Describe a complex distributed system failure you diagnosed.
                      </label>
                      {renderBadge('wd_q_challenge', 'system_failure_story')}
                    </div>
                    <textarea
                      id="wd_q_challenge"
                      name="system_failure_story"
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Previous Step
                  </button>
                ) : <div />}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    Next Step (Tests MutationObserver)
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Finish & Submit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Preset 4: Raw HTML Edge Cases */}
        {activePreset === 'raw' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-xl font-bold text-white tracking-tight">Legacy ATS Form Normalizer Test</h1>
              <p className="text-xs text-slate-400 mt-1">
                Tests edge-case field names (e.g. "fname", "c_mail", "ctc_current", "yoe") to verify SRS FR-09 synonym resolution.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fname" className="block text-xs font-medium text-slate-300 mb-1">
                    First Name (id="fname") {renderBadge('fname', 'fname')}
                  </label>
                  <input type="text" id="fname" name="fname" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
                <div>
                  <label htmlFor="lname" className="block text-xs font-medium text-slate-300 mb-1">
                    Last Name (id="lname") {renderBadge('lname', 'lname')}
                  </label>
                  <input type="text" id="lname" name="lname" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="c_mail" className="block text-xs font-medium text-slate-300 mb-1">
                    Candidate Email (name="candidate_email") {renderBadge('c_mail', 'candidate_email')}
                  </label>
                  <input type="text" id="c_mail" name="candidate_email" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
                <div>
                  <label htmlFor="c_phone" className="block text-xs font-medium text-slate-300 mb-1">
                    Cellular Contact (name="cell") {renderBadge('c_phone', 'cell')}
                  </label>
                  <input type="text" id="c_phone" name="cell" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="yoe" className="block text-xs font-medium text-slate-300 mb-1">
                    Total YOE (name="yoe") {renderBadge('yoe', 'yoe')}
                  </label>
                  <input type="text" id="yoe" name="yoe" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
                <div>
                  <label htmlFor="ctc_current" className="block text-xs font-medium text-slate-300 mb-1">
                    Current CTC (name="current_ctc") {renderBadge('ctc_current', 'current_ctc')}
                  </label>
                  <input type="text" id="ctc_current" name="current_ctc" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Floating In-Page Extension Widget (Injected Content Script Simulation) */}
      {floatingWidgetVisible && detectedFields.length > 0 && (
        <div className="absolute bottom-6 right-6 z-30 animate-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-indigo-500/50 p-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
              A
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>JobAutoFill</span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800/40">
                  {detectedFields.length} fields found
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {fieldMatches.filter((m) => m.confidenceLevel === 'high' && m.matchedValue).length} matched confidently
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={onTriggerAutofill}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Autofill</span>
              </button>
              <button
                onClick={onOpenInspector}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Review field mappings"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
