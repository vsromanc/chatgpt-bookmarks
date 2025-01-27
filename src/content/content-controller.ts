import log from '../lib/loglevel'
import { extractCodeBlocks, CodeBlock, hasCodeBlocks } from './code-extractor'
import { extractSidebarTitle } from './title-extractor'
import { StorageService } from '../common/storage-service'
import { extractChatId } from '../common/url-utils'
import { scrollAndHighlight } from '../web/misc'
import { EVENTS } from '../glossary'
import { injectWebScript } from '../common/inject-script'
import { PromptStateObserver } from './page-mode'
import { inferMetadata } from './api'

export class ContentController {
    private lastSentHash = ''
    private pageMode: PromptStateObserver = new PromptStateObserver()

    public async initialize() {
        await this.injectWebScript()
        this.observeChatState()
        this.addEventListeners()
    }

    private async injectWebScript() {
        await injectWebScript(`${process.env.APP_NAME}-web-script`, 'dist/web.js')
        log.info('Web script injected')
    }

    private sendUpdate = async () => {
        const chatId = extractChatId()
        if (!chatId) return

        const bookmarks = await StorageService.getBookmarks(chatId)
        const blocks = extractCodeBlocks()
        const currentHash = this.generateHash(blocks)

        if (currentHash !== this.lastSentHash) {
            blocks.forEach((b, index) => {
                b.element.setAttribute('data-code-index', index.toString())
            })

            window.postMessage(
                {
                    type: EVENTS.CODE_BLOCKS_UPDATE,
                    payload: {
                        blocks: blocks.map(b => ({
                            title: b.title,
                            language: b.language,
                            index: b.index,
                        })),
                        bookmarks,
                        title: extractSidebarTitle(),
                    },
                },
                '*'
            )

            this.lastSentHash = currentHash
        } else {
            log.warn('No changes detected', { currentHash, lastSentHash: this.lastSentHash })
        }
    }

    private generateHash(blocks: CodeBlock[]): string {
        return blocks.map((b, index) => `${index}|${b.title}|${b.language}`).join('#')
    }

    private observeChatState() {
        this.pageMode.start()
        this.pageMode.onStateChanged(state => {
            if (state === 'completed') {
                this.sendUpdate()
            }
        })
    }

    private addEventListeners() {
        window.addEventListener('message', this.handleWindowMessage.bind(this))
        chrome.runtime.onMessage.addListener(this.runtimeOnMessageListener)
    }

    private runtimeOnMessageListener = (request: any) => {
        switch (request.type) {
            case EVENTS.NAVIGATE_TO_CODE_BLOCK:
                log.info('Navigate to code block', request.payload)
                const pre = document.querySelector(`pre[data-code-index="${request.payload.bookmarkIndex}"]`)
                scrollAndHighlight(pre as HTMLElement)
                break
            case EVENTS.CONVERSATION_DATA:
                log.debug('Conversation data', request.payload)
                // give some time for data to render
                setTimeout(() => {
                    this.sendUpdate()
                }, 500)
                break
        }
    }

    private async handleWindowMessage(event: MessageEvent) {
        if (event.source === window && event.data.type === EVENTS.TOGGLE_BOOKMARK) {
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

            const metadata = await inferMetadata(accessToken, content)
            log.debug('Toggle bookmark: Inferred metadata', metadata)

            StorageService.toggleBookmark(chatId, index, isBookmarked, {
                lang,
                content,
                chatTitle,
                metadata,
            }).catch(log.error)
        } else if (event.source === window && event.data.type === EVENTS.GET_ALL_BOOKMARKS) {
            const bookmarks = await StorageService.getAllBookmarks()
            window.postMessage(
                {
                    type: 'ALL_BOOKMARKS_DATA',
                    payload: bookmarks,
                },
                '*'
            )
        } else if (event.source === window && event.data.type === EVENTS.OPEN_CHAT) {
            const { chatId, bookmarkIndex, url } = event.data.payload

            const reply = await chrome.runtime.sendMessage({
                type: EVENTS.OPEN_CHAT,
                payload: { chatId, bookmarkIndex, url },
            })

            if (reply.status === 'received') {
                const sidebarTag = document.querySelector(`a[href="${url}"]`)
                if (sidebarTag) {
                    ;(sidebarTag as HTMLElement).click()
                }
            }
        }
    }
}
