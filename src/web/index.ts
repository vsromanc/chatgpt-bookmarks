import { FetchInterceptor } from '@mswjs/interceptors/fetch'
import { invariant } from 'outvariant'
import log from '../lib/loglevel'
import { awaitTimeout } from '../common/services/await-timeout'
import { BookmarkManager } from './bookmark-button'
import * as OpenBookmarks from './open-bookmarks'
import type { BookmarksModal } from './bookmarks-modal'
import type { OpenBookmarksButton } from './open-bookmarks'
import './bookmarks-modal'
import './bookmark-group'
import './bookmark-item'
import { EVENTS } from '../glossary'

class WebpageController {
    modal?: BookmarksModal
    button?: OpenBookmarksButton
    fetchInterceptor: FetchInterceptor

    bookmarks: number[] | null = null

    constructor() {
        BookmarkManager.initialize()
        this.fetchInterceptor = new FetchInterceptor()
        this.initFetchInterceptor()

        window.addEventListener('DOMContentLoaded', () => {
            this.injectBookmarksModal()
        })
    }

    initFetchInterceptor() {
        this.fetchInterceptor.on('response', this.onFetchResponse)
        this.fetchInterceptor.apply()
    }

    isValidConversationResponse(response: Response) {
        return response.ok && /backend-api\/conversation\/[a-f0-9\-]{36}$/.test(response.url)
    }

    onFetchResponse = async ({ response }: { response: Response }) => {
        if (this.isValidConversationResponse(response)) {
            const json = await response.clone().json()
            try {
                let currentNode = json.current_node
                const lastMessageId = json.mapping[currentNode].message.id
                this.initChat(lastMessageId)
            } catch (error) {
                log.error('Error parsing conversation', error)
            }
        }
    }

    initChat = async (messageId: string) => {
        const uiReadyPromise = new Promise<void>(resolve => {
            const interval = setInterval(() => {
                const message = document.querySelector(`div[data-message-id="${messageId}"] div.markdown`)
                if (message) {
                    clearInterval(interval)
                    resolve()
                }
            }, 30)
        })

        await Promise.race([uiReadyPromise, awaitTimeout(5000, 'No corresponding div was found matching API response')])

        invariant(this.bookmarks, 'Bookmarks are not initialized')

        console.log('bookmarks', this.bookmarks)
        BookmarkManager.addBookmarkButtons(this.bookmarks)
        this.injectBookmarksButton()
    }

    // Update initialize method
    public initializeBookmarks(bookmarks: number[]) {
        this.bookmarks = bookmarks
    }

    public handlePromtStateCompleted() {
        log.info('WebpageController.handlePromtStateCompleted')
        BookmarkManager.addBookmarkButtons()
    }

    private injectBookmarksButton() {
        if (!document.body.contains(this.button as Node)) {
            this.button = OpenBookmarks.OpenBookmarksButton.injectButton()
            this.button.addEventListener('click', () => {
                log.info('Open bookmarks button clicked')
                this.modal?.show()
            })
        }
    }

    private injectBookmarksModal() {
        if (!document.body.contains(this.modal as Node)) {
            this.modal = document.createElement('bookmarks-modal') as BookmarksModal
            document.body.appendChild(this.modal)
        }
    }
}

const controller = new WebpageController()

window.addEventListener('message', event => {
    if (event.source === window) {
        if (event.data.type === EVENTS.INIT_BOOKMARKS) {
            const bookmarks = event.data.payload.bookmarks
            controller.initializeBookmarks(bookmarks)
        } else if (event.data.type === EVENTS.PROMPT_STATE_COMPLETED) {
            controller.handlePromtStateCompleted()
        }
    }
})
