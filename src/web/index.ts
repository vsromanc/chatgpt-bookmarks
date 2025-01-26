import { BookmarkButton } from './bookmark-button';
import { BookmarksModal, BookmarksButton as OpenBookmarksModal } from './bookmarks-modal';

class NavigationController {
  private modal?: BookmarksModal;

  constructor() {
    customElements.define('bookmark-button', BookmarkButton);
    customElements.define('bookmarks-modal', BookmarksModal);
    customElements.define('open-bookmarks-modal', OpenBookmarksModal);
  }

  // Update initialize method
  public initialize(blocks: Array<{ title: string; language: string }>, sidebarTitle: string, bookmarks: number[]) {
    this.addBookmarkButtons(bookmarks);

    this.injectBookmarksButton();
    this.injectBookmarksModal();
  }

  private injectBookmarksButton() {
    const button = OpenBookmarksModal.injectButton();
    button.addEventListener('click', () => {
      this.modal?.show();
    });
  }

  private injectBookmarksModal() {
    this.modal = document.createElement('bookmarks-modal') as BookmarksModal;
    document.body.appendChild(this.modal);
  }

  private addBookmarkButtons(bookmarks: number[]) {
    const codeBlocks = document.querySelectorAll('pre[data-code-index]');
    codeBlocks.forEach((codeBlock, index) => {
      const bookmarmk = BookmarkButton.addToCodeBlock(codeBlock as HTMLElement, index, bookmarks.includes(index));
      bookmarmk?.addEventListener('toggle', this.handleToggleBookmark.bind(this));
    });
  }

  private handleToggleBookmark(event: Event) {
    const customEvent = event as CustomEvent<{ isBookmarked: boolean; index: number; codeLanguage: string; codeContent: string; accessToken: string }>;
    const isBookmarked = customEvent.detail.isBookmarked;
    const index = customEvent.detail.index;
    const codeLanguage = customEvent.detail.codeLanguage;
    const codeContent = customEvent.detail.codeContent;
    const accessToken = customEvent.detail.accessToken;
    window.postMessage({
      type: 'TOGGLE_BOOKMARK',
      payload: { isBookmarked, index, codeLanguage, codeContent, accessToken }
    }, '*');
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
