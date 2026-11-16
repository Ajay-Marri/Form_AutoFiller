(() => {
  if (globalThis.__JOB_AUTOFILL_CONTENT__) return;
  globalThis.__JOB_AUTOFILL_CONTENT__ = true;

  const RULES = [
    ['personal.firstName', ['first name', 'given name', 'forename', 'fname']],
    ['personal.lastName', ['last name', 'family name', 'surname', 'lname']],
    ['personal.email', ['email address', 'email', 'e mail']],
    ['personal.phone', ['phone number', 'mobile number', 'telephone', 'phone', 'mobile']],
    ['personal.address', ['street address', 'address line 1', 'address']],
    ['personal.city', ['city', 'town', 'municipality']],
    ['personal.state', ['state province', 'province', 'state', 'region']],
    ['personal.country', ['country', 'nation']],
    ['personal.postalCode', ['postal code', 'zip code', 'postcode', 'zip']],
    ['professional.currentTitle', ['current job title', 'job title', 'current title', 'current role']],
    ['professional.currentCompany', ['current company', 'current employer', 'company name']],
    ['professional.yearsExperience', ['years of experience', 'years experience', 'total experience']],
    ['professional.noticePeriod', ['notice period', 'earliest start date', 'availability']],
    ['professional.expectedSalary', ['expected salary', 'salary expectation', 'desired salary', 'expected compensation']],
    ['professional.workAuthorization', ['work authorization', 'authorized to work', 'legally authorized', 'eligible to work']],
    ['professional.requireSponsorship', ['visa sponsorship', 'require sponsorship', 'need sponsorship']],
    ['professional.willingToRelocate', ['willing to relocate', 'open to relocation', 'relocation']],
    ['professional.professionalSummary', ['professional summary', 'cover letter', 'about yourself', 'summary']],
    ['links.linkedinUrl', ['linkedin']],
    ['links.githubUrl', ['github']],
    ['links.portfolioUrl', ['portfolio']],
    ['links.personalWebsite', ['personal website', 'website', 'homepage']],
  ];

  function normalize(value) {
    return (value || '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  }

  function labelFor(element) {
    const pieces = [];
    if (element.id) {
      const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (label) pieces.push(label.innerText);
    }
    const parentLabel = element.closest('label');
    if (parentLabel) pieces.push(parentLabel.innerText);
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      for (const id of labelledBy.split(/\s+/)) {
        const label = document.getElementById(id);
        if (label) pieces.push(label.innerText);
      }
    }
    const fieldset = element.closest('fieldset');
    const legend = fieldset?.querySelector('legend');
    if (legend) pieces.push(legend.innerText);
    return pieces.join(' ');
  }

  function profileValue(profile, path) {
    return path.split('.').reduce((value, key) => value?.[key], profile) ?? '';
  }

  function fieldText(element) {
    return normalize([
      element.autocomplete,
      labelFor(element),
      element.getAttribute('aria-label'),
      element.getAttribute('placeholder'),
      element.name,
      element.id,
    ].join(' '));
  }

  function findMatch(element, profile) {
    const autocomplete = normalize(element.autocomplete);
    const byAutocomplete = {
      'given name': 'personal.firstName',
      'family name': 'personal.lastName',
      email: 'personal.email',
      tel: 'personal.phone',
      'street address': 'personal.address',
      'address level2': 'personal.city',
      'address level1': 'personal.state',
      'country name': 'personal.country',
      'postal code': 'personal.postalCode',
      organization: 'professional.currentCompany',
      'organization title': 'professional.currentTitle',
    }[autocomplete];
    if (byAutocomplete && profileValue(profile, byAutocomplete)) {
      return { key: byAutocomplete, value: profileValue(profile, byAutocomplete) };
    }

    const text = fieldText(element);
    const match = RULES.find(([key, terms]) =>
      profileValue(profile, key) && terms.some((term) => text.includes(normalize(term)))
    );
    return match ? { key: match[0], value: profileValue(profile, match[0]) } : null;
  }

  function visible(element) {
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' &&
      element.getClientRects().length > 0;
  }

  function scan(profile) {
    return Array.from(document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"]), textarea, select'
    )).filter(visible).map((element) => ({ element, match: findMatch(element, profile) }))
      .filter(({ match }) => match?.value);
  }

  function setValue(element, value) {
    const prototype = Object.getPrototypeOf(element);
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function radioChoice(element) {
    const associated = element.id
      ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
      : null;
    const directLabel = associated?.innerText || element.closest('label')?.innerText || '';
    const value = normalize(`${element.value} ${directLabel}`);
    if (/\byes\b|\btrue\b/.test(value) || /^1\b/.test(value)) return 'yes';
    if (/\bno\b|\bfalse\b/.test(value) || /^0\b/.test(value)) return 'no';
    return '';
  }

  function fill(profile) {
    const candidates = scan(profile);
    let filled = 0;

    for (const { element, match } of candidates) {
      if (element.disabled || element.readOnly) continue;
      const type = (element.type || '').toLowerCase();

      if (type === 'radio') {
        const target = normalize(match.value);
        const isYes = /^(yes|true)$/.test(target);
        const isNo = /^(no|false)$/.test(target);
        const choice = radioChoice(element);
        if (!element.checked && ((isYes && choice === 'yes') || (isNo && choice === 'no'))) {
          element.checked = true;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        }
        continue;
      }

      if (type === 'checkbox') continue;
      if (element.value?.trim()) continue;

      if (element.tagName === 'SELECT') {
        const target = normalize(match.value);
        const option = Array.from(element.options).find((item) => {
          const label = normalize(item.label);
          const value = normalize(item.value);
          return (label && (label === target || label.includes(target) || target.includes(label))) ||
            (value && value === target);
        });
        if (!option) continue;
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        setValue(element, match.value);
      }
      filled++;
    }
    return { filled, matched: candidates.length };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action !== 'GET_STATUS' && message?.action !== 'AUTOFILL') return;
    chrome.storage.local.get('userProfile').then(({ userProfile }) => {
      const profile = userProfile || {};
      if (message.action === 'GET_STATUS') {
        sendResponse({ matchCount: scan(profile).length });
        return;
      }
      sendResponse(fill(profile));
    }).catch((error) => {
      console.error('[JobAutoFill] Could not access the local profile.', error);
      sendResponse({ error: 'Could not read the saved profile.', filled: 0, matchCount: 0 });
    });
    return true;
  });

  chrome.storage.local.get('userProfile').then(({ userProfile }) => {
    const matchCount = scan(userProfile || {}).length;
    chrome.runtime.sendMessage({ type: 'FIELDS_DETECTED', count: matchCount }).catch(() => {});
  }).catch((error) => console.error('[JobAutoFill] Initial form scan failed.', error));
})();
