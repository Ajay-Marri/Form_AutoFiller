import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { JobPortalSimulator } from './components/Sandbox/JobPortalSimulator';
import { ExtensionPopup } from './components/Sandbox/ExtensionPopup';
import { FieldInspectorModal } from './components/Sandbox/FieldInspectorModal';
import { ProfileHub } from './components/Profile/ProfileHub';
import { ExtensionExportModal } from './components/Export/ExtensionExportModal';

import { UserProfile, DetectedField, FieldMatch, LearnedMapping } from './types';
import { LocalStorageManager } from './engine/storage';
import { detectFormFields } from './engine/detector';
import { matchDetectedFields } from './engine/matcher';
import { executeAutofill } from './engine/autofill';
import { FormObserver } from './engine/observer';

export function App() {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'profile' | 'export'>('sandbox');
  const [activePreset, setActivePreset] = useState<'greenhouse' | 'lever' | 'workday' | 'raw'>('greenhouse');

  // Master profile & learned mappings
  const [profile, setProfile] = useState<UserProfile>(() => LocalStorageManager.getProfile());
  const [learnedMappings, setLearnedMappings] = useState<LearnedMapping[]>(() => LocalStorageManager.getLearnedMappings());
  const [settings, setSettings] = useState(() => LocalStorageManager.getSettings());

  // Form detection & matching state
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [detectedFields, setDetectedFields] = useState<DetectedField[]>([]);
  const [fieldMatches, setFieldMatches] = useState<FieldMatch[]>([]);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isAutofilling, setIsAutofilling] = useState<boolean>(false);
  const [autofillStats, setAutofillStats] = useState<{ filled: number; total: number } | null>(null);

  // Calculate profile completeness
  const computeCompleteness = useCallback((p: UserProfile): number => {
    let totalScore = 0;
    if (p.personal.firstName && p.personal.lastName) totalScore += 20;
    if (p.personal.email && p.personal.phone) totalScore += 20;
    if (p.professional.currentTitle) totalScore += 15;
    if (p.education.length > 0) totalScore += 15;
    if (p.experience.length > 0) totalScore += 15;
    if (p.skills.length > 0) totalScore += 10;
    if (p.links.linkedinUrl) totalScore += 5;
    return Math.min(totalScore, 100);
  }, []);

  const profileCompleteness = computeCompleteness(profile);

  // Rescan form elements from sandbox DOM
  const rescanForm = useCallback(() => {
    if (!formContainerRef.current) return;
    const fields = detectFormFields(formContainerRef.current);
    setDetectedFields(fields);

    const matches = matchDetectedFields(fields, profile, learnedMappings);
    setFieldMatches(matches);
  }, [profile, learnedMappings]);

  // Dynamic MutationObserver setup (FR-13, FR-14)
  useEffect(() => {
    const observer = new FormObserver(() => {
      rescanForm();
    });

    if (formContainerRef.current) {
      observer.start(formContainerRef.current);
    }

    // Initial scan
    const timer = setTimeout(() => {
      rescanForm();
    }, 150);

    return () => {
      observer.stop();
      clearTimeout(timer);
    };
  }, [activePreset, rescanForm]);

  // Autofill form action (FR-12)
  const handleTriggerAutofill = useCallback(() => {
    if (detectedFields.length === 0) return;
    setIsAutofilling(true);

    setTimeout(() => {
      const result = executeAutofill(detectedFields, fieldMatches, false);
      setAutofillStats({
        filled: result.filledCount,
        total: result.totalFields,
      });

      // Track application history
      LocalStorageManager.saveApplication({
        id: `app-${Date.now()}`,
        company: activePreset === 'greenhouse' ? 'Stripe' : activePreset === 'lever' ? 'Figma' : 'Enterprise Corp',
        jobTitle: 'Software Engineer',
        portalUrl: window.location.href,
        status: 'Draft',
        appliedDate: new Date().toISOString().split('T')[0],
        detectedFieldsCount: result.totalFields,
        autofilledCount: result.filledCount,
        notes: `Autofilled ${result.filledCount} fields reliably with JobAutoFill.`,
      });

      setIsAutofilling(false);
      rescanForm();
    }, 250);
  }, [detectedFields, fieldMatches, activePreset, rescanForm]);

  // Remap a single field and optionally save as learned rule (FR-15, FR-16)
  const handleUpdateMatch = useCallback(
    (fieldId: string, newProfileKey: string, saveAsLearnedRule: boolean) => {
      const targetField = detectedFields.find((f) => f.id === fieldId);
      if (!targetField) return;

      if (saveAsLearnedRule) {
        const identifier = targetField.name || targetField.elementId;
        if (identifier) {
          const newRule = LocalStorageManager.saveLearnedMapping({
            domain: '*',
            fieldIdentifier: identifier,
            profileKey: newProfileKey,
          });
          setLearnedMappings((prev) => [newRule, ...prev.filter((r) => r.id !== newRule.id)]);
        }
      }

      setFieldMatches((prev) =>
        prev.map((m) => {
          if (m.fieldId === fieldId) {
            return {
              ...m,
              profileKey: newProfileKey,
              confidenceScore: 99,
              confidenceLevel: 'high',
              ruleOrigin: 'learned',
              needsReview: false,
              userOverridden: true,
              status: 'approved',
            };
          }
          return m;
        })
      );
    },
    [detectedFields]
  );

  // Fill single field from inspector
  const handleFillSingle = useCallback(
    (fieldId: string) => {
      const field = detectedFields.find((f) => f.id === fieldId);
      const match = fieldMatches.find((m) => m.fieldId === fieldId);
      if (!field || !match) return;

      executeAutofill([field], [match], true);
      rescanForm();
    },
    [detectedFields, fieldMatches, rescanForm]
  );

  // Profile save
  const handleSaveProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    LocalStorageManager.saveProfile(updated);
  }, []);

  // Learned mappings handlers
  const handleAddLearnedMapping = useCallback(
    (mapping: Omit<LearnedMapping, 'id' | 'createdAt' | 'timesUsed'>) => {
      const created = LocalStorageManager.saveLearnedMapping(mapping);
      setLearnedMappings((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
    },
    []
  );

  const handleDeleteLearnedMapping = useCallback((id: string) => {
    const updated = LocalStorageManager.getLearnedMappings().filter((m) => m.id !== id);
    try {
      localStorage.setItem('job_autofill_mappings_v1', JSON.stringify(updated));
    } catch (e) {}
    setLearnedMappings(updated);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileCompleteness={profileCompleteness}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Tab 1: Extension & Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="space-y-6">
            {/* Top explanation strip */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Live Extension Sandbox:</span> Test automatic form detection, confidence scoring badges, and synthetic event autofill across realistic job portals.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={rescanForm}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
                >
                  Force Rescan DOM
                </button>
              </div>
            </div>

            {/* Split Screen Workbench: Job Portal Simulator on Left, Extension Popup on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Job Application Sandbox (8 cols) */}
              <div className="lg:col-span-8 min-h-[640px] flex flex-col">
                <JobPortalSimulator
                  formContainerRef={formContainerRef}
                  activePreset={activePreset}
                  setActivePreset={setActivePreset}
                  detectedFields={detectedFields}
                  fieldMatches={fieldMatches}
                  onTriggerAutofill={handleTriggerAutofill}
                  onOpenInspector={() => setIsInspectorOpen(true)}
                  profile={profile}
                />
              </div>

              {/* Right Column: Exact Chrome Extension Popup Replica (4 cols) */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-end space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start lg:self-center font-mono">
                  Chrome Extension Popup
                </div>

                <ExtensionPopup
                  detectedFields={detectedFields}
                  fieldMatches={fieldMatches}
                  profile={profile}
                  onAutofill={handleTriggerAutofill}
                  onReview={() => setIsInspectorOpen(true)}
                  onOpenProfile={() => setActiveTab('profile')}
                  onOpenSettings={() => setActiveTab('profile')}
                  isAutofilling={isAutofilling}
                  autofillStats={autofillStats}
                  onRescan={rescanForm}
                />

                {/* Quick Diagnostics Box */}
                <div className="w-full max-w-[360px] p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs space-y-2.5">
                  <div className="font-semibold text-slate-300 flex items-center justify-between">
                    <span>Engine Telemetry:</span>
                    <span className="font-mono text-indigo-400 text-[11px]">SRS v1.0 Compliant</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span>Detected inputs:</span>
                      <span className="text-white">{detectedFields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confident (≥90%):</span>
                      <span className="text-emerald-400">
                        {fieldMatches.filter((m) => m.confidenceLevel === 'high' && m.matchedValue).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requires review:</span>
                      <span className="text-amber-400">
                        {fieldMatches.filter((m) => (m.confidenceLevel === 'medium' || m.needsReview) && m.matchedValue).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Learned rules applied:</span>
                      <span className="text-indigo-400">
                        {fieldMatches.filter((m) => m.ruleOrigin === 'learned').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile Data Hub */}
        {activeTab === 'profile' && (
          <ProfileHub
            profile={profile}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {/* Tab 3: Extension Export & Setup */}
        {activeTab === 'export' && <ExtensionExportModal profile={profile} />}
      </main>

      {/* Field Inspector & Review Modal */}
      <FieldInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        detectedFields={detectedFields}
        fieldMatches={fieldMatches}
        profile={profile}
        onUpdateMatch={handleUpdateMatch}
        onFillSingle={handleFillSingle}
      />
    </div>
  );
}

export default App;
