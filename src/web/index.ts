import log from '../lib/loglevel';
import { BookmarkManager } from './bookmark-button';
import { OpenBookmarksButton } from './open-bookmarks';
import type { BookmarksModal } from './bookmarks-modal';
import './bookmarks-modal';
import './bookmark-group';
import './bookmark-item';
import { EVENTS } from '../glossary';

class NavigationController {
  modal?: BookmarksModal;

  constructor() {
    BookmarkManager.initialize();
    customElements.define('open-bookmarks-modal', OpenBookmarksButton);
  }

  // Update initialize method
  public initialize(blocks: Array<{ title: string; language: string }>, sidebarTitle: string, bookmarks: number[]) {
    log.info('NavigationController.initialize', blocks, sidebarTitle, bookmarks);
    BookmarkManager.addBookmarkButtons(bookmarks);

    this.injectBookmarksButton();
    this.injectBookmarksModal();
  }

  private injectBookmarksButton() {
    const button = OpenBookmarksButton.injectButton();
    button.addEventListener('click', () => {
      log.info('Open bookmarks button clicked');
      this.modal?.show();
    });
  }

  private injectBookmarksModal() {
    this.modal = document.createElement('bookmarks-modal') as BookmarksModal;
    document.body.appendChild(this.modal);
  }

  public destroy(): void {
    // this.navigator.remove();
  }

  public isInitialized(): boolean {
    return document.body.contains(this.modal as Node);
  }
}

const controller = new NavigationController();

window.addEventListener('message', (event) => {
  if (event.source === window && event.data.type === EVENTS.CODE_BLOCKS_UPDATE) {
    log.info('Update code blocks', event.data);

    if (!controller.isInitialized()) {
      controller.initialize(
        event.data.payload.blocks,
        event.data.payload.title,
        event.data.payload.bookmarks
      );
    }
  }
});
