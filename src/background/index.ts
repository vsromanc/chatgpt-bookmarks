// Background script
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  console.log('Message received in background script:', request);
  sendResponse({ status: 'received' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_COOKIE") {
    chrome.cookies.get({ url: request.payload.url, name: request.payload.name }, (cookie) => {
      if (!sender.tab?.id) return;  // Early return if tab id is undefined

      if (cookie) {
        chrome.tabs.sendMessage(sender.tab.id, {
          payload: { value: cookie.value },
          _reqId: request._reqId
        });
      } else {
        chrome.tabs.sendMessage(sender.tab.id, {
          payload: { value: null },
          _reqId: request._reqId
        });
      }
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.type === 'OPEN_CHAT') {
    const tabId = sender.tab?.id;
    if (!tabId) return;
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { type: 'NAVIGATE_TO_CODE_BLOCK', payload: { chatId: request.payload.chatId, bookmarkIndex: request.payload.bookmarkIndex, url: request.payload.url } });
    }, 1000);
    return true;
  }
});
