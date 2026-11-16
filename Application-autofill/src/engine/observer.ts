/**
 * MutationObserver Engine for Dynamic and Multi-Step Forms
 * Adheres to FR-13 (Dynamic Forms) and FR-14 (Multi-Step Forms)
 */
export class FormObserver {
  private observer: MutationObserver | null = null;
  private debounceTimer: any = null;
  private onFormChangeCallback: () => void;
  private isObserving: boolean = false;

  constructor(onFormChange: () => void) {
    this.onFormChangeCallback = onFormChange;
  }

  public start(targetElement: HTMLElement = document.body) {
    if (this.isObserving) return;

    this.observer = new MutationObserver((mutations) => {
      let shouldTrigger = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if any added node is or contains an input/select/textarea
          for (const node of Array.from(mutation.addedNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (
                el.matches &&
                (el.matches('input, select, textarea, form') ||
                  el.querySelector('input, select, textarea'))
              ) {
                shouldTrigger = true;
                break;
              }
            }
          }
        }
        if (shouldTrigger) break;
      }

      if (shouldTrigger) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.onFormChangeCallback();
        }, 300); // 300ms debounce to batch DOM updates
      }
    });

    this.observer.observe(targetElement, {
      childList: true,
      subtree: true,
    });

    this.isObserving = true;
  }

  public stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    clearTimeout(this.debounceTimer);
    this.isObserving = false;
  }
}
