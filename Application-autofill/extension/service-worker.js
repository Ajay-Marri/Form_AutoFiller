chrome.runtime.onInstalled.addListener(() => {
  console.info('[JobAutoFill] Installed. Profile data stays in chrome.storage.local.');
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'FIELDS_DETECTED' || sender.tab?.id === undefined) return;

  const count = Number.isFinite(message.count) ? message.count : 0;
  chrome.action.setBadgeText({
    tabId: sender.tab.id,
    text: count > 0 ? String(count) : '',
  });
  chrome.action.setBadgeBackgroundColor({
    tabId: sender.tab.id,
    color: '#4f46e5',
  });
});
