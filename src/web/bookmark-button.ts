import { LitElement, html, css } from 'lit';
import { property, state } from 'lit/decorators.js';

type BookmarkEventDetail = {
    isBookmarked: boolean;
    index: number;
    codeLanguage?: string;
    codeContent?: string;
    accessToken?: string;
};

const BUTTON_LABELS = {
    BOOKMARKED: '✓ Bookmarked',
    DEFAULT: '⭐ Bookmark',
} as const;

export class BookmarkButton extends LitElement {
    @property({ type: Number }) index = 0;
    @state() isBookmarked = false;

    static styles = css`
    button {
        border: none;
        background-color: transparent;
        background-image: none;
        cursor: pointer;
        color: #5d5d5d;
    }
  `;

    render() {
        return html`
      <button @click=${this.handleClick}>
        ${this.isBookmarked ? BUTTON_LABELS.BOOKMARKED : BUTTON_LABELS.DEFAULT}
      </button>
    `;
    }

    private async handleClick() {
        this.isBookmarked = !this.isBookmarked;
        this.dispatchBookmarkEvent();
    }

    private async dispatchBookmarkEvent() {
        const codeDetails = this.getCodeDetails();
        const accessToken = await this.getAccessToken();

        this.dispatchEvent(new CustomEvent<BookmarkEventDetail>('toggle', {
            detail: {
                isBookmarked: this.isBookmarked,
                index: this.index,
                ...codeDetails,
                accessToken,
            },
            bubbles: true,
            composed: true
        }));
    }

    private getCodeDetails() {
        const codeElement = this.closest('pre')?.querySelector('code');
        if (!codeElement) return {};

        return {
            codeLanguage: this.getCodeLanguage(codeElement),
            codeContent: codeElement.innerHTML,
        };
    }

    private getCodeLanguage(codeElement: HTMLElement) {
        return Array.from(codeElement.classList)
            .find(className => className.startsWith('language-'))
            ?.replace('language-', '');
    }

    private async getAccessToken(): Promise<string | undefined> {
        try {
            return (window as any).__reactRouterContext?.state.loaderData.root.clientBootstrap.session.accessToken;
        } catch (error) {
            console.error('Failed to retrieve access token:', error);
            return undefined;
        }
    }
}

// DOM Utilities
export class BookmarkManager {
    static initialize() {
        // Initialize component
        customElements.define('bookmark-button', BookmarkButton);
    }

    static async addBookmarkButtons(bookmarks: number[]) {
        const codeBlocks = document.querySelectorAll('pre[data-code-index]');

        codeBlocks.forEach((codeBlock, index) => {
            if (this.hasExistingBookmarkButton(codeBlock)) return;

            const copyButton = codeBlock.querySelector('button[aria-label="Copy"]');
            if (!copyButton) return;

            const bookmarkButton = this.createBookmarkButton(copyButton, index, bookmarks);
            this.insertBookmarkButton(bookmarkButton, copyButton);
        });
    }

    private static hasExistingBookmarkButton(codeBlock: Element) {
        return codeBlock.previousElementSibling?.querySelector('bookmark-button');
    }

    private static createBookmarkButton(copyButton: Element, index: number, bookmarks: number[]) {
        const button = document.createElement('bookmark-button') as BookmarkButton;
        button.index = index;
        button.isBookmarked = bookmarks.includes(index);
        button.classList.add(...Array.from(copyButton.classList));
        return button;
    }

    private static insertBookmarkButton(button: BookmarkButton, referenceElement: Element) {
        const wrapper = document.createElement('span');
        wrapper.className = 'bookmark-button-wrapper';
        wrapper.appendChild(button);

        referenceElement.closest('div.flex')?.insertBefore(
            wrapper,
            referenceElement.closest('span')
        );
    }

    static handleToggleBookmark(event: CustomEvent<BookmarkEventDetail>) {
        const { isBookmarked, index, codeLanguage, codeContent, accessToken } = event.detail;

        window.postMessage({
            type: 'TOGGLE_BOOKMARK',
            payload: { isBookmarked, index, codeLanguage, codeContent, accessToken }
        }, '*');
    }
}
