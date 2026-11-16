const PROFILE_KEY = 'userProfile';

function emptyProfile() {
  return {
    personal: {
      firstName: '', lastName: '', email: '', phone: '', address: '',
      city: '', state: '', country: '', postalCode: '',
    },
    professional: {
      currentTitle: '', currentCompany: '', yearsExperience: '',
      noticePeriod: '', expectedSalary: '', workAuthorization: '',
      requireSponsorship: '', willingToRelocate: '', professionalSummary: '',
    },
    links: { linkedinUrl: '', githubUrl: '', portfolioUrl: '', personalWebsite: '' },
  };
}

function readPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object) ?? '';
}

function writePath(object, path, value) {
  const parts = path.split('.');
  const key = parts.pop();
  const parent = parts.reduce((value, part) => {
    if (!value[part] || typeof value[part] !== 'object') value[part] = {};
    return value[part];
  }, object);
  parent[key] = value.trim();
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function collectProfile(form, profile) {
  const updated = { ...emptyProfile(), ...profile };
  for (const input of form.querySelectorAll('[name]')) {
    writePath(updated, input.name, input.value);
  }
  return updated;
}

function sendToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message));
      else resolve(response);
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('profile-form');
  const status = document.getElementById('status');
  const notice = document.getElementById('notice');
  const fillButton = document.getElementById('fill-button');
  let activeTab;

  const stored = await chrome.storage.local.get(PROFILE_KEY);
  const profile = { ...emptyProfile(), ...(stored[PROFILE_KEY] || {}) };
  for (const input of form.querySelectorAll('[name]')) {
    input.value = readPath(profile, input.name);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const updated = collectProfile(form, profile);
    await chrome.storage.local.set({ [PROFILE_KEY]: updated });
    Object.assign(profile, updated);
    notice.textContent = 'Profile saved on this device.';
    notice.classList.remove('warn');
    if (activeTab?.id) {
      try {
        const result = await sendToTab(activeTab.id, { action: 'GET_STATUS' });
        status.textContent = `${result.matchCount} matching field(s) found on ${new URL(activeTab.url).hostname}.`;
      } catch {
        status.textContent = 'Profile saved. Reopen this popup to scan the current page.';
      }
    }
  });

  try {
    activeTab = await getActiveTab();
    if (!activeTab?.id || !/^https?:/.test(activeTab.url || '')) {
      status.textContent = 'Open a job application page to scan its form.';
      fillButton.disabled = true;
      return;
    }
    const result = await sendToTab(activeTab.id, { action: 'GET_STATUS' });
    status.textContent = `${result.matchCount} matching field(s) found on ${new URL(activeTab.url).hostname}.`;
  } catch {
    status.textContent = 'This page cannot be scanned (Chrome internal pages are restricted).';
    fillButton.disabled = true;
  }

  fillButton.addEventListener('click', async () => {
    fillButton.disabled = true;
    notice.textContent = 'Scanning and filling…';
    try {
      if (!activeTab?.id) throw new Error('No active tab is available.');
      const updated = collectProfile(form, profile);
      await chrome.storage.local.set({ [PROFILE_KEY]: updated });
      Object.assign(profile, updated);
      const result = await sendToTab(activeTab.id, { action: 'AUTOFILL' });
      if (result?.error) throw new Error(result.error);
      notice.textContent = `Filled ${result.filled} field(s). Review the page before submitting.`;
      notice.classList.remove('warn');
    } catch (error) {
      notice.textContent = error.message || 'Could not fill this page.';
      notice.classList.add('warn');
    } finally {
      fillButton.disabled = false;
    }
  });
});
