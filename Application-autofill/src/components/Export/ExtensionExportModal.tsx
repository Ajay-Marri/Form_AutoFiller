import React, { useState } from 'react';
import { Download, CheckCircle2, Folder, Chrome, ShieldCheck, Zap, HelpCircle, FileCheck } from 'lucide-react';
import JSZip from 'jszip';
import { UserProfile } from '../../types';

interface ExtensionExportModalProps {
  profile: UserProfile;
}

export const ExtensionExportModal: React.FC<ExtensionExportModalProps> = ({ profile }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Helper to generate extension icon as base64 PNG
  const generateIconDataUrl = (size: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Rounded background
      const radius = size * 0.22;
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();

      // Inner letter A or lightning bolt
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', size / 2, size / 2 + size * 0.04);
    }
    return canvas.toDataURL('image/png').split(',')[1];
  };

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();

      // 1. manifest.json
      const manifest = {
        manifest_version: 3,
        name: 'JobAutoFill - Smart Job Application Autofill',
        version: '1.0.0',
        description: 'Autofill job application forms on Greenhouse, Lever, Workday, Ashby, Taleo, LinkedIn, and any job portal.',
        permissions: ['storage', 'activeTab', 'scripting'],
        host_permissions: ['<all_urls>'],
        action: {
          default_popup: 'popup.html',
          default_title: 'JobAutoFill',
          default_icon: {
            '16': 'icons/icon16.png',
            '48': 'icons/icon48.png',
            '128': 'icons/icon128.png',
          },
        },
        background: {
          service_worker: 'service-worker.js',
        },
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['content.js'],
            run_at: 'document_idle',
          },
        ],
        options_ui: {
          page: 'options.html',
          open_in_tab: true,
        },
        icons: {
          '16': 'icons/icon16.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png',
        },
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // 2. profile.json (User's real verified profile)
      zip.file('profile.json', JSON.stringify(profile, null, 2));

      // 3. service-worker.js
      const serviceWorker = `// JobAutoFill Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[JobAutoFill] Extension installed.');
  try {
    const existing = await chrome.storage.local.get(['userProfile']);
    if (!existing.userProfile) {
      const res = await fetch(chrome.runtime.getURL('profile.json'));
      const defaultProfile = await res.json();
      await chrome.storage.local.set({ userProfile: defaultProfile });
      console.log('[JobAutoFill] Profile successfully initialized from package.');
    }
  } catch (err) {
    console.warn('[JobAutoFill] Could not preload profile.json', err);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FIELDS_DETECTED' && sender.tab?.id) {
    const count = message.count || 0;
    if (count > 0) {
      chrome.action.setBadgeText({ tabId: sender.tab.id, text: String(count) });
      chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: '#4f46e5' });
    } else {
      chrome.action.setBadgeText({ tabId: sender.tab.id, text: '' });
    }
    sendResponse({ ok: true });
  }
  return true;
});`;
      zip.file('service-worker.js', serviceWorker);

      // 4. content.js (Production autofill engine & in-page floating widget)
      const contentScript = `// JobAutoFill Content Script - Production Engine
(function() {
  if (window.__JOB_AUTOFILL_LOADED__) return;
  window.__JOB_AUTOFILL_LOADED__ = true;

  console.log('[JobAutoFill] Content script active on:', window.location.hostname);

  let cachedProfile = null;

  async function loadProfile() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userProfile'], (result) => {
        if (result && result.userProfile) {
          cachedProfile = result.userProfile;
          resolve(result.userProfile);
        } else {
          // Fallback to bundled profile
          fetch(chrome.runtime.getURL('profile.json'))
            .then(r => r.json())
            .then(p => {
              cachedProfile = p;
              resolve(p);
            })
            .catch(() => resolve(null));
        }
      });
    });
  }

  // Common synonym mappings
  const SYNONYMS = [
    { key: 'personal.firstName', synonyms: ['first name', 'firstname', 'fname', 'given name', 'candidate first name', 'forename'] },
    { key: 'personal.middleName', synonyms: ['middle name', 'middlename', 'mname', 'middle initial'] },
    { key: 'personal.lastName', synonyms: ['last name', 'lastname', 'lname', 'surname', 'family name', 'candidate last name'] },
    { key: 'personal.preferredName', synonyms: ['preferred name', 'nickname', 'chosen name'] },
    { key: 'personal.email', synonyms: ['email', 'email address', 'e-mail', 'contact email', 'candidate email'] },
    { key: 'personal.phone', synonyms: ['phone', 'phone number', 'mobile', 'cell', 'telephone', 'contact number', 'mobile phone'] },
    { key: 'personal.address', synonyms: ['street address', 'address', 'address line 1', 'street', 'residential address'] },
    { key: 'personal.city', synonyms: ['city', 'town', 'municipality', 'current city'] },
    { key: 'personal.state', synonyms: ['state', 'province', 'state/province', 'region'] },
    { key: 'personal.country', synonyms: ['country', 'nation', 'residence country'] },
    { key: 'personal.postalCode', synonyms: ['postal code', 'zip code', 'zipcode', 'postcode', 'pin code'] },
    { key: 'links.linkedinUrl', synonyms: ['linkedin', 'linkedin profile', 'linkedin url', 'linkedin link'] },
    { key: 'links.githubUrl', synonyms: ['github', 'github profile', 'github url', 'github link'] },
    { key: 'links.portfolioUrl', synonyms: ['portfolio', 'portfolio url', 'portfolio website', 'personal website', 'website'] },
    { key: 'professional.currentTitle', synonyms: ['current title', 'current job title', 'job title', 'current role', 'present role'] },
    { key: 'professional.currentCompany', synonyms: ['current company', 'current employer', 'present company', 'company'] },
    { key: 'professional.yearsExperience', synonyms: ['years of experience', 'total experience', 'years experience', 'relevant experience', 'yoe'] },
    { key: 'professional.expectedSalary', synonyms: ['expected salary', 'desired compensation', 'target compensation', 'expected compensation', 'desired salary', 'salary expectation'] },
    { key: 'professional.currentSalary', synonyms: ['current salary', 'current compensation'] },
    { key: 'professional.noticePeriod', synonyms: ['notice period', 'earliest start date', 'availability', 'start date', 'when can you start'] },
    { key: 'professional.professionalSummary', synonyms: ['summary', 'professional summary', 'cover letter', 'about you', 'bio', 'additional info', 'additional information', 'comments'] },
    { key: 'professional.workAuthorization', synonyms: ['authorized to work', 'work authorization', 'legally authorized', 'eligible to work', 'us work authorization'] },
    { key: 'professional.requireSponsorship', synonyms: ['require sponsorship', 'need sponsorship', 'visa sponsorship', 'will you now or in the future require sponsorship'] }
  ];

  function getElementLabel(el) {
    let text = '';
    // 1. Explicit label
    if (el.id) {
      const label = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (label) text += ' ' + label.innerText;
    }
    // 2. Parent label
    const parentLabel = el.closest('label');
    if (parentLabel) text += ' ' + parentLabel.innerText;
    // 3. Preceding sibling
    if (el.previousElementSibling && /label|span|p|div/i.test(el.previousElementSibling.tagName)) {
      text += ' ' + el.previousElementSibling.innerText;
    }
    // 4. Attributes
    text += ' ' + (el.getAttribute('aria-label') || '');
    text += ' ' + (el.getAttribute('placeholder') || '');
    text += ' ' + (el.getAttribute('name') || '');
    text += ' ' + (el.getAttribute('id') || '');
    text += ' ' + (el.getAttribute('autocomplete') || '');
    return text.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').replace(/\\s+/g, ' ').trim();
  }

  function resolveProfileValue(profile, key) {
    if (!profile) return '';
    const parts = key.split('.');
    let curr = profile;
    for (const p of parts) {
      if (!curr) return '';
      curr = curr[p];
    }
    return typeof curr === 'string' ? curr : '';
  }

  function findBestMatch(fieldDescriptor, profile) {
    if (!profile) return null;
    const text = fieldDescriptor.text;

    // 1. Match custom questions first (if any)
    if (profile.otherQuestions && Array.isArray(profile.otherQuestions)) {
      for (const qna of profile.otherQuestions) {
        if (!qna.question || !qna.answer) continue;
        const qWords = qna.question.toLowerCase().split(/\\W+/).filter(w => w.length > 3);
        const matchCount = qWords.filter(w => text.includes(w)).length;
        if (qWords.length > 0 && matchCount / qWords.length >= 0.5) {
          return { key: 'other.' + qna.id, value: qna.answer, label: qna.question, score: 95 };
        }
      }
    }

    // 2. Match standard synonym dictionary
    let best = null;
    let highestScore = 0;

    for (const rule of SYNONYMS) {
      for (const syn of rule.synonyms) {
        if (text.includes(syn)) {
          const score = syn.length > 8 ? 95 : 85;
          if (score > highestScore) {
            highestScore = score;
            best = {
              key: rule.key,
              value: resolveProfileValue(profile, rule.key),
              label: rule.synonyms[0],
              score
            };
          }
        }
      }
    }

    // Fallbacks
    if (!best && profile.skills && text.includes('skill')) {
      const skillList = profile.skills.map(s => s.name).join(', ');
      return { key: 'skills', value: skillList, label: 'Skills', score: 80 };
    }

    return best && best.value ? best : null;
  }

  function scanFields(profile) {
    const selector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]), textarea, select';
    const elements = Array.from(document.querySelectorAll(selector));
    const results = [];

    elements.forEach((el, index) => {
      // Ignore hidden or zero-dimension elements
      if (el.offsetParent === null && el.type !== 'radio' && el.type !== 'checkbox') return;

      const descriptor = {
        index,
        element: el,
        tagName: el.tagName.toLowerCase(),
        type: (el.getAttribute('type') || el.tagName).toLowerCase(),
        id: el.id || '',
        name: el.name || '',
        text: getElementLabel(el),
      };

      const match = findBestMatch(descriptor, profile);
      results.push({ descriptor, match });
    });

    return results;
  }

  function setNativeValue(el, val) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, 'value');
    if (desc && desc.set) {
      desc.set.call(el, val);
    } else {
      el.value = val;
    }
    el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
  }

  function autofillAll(profile) {
    const scanned = scanFields(profile);
    let filledCount = 0;

    scanned.forEach(({ descriptor, match }) => {
      if (!match || !match.value) return;
      const el = descriptor.element;

      try {
        if (descriptor.tagName === 'select') {
          const select = el;
          const target = match.value.toLowerCase().trim();
          let optionFound = false;

          for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            const optText = opt.text.toLowerCase().trim();
            const optVal = opt.value.toLowerCase().trim();
            if (optText.includes(target) || optVal.includes(target) || target.includes(optText)) {
              select.selectedIndex = i;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              optionFound = true;
              filledCount++;
              break;
            }
          }
          if (!optionFound && select.options.length > 1) {
            // Check boolean questions like Yes/No
            if (target === 'yes' || target.includes('authorized')) {
              for (let i = 0; i < select.options.length; i++) {
                if (/yes|authorized|eligible/i.test(select.options[i].text)) {
                  select.selectedIndex = i;
                  select.dispatchEvent(new Event('change', { bubbles: true }));
                  filledCount++;
                  break;
                }
              }
            }
          }
        } else if (descriptor.type === 'radio' || descriptor.type === 'checkbox') {
          const target = match.value.toLowerCase();
          const label = descriptor.text;
          if (target === 'yes' && /yes/i.test(label)) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          } else if (target === 'no' && /no/i.test(label)) {
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        } else {
          setNativeValue(el, match.value);
          // Visual highlight
          el.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
          el.style.borderColor = '#10b981';
          el.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
          setTimeout(() => {
            el.style.borderColor = '';
            el.style.boxShadow = '';
          }, 3500);
          filledCount++;
        }
      } catch (err) {
        console.warn('[JobAutoFill] Error filling field', el, err);
      }
    });

    return filledCount;
  }

  // Floating helper badge on the page
  function injectFloatingWidget(count, profile) {
    if (document.getElementById('jobautofill-floating-pill')) return;
    if (count <= 1) return;

    const pill = document.createElement('div');
    pill.id = 'jobautofill-floating-pill';
    pill.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:#1e1b4b;border:1px solid #6366f1;border-radius:30px;padding:8px 14px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;font-family:system-ui,-apple-system,sans-serif;color:#ffffff;font-size:12px;user-select:none;transition:transform 0.2s;';
    
    pill.innerHTML = \`
      <div style="width:20px;height:20px;border-radius:50%;background:#4f46e5;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;">A</div>
      <span style="font-weight:600;">\${count} fields detected</span>
      <button id="jobautofill-pill-btn" style="background:#4f46e5;hover:#4338ca;color:#fff;border:none;border-radius:14px;padding:5px 12px;font-weight:600;font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px;">
        ✨ Autofill
      </button>
      <span id="jobautofill-pill-close" style="cursor:pointer;color:#94a3b8;font-size:14px;padding:0 2px;">✕</span>
    \`;

    document.body.appendChild(pill);

    document.getElementById('jobautofill-pill-btn')?.addEventListener('click', () => {
      const filled = autofillAll(profile);
      const span = pill.querySelector('span');
      if (span) span.innerText = \`✅ Filled \${filled} fields!\`;
      setTimeout(() => pill.remove(), 4000);
    });

    document.getElementById('jobautofill-pill-close')?.addEventListener('click', () => {
      pill.remove();
    });
  }

  // Initialize
  async function init() {
    const profile = await loadProfile();
    if (!profile) return;

    const fields = scanFields(profile);
    const matchedCount = fields.filter(f => f.match).length;

    // Report to background
    chrome.runtime.sendMessage({
      type: 'FIELDS_DETECTED',
      count: matchedCount
    }).catch(() => {});

    // Inject pill if fields found
    if (matchedCount > 0) {
      injectFloatingWidget(matchedCount, profile);
    }
  }

  // Listen for popup messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'GET_STATUS') {
      loadProfile().then(profile => {
        const scanned = scanFields(profile);
        const matches = scanned.filter(s => s.match).map(s => ({
          label: s.match.label,
          key: s.match.key,
          value: s.match.value
        }));
        sendResponse({
          totalDetected: scanned.length,
          matchCount: matches.length,
          matches: matches.slice(0, 8),
          profileName: profile ? (profile.personal.firstName + ' ' + profile.personal.lastName) : 'Profile Loaded'
        });
      });
      return true;
    }

    if (request.action === 'AUTOFILL') {
      loadProfile().then(profile => {
        const filled = autofillAll(profile);
        sendResponse({ success: true, filled });
      });
      return true;
    }

    return true;
  });

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }
})();`;
      zip.file('content.js', contentScript);

      // 5. popup.html (Modern extension popup)
      const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JobAutoFill</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { width: 330px; background: #090d16; color: #f8fafc; padding: 16px; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 14px; }
    .brand { display: flex; align-items: center; gap: 8px; }
    .logo { width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #3b82f6); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px; }
    .title { font-size: 14px; font-weight: 700; color: white; }
    .badge { font-size: 10px; background: #1e1b4b; color: #a5b4fc; padding: 2px 6px; border-radius: 4px; border: 1px solid #3730a3; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
    .stat-row { display: flex; align-items: center; justify-content: space-between; }
    .stat-num { font-size: 24px; font-weight: 800; color: #10b981; }
    .stat-label { font-size: 11px; color: #94a3b8; }
    .btn-primary { width: 100%; background: #4f46e5; hover: #4338ca; color: white; border: none; padding: 11px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { width: 100%; background: transparent; border: 1px solid #334155; color: #cbd5e1; padding: 8px; border-radius: 8px; font-weight: 500; font-size: 12px; cursor: pointer; margin-top: 8px; }
    .btn-secondary:hover { background: #1e293b; color: white; }
    .preview-box { margin-top: 10px; max-height: 120px; overflow-y: auto; font-size: 11px; border-top: 1px solid #1e293b; padding-top: 8px; }
    .preview-item { display: flex; justify-content: space-between; padding: 3px 0; color: #cbd5e1; }
    .preview-val { color: #818cf8; font-family: monospace; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .toast { display: none; margin-top: 8px; padding: 8px; background: #064e3b; border: 1px solid #059669; border-radius: 6px; color: #6ee7b7; font-size: 11px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="logo">A</div>
      <div class="title">JobAutoFill</div>
    </div>
    <div class="badge" id="profileBadge">Profile Active</div>
  </div>

  <div class="card">
    <div class="stat-row">
      <div>
        <div class="stat-num" id="matchCount">...</div>
        <div class="stat-label">Fields ready to autofill</div>
      </div>
      <div style="text-align: right;">
        <span id="siteDomain" style="font-size: 11px; color: #64748b; font-family: monospace;">detecting...</span>
      </div>
    </div>

    <div class="preview-box" id="previewBox" style="display: none;">
      <div style="font-size: 10px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Matched Field Preview:</div>
      <div id="previewList"></div>
    </div>
  </div>

  <button class="btn-primary" id="autofillBtn">
    <span>✨ Autofill This Application</span>
  </button>
  
  <button class="btn-secondary" id="optionsBtn">
    ⚙️ Edit Profile & Custom Q&A
  </button>

  <div class="toast" id="toastMsg"></div>

  <script src="popup.js"></script>
</body>
</html>`;
      zip.file('popup.html', popupHtml);

      // 6. popup.js
      const popupJs = `document.addEventListener('DOMContentLoaded', async () => {
  const autofillBtn = document.getElementById('autofillBtn');
  const optionsBtn = document.getElementById('optionsBtn');
  const matchCount = document.getElementById('matchCount');
  const siteDomain = document.getElementById('siteDomain');
  const previewBox = document.getElementById('previewBox');
  const previewList = document.getElementById('previewList');
  const toastMsg = document.getElementById('toastMsg');
  const profileBadge = document.getElementById('profileBadge');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      siteDomain.innerText = url.hostname.replace('www.', '');
    } catch (e) {}
  }

  // Request status from content script
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'GET_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        matchCount.innerText = '0';
        siteDomain.innerText = 'No job form active';
        return;
      }
      matchCount.innerText = res.matchCount || '0';
      if (res.profileName) profileBadge.innerText = res.profileName.split(' ')[0];

      if (res.matches && res.matches.length > 0) {
        previewBox.style.display = 'block';
        previewList.innerHTML = res.matches.map(m => \`
          <div class="preview-item">
            <span>\${m.label}</span>
            <span class="preview-val">\${m.value}</span>
          </div>
        \`).join('');
      }
    });
  }

  autofillBtn.addEventListener('click', async () => {
    if (!tab || !tab.id) return;
    autofillBtn.disabled = true;
    autofillBtn.innerText = 'Filling application...';

    chrome.tabs.sendMessage(tab.id, { action: 'AUTOFILL' }, (res) => {
      autofillBtn.disabled = false;
      autofillBtn.innerText = '✨ Autofill This Application';

      if (res && res.success) {
        toastMsg.style.display = 'block';
        toastMsg.innerText = \`✅ Successfully autofilled \${res.filled} fields!\`;
        matchCount.innerText = '0';
        setTimeout(() => window.close(), 1800);
      } else {
        toastMsg.style.display = 'block';
        toastMsg.style.background = '#7f1d1d';
        toastMsg.innerText = 'No compatible input fields found.';
      }
    });
  });

  optionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
});`;
      zip.file('popup.js', popupJs);

      // 7. options.html (In-browser extension settings & profile editor)
      const optionsHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JobAutoFill - Extension Settings</title>
  <style>
    body { background: #090d16; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 20px; margin-bottom: 8px; }
    p { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    h2 { font-size: 14px; color: #818cf8; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 4px; }
    input, textarea { width: 100%; box-sizing: border-box; background: #020617; border: 1px solid #334155; border-radius: 6px; padding: 8px 12px; color: white; font-size: 12px; }
    input:focus, textarea:focus { outline: none; border-color: #6366f1; }
    .btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .btn:hover { background: #4338ca; }
    .status { color: #10b981; font-size: 12px; margin-left: 12px; display: none; }
  </style>
</head>
<body>
  <h1>JobAutoFill Chrome Extension Settings</h1>
  <p>Manage your verified profile and answers. All credentials remain 100% private in local browser storage.</p>

  <form id="profileForm">
    <div class="card">
      <h2>Personal Information</h2>
      <div class="grid">
        <div>
          <label>First Name</label>
          <input type="text" id="firstName">
        </div>
        <div>
          <label>Last Name</label>
          <input type="text" id="lastName">
        </div>
        <div>
          <label>Email</label>
          <input type="email" id="email">
        </div>
        <div>
          <label>Phone Number</label>
          <input type="text" id="phone">
        </div>
        <div>
          <label>City, State</label>
          <input type="text" id="location">
        </div>
        <div>
          <label>LinkedIn URL</label>
          <input type="url" id="linkedin">
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Professional Information</h2>
      <div class="grid">
        <div>
          <label>Current Title</label>
          <input type="text" id="currentTitle">
        </div>
        <div>
          <label>Years Experience</label>
          <input type="text" id="yearsExperience">
        </div>
        <div>
          <label>Notice Period</label>
          <input type="text" id="noticePeriod">
        </div>
        <div>
          <label>Expected Salary</label>
          <input type="text" id="expectedSalary">
        </div>
      </div>
      <div style="margin-top: 14px;">
        <label>Professional Summary</label>
        <textarea id="professionalSummary" rows="3"></textarea>
      </div>
    </div>

    <div style="display: flex; align-items: center;">
      <button type="submit" class="btn">Save Changes</button>
      <span class="status" id="saveStatus">✓ Settings saved in Chrome storage!</span>
    </div>
  </form>

  <script src="options.js"></script>
</body>
</html>`;
      zip.file('options.html', optionsHtml);

      // 8. options.js
      const optionsJs = `document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profileForm');
  const status = document.getElementById('saveStatus');

  chrome.storage.local.get(['userProfile'], (result) => {
    const p = result.userProfile || {};
    const personal = p.personal || {};
    const prof = p.professional || {};
    const links = p.links || {};

    document.getElementById('firstName').value = personal.firstName || '';
    document.getElementById('lastName').value = personal.lastName || '';
    document.getElementById('email').value = personal.email || '';
    document.getElementById('phone').value = personal.phone || '';
    document.getElementById('location').value = (personal.city ? personal.city + ', ' + (personal.state || '') : '');
    document.getElementById('linkedin').value = links.linkedinUrl || '';

    document.getElementById('currentTitle').value = prof.currentTitle || '';
    document.getElementById('yearsExperience').value = prof.yearsExperience || '';
    document.getElementById('noticePeriod').value = prof.noticePeriod || '';
    document.getElementById('expectedSalary').value = prof.expectedSalary || '';
    document.getElementById('professionalSummary').value = prof.professionalSummary || '';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    chrome.storage.local.get(['userProfile'], (result) => {
      const p = result.userProfile || {};
      p.personal = p.personal || {};
      p.professional = p.professional || {};
      p.links = p.links || {};

      p.personal.firstName = document.getElementById('firstName').value;
      p.personal.lastName = document.getElementById('lastName').value;
      p.personal.email = document.getElementById('email').value;
      p.personal.phone = document.getElementById('phone').value;
      p.links.linkedinUrl = document.getElementById('linkedin').value;

      p.professional.currentTitle = document.getElementById('currentTitle').value;
      p.professional.yearsExperience = document.getElementById('yearsExperience').value;
      p.professional.noticePeriod = document.getElementById('noticePeriod').value;
      p.professional.expectedSalary = document.getElementById('expectedSalary').value;
      p.professional.professionalSummary = document.getElementById('professionalSummary').value;

      chrome.storage.local.set({ userProfile: p }, () => {
        status.style.display = 'inline';
        setTimeout(() => status.style.display = 'none', 3000);
      });
    });
  });
});`;
      zip.file('options.js', optionsJs);

      // 9. Icons
      const iconsFolder = zip.folder('icons');
      if (iconsFolder) {
        iconsFolder.file('icon16.png', generateIconDataUrl(16), { base64: true });
        iconsFolder.file('icon48.png', generateIconDataUrl(48), { base64: true });
        iconsFolder.file('icon128.png', generateIconDataUrl(128), { base64: true });
      }

      // 10. README.md
      const readme = `# JobAutoFill Chrome Extension (Manifest V3)

A real, standalone, local-first Chromium extension for 1-click job application autofill.

## Supported Job Portals
- **Greenhouse** (\`boards.greenhouse.io\`)
- **Lever** (\`jobs.lever.co\`)
- **Workday** (\`myworkdayjobs.com\`)
- **Ashby** (\`jobs.ashbyhq.com\`)
- **BambooHR** (\`bamboohr.com\`)
- **Taleo / Oracle Cloud**
- **LinkedIn Easy Apply & External applications**
- **Indeed & any custom career page**

## Installation Steps (Takes 30 seconds)
1. Download and extract this \`jobautofill-chrome-extension.zip\` into any folder on your computer.
2. In Google Chrome (or Brave, Edge, Arc), go to \`chrome://extensions/\`.
3. In the top-right corner, toggle **Developer mode** to ON.
4. In the top-left toolbar, click **Load unpacked**.
5. Select this extracted directory.
6. Done! Click the puzzle icon in Chrome to **pin JobAutoFill** to your toolbar.

## How to Autofill a Job Form
1. Open any job opening (e.g. Stripe on Greenhouse, Figma on Lever, Workday, etc.).
2. The extension automatically detects input fields and shows a counter badge in your browser.
3. Click the extension icon in your browser toolbar or the discrete on-page button:
   - Click **"✨ Autofill Application"**.
4. All matched personal data, experience, education, links, and custom Q&A answers are populated via synthetic DOM event dispatchers.
5. Review the inputs and submit manually.
`;
      zip.file('README.md', readme);

      // Generate blob & trigger download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jobautofill-chrome-extension-${profile.personal.firstName.toLowerCase() || 'user'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 6000);
    } catch (err) {
      console.error('Failed generating zip package', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Chrome className="w-5 h-5 text-indigo-400" />
          <span>Real Chrome Extension (Manifest V3)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Export your verified profile into a standalone Chromium extension ready to load into Google Chrome, Brave, Edge, or Arc.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Folder className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Production Extension Package (.ZIP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-configured with <span className="text-indigo-400 font-medium">{profile.personal.firstName} {profile.personal.lastName}</span>'s verified data, {profile.otherQuestions?.length || 0} custom Q&As, and synthetic event autofill engine.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
            <span>{isGenerating ? 'Generating Extension...' : 'Download Extension (.zip)'}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Extension downloaded! Extract the zip and click "Load unpacked" in chrome://extensions to use it on real job applications.</span>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">100% Local-First & Private</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Zero telemetry, zero servers. Your personal information, resume text, and answers never leave your browser.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Synthetic React/Vue Dispatch</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Triggers native prototype property setters and bubbling input/change events so single-page apps accept values.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white">Custom "Other" Q&A Matching</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fuzzy-matches employer open-ended questions against your saved tailored answers in the "Other" hub.
            </p>
          </div>
        </div>

        {/* Step-by-Step Installation Instructions */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>How to Load into Chrome / Brave / Edge (3 Steps):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">
                1
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Unzip Folder</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Extract the downloaded zip file into any folder on your computer.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">
                2
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Enable Developer Mode</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Open <code className="text-indigo-400 bg-slate-900 px-1 py-0.5 rounded">chrome://extensions</code> and turn on <b>Developer mode</b> in the top-right.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">
                3
              </div>
              <h4 className="text-xs font-semibold text-slate-200">Click "Load Unpacked"</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Click <b>Load unpacked</b> and select the extracted folder. Pin JobAutoFill to your browser toolbar!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
