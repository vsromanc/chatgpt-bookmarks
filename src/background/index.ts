import log from '../lib/loglevel'
import { EVENTS } from '../glossary'
import { invariant } from 'outvariant'
import { sendEvent } from './ga'

chrome.runtime.onInstalled.addListener(() => {
    sendEvent('extension_installed')
})

chrome.runtime.onMessage.addListener(async (request, sender) => {
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
    } else if (request.type === EVENTS.OPEN_CHAT) {
        invariant(sender.tab?.id, 'Tab id is undefined')
        const tab = await chrome.tabs.get(sender.tab.id)
        invariant(tab.url, 'Tab url is undefined')
        const newUrl = new URL(tab.url)
        newUrl.pathname = request.payload.url

        await chrome.tabs.update(sender.tab.id, { url: newUrl.toString() })
        chrome.tabs.sendMessage(sender.tab.id, {
            type: EVENTS.SCROLL_TO_BOOKMARK,
            payload: {
                bookmarkIndex: request.payload.bookmarkIndex,
                chatId: request.payload.chatId,
                url: request.payload.url,
            },
        })
    } else if (request.type === EVENTS.LOG_EVENT) {
        sendEvent(request.payload.event)
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
