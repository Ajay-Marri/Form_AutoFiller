import React, { useState } from 'react';
import { X, Check, Edit2, AlertCircle, Filter, BookmarkPlus } from 'lucide-react';
import { DetectedField, FieldMatch, UserProfile } from '../../types';
import { SYNONYM_RULES } from '../../engine/synonyms';
import { getProfileValue } from '../../engine/matcher';

interface FieldInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedFields: DetectedField[];
  fieldMatches: FieldMatch[];
  profile: UserProfile;
  onUpdateMatch: (fieldId: string, newProfileKey: string, saveAsLearnedRule: boolean) => void;
  onFillSingle: (fieldId: string) => void;
}

export const FieldInspectorModal: React.FC<FieldInspectorModalProps> = ({
  isOpen,
  onClose,
  detectedFields,
  fieldMatches,
  profile,
  onUpdateMatch,
  onFillSingle,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'review' | 'unmatched'>('all');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [rememberMapping, setRememberMapping] = useState<boolean>(true);

  if (!isOpen) return null;

  const fieldMap = new Map<string, DetectedField>();
  detectedFields.forEach((f) => fieldMap.set(f.id, f));

  const filteredMatches = fieldMatches.filter((match) => {
    if (filter === 'high') return match.confidenceLevel === 'high' && match.matchedValue;
    if (filter === 'review') return (match.confidenceLevel === 'medium' || match.needsReview) && match.matchedValue;
    if (filter === 'unmatched') return !match.matchedValue;
    return true;
  });

  const handleStartEdit = (match: FieldMatch) => {
    setEditingFieldId(match.fieldId);
    setSelectedKey(match.profileKey || 'personal.firstName');
    setRememberMapping(true);
  };

  const handleSaveEdit = (fieldId: string) => {
    onUpdateMatch(fieldId, selectedKey, rememberMapping);
    setEditingFieldId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Field Mappings & Review Inspector</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                ({fieldMatches.length} detected fields)
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify detected input targets, adjust mappings, and save learned rules for automatic future filling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({fieldMatches.length})
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'high' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              High Confidence (≥90%)
            </button>
            <button
              onClick={() => setFilter('review')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'review' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Requires Review (70–89%)
            </button>
            <button
              onClick={() => setFilter('unmatched')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'unmatched' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unmatched
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredMatches.length} fields
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-y-auto p-6 space-y-3 flex-1">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No fields found matching this filter criteria.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const field = fieldMap.get(match.fieldId);
              if (!field) return null;

              const isEditing = editingFieldId === match.fieldId;

              return (
                <div
                  key={match.fieldId}
                  className={`p-4 rounded-lg border transition-all ${
                    match.confidenceLevel === 'high'
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : match.confidenceLevel === 'medium'
                      ? 'bg-amber-950/20 border-amber-900/40 hover:border-amber-800/60'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* DOM Field Metadata */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">
                          {field.labelText || field.placeholder || field.name || field.elementId || 'Unnamed Field'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {field.tagName}:{field.type}
                        </span>
                        {field.autocomplete && (
                          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/40">
                            autocomplete="{field.autocomplete}"
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                        {field.name && <span>name="{field.name}"</span>}
                        {field.elementId && <span>id="{field.elementId}"</span>}
                        {field.selector && <span className="text-slate-400 truncate max-w-xs">{field.selector}</span>}
                      </div>
                    </div>

                    {/* Matched Profile Mapping & Confidence */}
                    <div className="flex items-center gap-4">
                      {/* Confidence Score */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className={`text-xs font-mono font-bold ${
                              match.confidenceLevel === 'high'
                                ? 'text-emerald-400'
                                : match.confidenceLevel === 'medium'
                                ? 'text-amber-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {match.confidenceScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                            {match.ruleOrigin}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {match.confidenceLevel === 'high'
                            ? 'Approved'
                            : match.confidenceLevel === 'medium'
                            ? 'Review needed'
                            : 'No match'}
                        </div>
                      </div>

                      {/* Remap button */}
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(match)}
                          className="px-2.5 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Remap</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Value Preview or Editor */}
                  {isEditing ? (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 bg-slate-950/70 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-slate-200">
                        Select Profile Field to Map:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={selectedKey}
                          onChange={(e) => setSelectedKey(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          {SYNONYM_RULES.map((rule) => (
                            <option key={rule.profileKey} value={rule.profileKey}>
                              [{rule.category.toUpperCase()}] {rule.label}
                            </option>
                          ))}
                        </select>

                        <div className="text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 font-mono truncate flex items-center">
                          Value: "{getProfileValue(profile, selectedKey) || '(Empty)'}"
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMapping}
                            onChange={(e) => setRememberMapping(e.target.checked)}
                            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                          />
                          <span className="flex items-center gap-1">
                            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                            Learn this mapping for future applications on this domain
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(match.fieldId)}
                            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Save Mapping
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs flex items-center justify-between text-slate-400 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-800/60">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-300 font-medium font-mono text-[11px]">
                          {match.profileKey || 'None'}
                        </span>
                        <span>→</span>
                        <span className="text-slate-200 truncate">
                          "{match.matchedValue || '(Empty profile value)'}"
                        </span>
                      </div>
                      <button
                        onClick={() => onFillSingle(match.fieldId)}
                        disabled={!match.matchedValue}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium shrink-0 ml-2 disabled:text-slate-600"
                      >
                        Fill this field
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Field mappings are stored locally and will apply to matching forms.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
