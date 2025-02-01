import log from '../lib/loglevel'
import { EVENTS } from '../glossary'
import './dev'

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
    }
})

chrome.webNavigation.onHistoryStateUpdated.addListener(
    async details => {
        chrome.tabs.sendMessage(details.tabId, {
            type: EVENTS.HISTORY_STATE_UPDATED,
            payload: {
                chatId: endsWithUuid(details.url) ? details.url.split('/').pop() : null,
                url: details.url,
            },
        })
    },
    {
        url: [
            {
                hostContains: 'chatgpt.com',
            },
        ],
    }
)

function endsWithUuid(url: string) {
    // Regular expression for a UUID
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Check if the URL ends with a UUID
    return uuidRegex.test(url)
}
