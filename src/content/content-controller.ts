import log from '../lib/loglevel'
import { extractSidebarTitle } from './title-extractor'
import { StorageService } from '../common/storage-service'
import { extractChatId } from '../common/url-utils'
import { scrollAndHighlight } from '../web/misc'
import { EVENTS } from '../glossary'
import { injectWebScript } from '../common/inject-script'
import { PromptStateObserver } from './page-mode'
import { inferMetadata } from './api'
import { invariant } from 'outvariant'
import { awaitTimeout } from '../common/services/await-timeout'

export class ContentController {
    private pageMode: PromptStateObserver = new PromptStateObserver()

    initTimeout: ReturnType<typeof setTimeout> | null = null
    initInterval: ReturnType<typeof setInterval> | null = null

    scrollOnLoad: { chatId: string; bookmarkIndex: string; url: string } | null = null

    public async initialize() {
        await this.injectWebScript()

        window.addEventListener('message', this.handleWindowMessage.bind(this))
        chrome.runtime.onMessage.addListener(this.runtimeOnMessageListener)

        window.addEventListener('DOMContentLoaded', () => {
            this.initializeChat()
        })
    }

    private async injectWebScript() {
        await injectWebScript(`${process.env.APP_NAME}-web-script`, 'web.js')
        log.info('Web script injected')
    }

    async initializeChat() {
        this.observeChatState()

        const chatId = extractChatId()
        if (chatId) {
            const bookmarks = await StorageService.getBookmarks(chatId)
            window.postMessage(
                {
                    type: EVENTS.INIT_BOOKMARKS,
                    payload: {
                        bookmarks,
                        title: extractSidebarTitle(),
                    },
                },
                '*'
            )
        }

        if (this.scrollOnLoad) {
            this.scrollToBookmark(this.scrollOnLoad.bookmarkIndex)
            this.scrollOnLoad = null
        }
    }

    handlePromtStateCompleted() {
        window.postMessage({ type: EVENTS.PROMPT_STATE_COMPLETED }, '*')
    }

    private observeChatState() {
        this.pageMode.start()
        this.pageMode.onStateChanged(state => {
            if (state === 'completed') {
                this.handlePromtStateCompleted()
            }
        })
    }

    private runtimeOnMessageListener = (request: any) => {
        switch (request.type) {
            case EVENTS.HISTORY_STATE_UPDATED:
                log.debug('History state updated', request.payload)
                this.initializeChat()
                break
            case EVENTS.SCROLL_TO_BOOKMARK:
                log.debug('Scroll to bookmark', request.payload)
                this.openChat(request.payload.chatId, request.payload.bookmarkIndex, request.payload.url)
                break
        }
    }

    private async handleWindowMessage(event: MessageEvent) {
        if (event.source !== window) return
        switch (event.data.type) {
            case EVENTS.TOGGLE_BOOKMARK:
                log.debug('Toggle bookmark', event.data.payload)
                const chatId = extractChatId()
                if (!chatId) {
                    log.error('Toggle bookmark: No chat id found')
                    return
                }

                const chatTitle = extractSidebarTitle()
                if (!chatTitle) {
                    log.error('Toggle bookmark: No chat title found')
                    return
                }

                const { accessToken, lang, content, isBookmarked, index } = event.data.payload

                let metadata
                if (isBookmarked) {
                    metadata = await inferMetadata(accessToken, content)
                    log.debug('Toggle bookmark: Inferred metadata', metadata)
                }

                StorageService.toggleBookmark(chatId, index, isBookmarked, {
                    lang,
                    content,
                    chatTitle,
                    metadata,
                }).catch(log.error)

                event.source.postMessage(
                    { type: EVENTS.TOGGLE_BOOKMARK_COMPLETED, payload: { metadata, index, isBookmarked } },
                    '*'
                )

                chrome.runtime.sendMessage({
                    type: EVENTS.LOG_EVENT,
                    payload: {
                        event: 'toggle_bookmark',
                    },
                })
                break
            case EVENTS.GET_ALL_BOOKMARKS:
                chrome.runtime.sendMessage({
                    type: EVENTS.LOG_EVENT,
                    payload: {
                        event: 'get_all_bookmarks',
                    },
                })
                const bookmarks = await StorageService.getAllBookmarks()
                window.postMessage(
                    {
                        type: 'ALL_BOOKMARKS_DATA',
                        payload: bookmarks,
                    },
                    '*'
                )
                break
            case EVENTS.OPEN_CHAT: {
                chrome.runtime.sendMessage({
                    type: EVENTS.LOG_EVENT,
                    payload: {
                        event: 'open_chat',
                    },
                })
                const { chatId, bookmarkIndex, url } = event.data.payload
                this.openChat(chatId, bookmarkIndex, url)
                break
            }
        }
    }

    findPreElementWithInterval(index: number, timeout: number = 3500) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const pre = document.querySelectorAll('pre')?.[index]
                if (pre) {
                    clearInterval(interval)
                    resolve(pre)
                }
            }, 30)

            awaitTimeout(timeout, 'Pre element not found').catch(reject)
        })
    }

    emulateChatClick(url: string) {
        const atag = document.querySelector(`a[href="${url}"]`)
        if (atag) {
            log.info('Sidebar link found', atag)
                ; (atag as HTMLElement).click()
            chrome.runtime.sendMessage({
                type: EVENTS.LOG_EVENT,
                payload: {
                    event: 'emulate_chat_click',
                },
            })
            return true
        }
        return false
    }

    async scrollToBookmark(bookmarkIndex: string) {
        const index = parseInt(bookmarkIndex)
        const pre = (await this.findPreElementWithInterval(index)) as HTMLElement

        const container = document.querySelector(
            '.composer-parent .overflow-y-auto'
        ) as HTMLDivElement
        invariant(container?.contains(pre), 'Scroll container or pre element not found')
        if (pre) {
            scrollAndHighlight(container, pre)
        }
    }

    async openChat(chatId: string, bookmarkIndex: string, url: string) {
        if (location.href.includes(url)) {
            this.scrollToBookmark(bookmarkIndex)
            return
        }

        log.info('Open chat', chatId, bookmarkIndex, url)
        if (!this.emulateChatClick(url)) {
            chrome.runtime.sendMessage({
                type: EVENTS.LOG_EVENT,
                payload: {
                    event: 'open_chat_http',
                },
            })
            window.location.href = url
        }

        // scroll to bookmark after chat is opened
        this.scrollOnLoad = {
            chatId,
            bookmarkIndex,
            url,
        }
    }
}
