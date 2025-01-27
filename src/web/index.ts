import { BookmarkManager } from './bookmark-button';
import { OpenBookmarksButton } from './open-bookmarks';
import type { BookmarksModal } from './bookmarks-modal';
import './bookmarks-modal';
import './bookmark-group';
import './bookmark-item';

class NavigationController {
  modal?: BookmarksModal;

  constructor() {
    BookmarkManager.initialize();
    customElements.define('open-bookmarks-modal', OpenBookmarksButton);
  }

  // Update initialize method
  public initialize(blocks: Array<{ title: string; language: string }>, sidebarTitle: string, bookmarks: number[]) {
    BookmarkManager.addBookmarkButtons(bookmarks);

    this.injectBookmarksButton();
    this.injectBookmarksModal();
  }

  private injectBookmarksButton() {
    const button = OpenBookmarksButton.injectButton();
    button.addEventListener('click', () => {
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
    return false;
    // return document.body.contains(this.navigator);
  }
}

const controller = new NavigationController();

window.addEventListener('message', (event) => {
  if (event.source === window && event.data.type === 'CODE_BLOCKS_UPDATE') {
    if (!controller.isInitialized()) {
      controller.initialize(
        event.data.payload.blocks,
        event.data.payload.title,
        event.data.payload.bookmarks
      );
    }
  }
});
