import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Shield, RefreshCw, Zap, Eye, Settings, ExternalLink, Sparkles, ChevronRight } from 'lucide-react';
import { FieldMatch, DetectedField, UserProfile } from '../../types';

interface ExtensionPopupProps {
  detectedFields: DetectedField[];
  fieldMatches: FieldMatch[];
  profile: UserProfile;
  onAutofill: () => void;
  onReview: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  isAutofilling: boolean;
  autofillStats: { filled: number; total: number } | null;
  onRescan: () => void;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({
  detectedFields,
  fieldMatches,
  profile,
  onAutofill,
  onReview,
  onOpenProfile,
  onOpenSettings,
  isAutofilling,
  autofillStats,
  onRescan,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'fields'>('status');

  const totalFields = detectedFields.length;
  const highConfidenceMatches = fieldMatches.filter((m) => m.confidenceLevel === 'high' && m.matchedValue);
  const needReviewMatches = fieldMatches.filter((m) => (m.confidenceLevel === 'medium' || m.needsReview) && m.matchedValue);
  const unmatched = fieldMatches.filter((m) => !m.matchedValue);

  // Profile completeness check
  const requiredKeys = [
    profile.personal.firstName,
    profile.personal.lastName,
    profile.personal.email,
    profile.personal.phone,
    profile.professional.currentTitle,
    profile.professional.yearsExperience,
    profile.links.linkedinUrl,
  ];
  const filledCount = requiredKeys.filter((v) => Boolean(v && v.trim())).length;
  const isProfileComplete = filledCount === requiredKeys.length;

  return (
    <div className="w-[360px] bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-700/80 overflow-hidden flex flex-col font-sans select-none">
      {/* Chrome Extension Header Bar */}
      <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Job Autofill
              <span className="text-[10px] font-normal text-emerald-400 font-mono bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/40">
                v1.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRescan}
            title="Rescan DOM"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {/* Profile Status Banner */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isProfileComplete ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-300 font-medium">
              Profile: {isProfileComplete ? 'Complete' : 'Needs Details'}
            </span>
          </div>
          <button
            onClick={onOpenProfile}
            className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-0.5"
          >
            Edit
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Form Detection Summary (SRS Section 11) */}
        {totalFields > 0 ? (
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Application detected
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {totalFields} fields found
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded bg-slate-800/70 border border-slate-700/60">
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  {highConfidenceMatches.length}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Confident matches
                </div>
              </div>

              <div className="p-2 rounded bg-slate-800/70 border border-slate-700/60">
                <div className="text-lg font-bold text-amber-400 font-mono">
                  {needReviewMatches.length}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Need review
                </div>
              </div>
            </div>

            {autofillStats && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 rounded px-2.5 py-1.5 flex items-center justify-between">
                <span>Filled successfully:</span>
                <span className="font-mono font-semibold">
                  {autofillStats.filled} / {autofillStats.total} fields
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-800/30 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-2">
            <p>No job application inputs detected on active page.</p>
            <button
              onClick={onRescan}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Scan DOM again
            </button>
          </div>
        )}

        {/* Action Buttons as per SRS Section 11: [ Autofill ] [ Review ] */}
        <div className="space-y-2">
          <button
            onClick={onAutofill}
            disabled={totalFields === 0 || isAutofilling}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow transition-all ${
              totalFields > 0 && !isAutofilling
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer active:scale-[0.99]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutofilling ? 'animate-spin' : ''}`} />
            <span>{isAutofilling ? 'Filling Fields...' : 'Autofill Form'}</span>
          </button>

          <button
            onClick={onReview}
            disabled={totalFields === 0}
            className="w-full py-2 px-4 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Review & Correct Mappings ({fieldMatches.length})</span>
          </button>
        </div>

        {/* Safety & Legal Guarantee Notice (SRS Section 4 & 23) */}
        <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-[10px] text-slate-400 leading-relaxed">
          <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Safety policy: Never automatically submits. Does not overwrite manual inputs. User retains final review.
          </span>
        </div>
      </div>

      {/* Footer Navigation (SRS Section 11: Profile | Settings) */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="hover:text-slate-200 transition-colors"
          >
            Profile
          </button>
          <span>·</span>
          <button
            onClick={onOpenSettings}
            className="hover:text-slate-200 transition-colors"
          >
            Settings
          </button>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Local-First</span>
      </div>
    </div>
  );
};
