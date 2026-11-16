import { DetectedField } from '../types';

/**
 * Robust DOM Field Detector
 * Inspects any form container or document to extract all relevant form elements
 * according to FR-07, FR-08, FR-09.
 */
export function detectFormFields(rootContainer?: HTMLElement | Document): DetectedField[] {
  const container = rootContainer || document;
  const elements = container.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea'
  );

  const detected: DetectedField[] = [];

  elements.forEach((el, index) => {
    // Avoid non-visible inputs if hidden via display:none or visibility:hidden
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return;
    }

    const tagName = el.tagName.toLowerCase();
    const type = (el.getAttribute('type') || (tagName === 'textarea' ? 'textarea' : tagName === 'select' ? 'select' : 'text')).toLowerCase();
    const elementId = el.getAttribute('id') || '';
    const name = el.getAttribute('name') || '';
    const placeholder = el.getAttribute('placeholder') || '';
    const ariaLabel = el.getAttribute('aria-label') || '';
    const autocomplete = el.getAttribute('autocomplete') || '';

    // Extract label text through multiple robust strategies
    let labelText = '';

    // 1. Associated <label for="...">
    if (elementId) {
      const associatedLabel = container.querySelector(`label[for="${CSS.escape(elementId)}"]`);
      if (associatedLabel) {
        labelText = associatedLabel.textContent || '';
      }
    }

    // 2. Enclosing <label>
    if (!labelText) {
      const parentLabel = el.closest('label');
      if (parentLabel) {
        // Clone and remove the input element to read only the text node
        const clone = parentLabel.cloneNode(true) as HTMLElement;
        const nestedInput = clone.querySelector('input, select, textarea');
        if (nestedInput) nestedInput.remove();
        labelText = clone.textContent || '';
      }
    }

    // 3. aria-labelledby
    if (!labelText && el.getAttribute('aria-labelledby')) {
      const labelId = el.getAttribute('aria-labelledby')!;
      const labelledEl = container.querySelector(`#${CSS.escape(labelId)}`);
      if (labelledEl) {
        labelText = labelledEl.textContent || '';
      }
    }

    // Clean labelText
    labelText = labelText.replace(/\s+/g, ' ').replace(/[*:]/g, '').trim();

    // 4. Surrounding context (fieldset legend, preceding text block or parent container text)
    let surroundingContext = '';
    const fieldset = el.closest('fieldset');
    if (fieldset) {
      const legend = fieldset.querySelector('legend');
      if (legend) {
        surroundingContext = (legend.textContent || '').trim();
      }
    }
    if (!surroundingContext) {
      const parentBlock = el.parentElement;
      if (parentBlock) {
        const header = parentBlock.querySelector('h1, h2, h3, h4, h5, h6, strong, b, .form-label');
        if (header && header !== el) {
          surroundingContext = (header.textContent || '').trim();
        }
      }
    }

    // Extract options if select element
    let options: { value: string; label: string }[] | undefined;
    if (tagName === 'select') {
      const selectEl = el as HTMLSelectElement;
      options = Array.from(selectEl.options).map((opt) => ({
        value: opt.value,
        label: (opt.textContent || '').trim(),
      }));
    }

    // Current value
    let currentValue = '';
    if (type === 'checkbox' || type === 'radio') {
      currentValue = (el as HTMLInputElement).checked ? 'true' : 'false';
    } else {
      currentValue = (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value || '';
    }

    // Create unique selector
    let selector = '';
    if (elementId) {
      selector = `#${elementId}`;
    } else if (name) {
      selector = `${tagName}[name="${name}"]`;
    } else {
      selector = `${tagName}:nth-of-type(${index + 1})`;
    }

    detected.push({
      id: `field-${index}-${elementId || name || Math.random().toString(36).substring(2, 7)}`,
      elementId,
      name,
      type,
      tagName,
      placeholder,
      labelText,
      ariaLabel,
      autocomplete,
      surroundingContext,
      options,
      currentValue,
      selector,
      domElementRef: el,
    });
  });

  return detected;
}
