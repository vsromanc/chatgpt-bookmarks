import log from '../lib/loglevel'
import { EVENTS } from '../glossary'
import './dev'

// Listen for messages from content script
chrome.runtime.onMessage.addListener(
    (request: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
        sendResponse({ status: 'received' })
    }
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_COOKIE') {
        chrome.cookies.get({ url: request.payload.url, name: request.payload.name }, cookie => {
            if (!sender.tab?.id) return // Early return if tab id is undefined

            if (cookie) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    payload: { value: cookie.value },
                    _reqId: request._reqId,
                })
            } else {
                chrome.tabs.sendMessage(sender.tab.id, {
                    payload: { value: null },
                    _reqId: request._reqId,
                })
            }
        })
        return true // Indicates that the response is asynchronous
    } else if (request.type === 'OPEN_CHAT') {
        const tabId = sender.tab?.id
        if (!tabId) return
        setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
                type: EVENTS.NAVIGATE_TO_CODE_BLOCK,
                payload: {
                    chatId: request.payload.chatId,
                    bookmarkIndex: request.payload.bookmarkIndex,
                    url: request.payload.url,
                },
            })
        }, 1000)
        return true
    }
})

// add web request listener to monitor conversation data loaded
// example url: https://chatgpt.com/backend-api/conversation/6797d8ce-0618-8009-970e-c9b8a5084aab
chrome.webRequest.onCompleted.addListener(
    details => {
        if (endsWithUuid(details.url)) {
            log.info('conversation data loaded', details)
            chrome.tabs.sendMessage(details.tabId, {
                type: EVENTS.CONVERSATION_DATA,
                payload: {
                    chatId: details.url.split('/').pop(),
                    url: details.url,
                },
            })
        }
    },
    { urls: ['https://chatgpt.com/backend-api/conversation/*'], types: ['xmlhttprequest'] }
)

function endsWithUuid(url: string) {
    // Regular expression for a UUID
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Check if the URL ends with a UUID
    return uuidRegex.test(url)
}
