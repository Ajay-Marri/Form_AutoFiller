import { DetectedField, FieldMatch } from '../types';

export interface AutofillResult {
  totalFields: number;
  attempted: number;
  filledCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Modern synthetic event dispatch for React/Vue/Angular compatibility.
 * Modern frameworks hook into input value setters and track `_valueTracker`.
 * Direct element.value = 'abc' won't trigger state updates unless we call
 * the native prototype setter.
 */
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  // Trigger input, change and blur events with bubbling
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Autofill Matched Fields
 * Adheres strictly to FR-12 and Reliability & Safety Requirements:
 * - Does not overwrite existing user-entered information unless overwriteExisting is true
 * - Never submits the form automatically
 * - Supports text inputs, textareas, selects, radios, checkboxes
 */
export function executeAutofill(
  detectedFields: DetectedField[],
  matches: FieldMatch[],
  overwriteExisting: boolean = false
): AutofillResult {
  const result: AutofillResult = {
    totalFields: detectedFields.length,
    attempted: 0,
    filledCount: 0,
    skippedCount: 0,
    errors: [],
  };

  const matchMap = new Map<string, FieldMatch>();
  matches.forEach((m) => matchMap.set(m.fieldId, m));

  for (const field of detectedFields) {
    const match = matchMap.get(field.id);
    if (!match || !match.profileKey || !match.matchedValue) {
      continue;
    }

    // Only auto-fill if approved or high confidence
    if (match.status === 'skipped') {
      result.skippedCount++;
      continue;
    }

    // Target the DOM element
    let el: HTMLElement | null = field.domElementRef || null;
    if (!el && field.selector) {
      try {
        el = document.querySelector(field.selector) as HTMLElement;
      } catch (err) {
        // ignore selector parse errors
      }
    }

    if (!el) {
      result.errors.push(`Element not found for selector: ${field.selector}`);
      continue;
    }

    result.attempted++;

    const tagName = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || '').toLowerCase();

    // Check if element already has user-entered content
    if (!overwriteExisting) {
      if (tagName === 'input' || tagName === 'textarea') {
        const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
        if (inputEl.value && inputEl.value.trim().length > 0) {
          result.skippedCount++;
          continue; // Preserve existing data
        }
      }
    }

    try {
      if (tagName === 'select') {
        const selectEl = el as HTMLSelectElement;
        const targetVal = match.matchedValue.toLowerCase().trim();

        // Search for matching option by text or value
        let foundIdx = -1;
        for (let i = 0; i < selectEl.options.length; i++) {
          const opt = selectEl.options[i];
          const optText = (opt.textContent || '').toLowerCase().trim();
          const optVal = (opt.value || '').toLowerCase().trim();

          if (optVal === targetVal || optText === targetVal || optText.includes(targetVal) || targetVal.includes(optText)) {
            foundIdx = i;
            break;
          }
        }

        if (foundIdx >= 0) {
          selectEl.selectedIndex = foundIdx;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          result.filledCount++;
          match.status = 'filled';
        } else {
          result.skippedCount++;
        }
      } else if (type === 'radio') {
        const radioEl = el as HTMLInputElement;
        const radioVal = radioEl.value.toLowerCase();
        const targetVal = match.matchedValue.toLowerCase();

        if (radioVal === targetVal || (targetVal === 'yes' && radioVal === 'true') || (targetVal === 'no' && radioVal === 'false')) {
          radioEl.checked = true;
          radioEl.dispatchEvent(new Event('change', { bubbles: true }));
          result.filledCount++;
          match.status = 'filled';
        }
      } else if (type === 'checkbox') {
        const checkEl = el as HTMLInputElement;
        const targetBool = match.matchedValue.toLowerCase() === 'true' || match.matchedValue.toLowerCase() === 'yes';
        checkEl.checked = targetBool;
        checkEl.dispatchEvent(new Event('change', { bubbles: true }));
        result.filledCount++;
        match.status = 'filled';
      } else {
        // Text, Email, Tel, Url, Number, Textarea
        const textInput = el as HTMLInputElement | HTMLTextAreaElement;
        setNativeValue(textInput, match.matchedValue);
        result.filledCount++;
        match.status = 'filled';
      }

      // Add temporary visual feedback class to indicate successful autofill
      el.classList.add('autofill-highlight-pulse');
      setTimeout(() => {
        el?.classList.remove('autofill-highlight-pulse');
      }, 2500);

    } catch (err: any) {
      result.errors.push(`Error filling ${field.name || field.elementId}: ${err.message}`);
    }
  }

  return result;
}
