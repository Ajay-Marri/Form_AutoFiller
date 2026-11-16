/**
 * JobAutoFill Background Service Worker (Manifest V3)
 * Coordinates messages between popup, content scripts, and storage.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('JobAutoFill Extension installed successfully.');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(
  (
    message: { type: string; count?: number },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (message.type === 'FIELDS_DETECTED') {
      const count = message.count || 0;
      if (sender.tab?.id) {
        chrome.action.setBadgeText({
          tabId: sender.tab.id,
          text: count > 0 ? String(count) : '',
        });
        chrome.action.setBadgeBackgroundColor({
          tabId: sender.tab.id,
          color: '#2563EB',
        });
      }
      sendResponse({ received: true });
    }
    return true;
  }
);
