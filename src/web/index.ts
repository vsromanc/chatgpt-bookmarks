import log from '../lib/loglevel'
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

    constructor() {
        BookmarkManager.initialize()
    }

    // Update initialize method
    public initializeBookmarks(bookmarks: number[]) {
        log.info('WebpageController.initializeBookmarks', bookmarks)
        BookmarkManager.addBookmarkButtons(bookmarks)

        this.injectBookmarksButton()
        this.injectBookmarksModal()
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

    public destroy(): void {
        // this.navigator.remove();
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
