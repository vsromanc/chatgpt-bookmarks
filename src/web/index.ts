import log from '../lib/loglevel'
import { BookmarkManager } from './bookmark-button'
import * as OpenBookmarks from './open-bookmarks'
import type { BookmarksModal } from './bookmarks-modal'
import './bookmarks-modal'
import './bookmark-group'
import './bookmark-item'
import { EVENTS } from '../glossary'

class WebpageController {
    modal?: BookmarksModal

    constructor() {
        BookmarkManager.initialize()
    }

    // Update initialize method
    public initialize(blocks: Array<{ title: string; language: string }>, sidebarTitle: string, bookmarks: number[]) {
        log.info('WebpageController.initialize', blocks, sidebarTitle, bookmarks)
        BookmarkManager.addBookmarkButtons(bookmarks)

        this.injectBookmarksButton()

        if (!document.body.contains(this.modal as Node)) {
            this.injectBookmarksModal()
        }
    }

    private injectBookmarksButton() {
        const button = OpenBookmarks.OpenBookmarksButton.injectButton()
        button.addEventListener('click', () => {
            log.info('Open bookmarks button clicked')
            this.modal?.show()
        })
    }

    private injectBookmarksModal() {
        this.modal = document.createElement('bookmarks-modal') as BookmarksModal
        document.body.appendChild(this.modal)
    }

    public destroy(): void {
        // this.navigator.remove();
    }
}

const controller = new WebpageController()

window.addEventListener('message', event => {
    if (event.source === window && event.data.type === EVENTS.CODE_BLOCKS_UPDATE) {
        log.info('Update code blocks', event.data)
        controller.initialize(event.data.payload.blocks, event.data.payload.title, event.data.payload.bookmarks)
    }
})
