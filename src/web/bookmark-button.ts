import { html, css } from 'lit'
import { BaseElement } from './base'
import { property, state } from 'lit/decorators.js'
import { EVENTS } from '../glossary'

const BUTTON_LABELS = {
    BOOKMARKED: '✓ Bookmarked',
    DEFAULT: '✭ Bookmark',
} as const

export class BookmarkButton extends BaseElement {
    @property({ type: Number }) index = 0
    @state() isBookmarked = false

    get componentName() {
        return `${this.tagName.toLowerCase()}-${this.index}`
    }

    static styles = css`
        button {
            border: none;
            background-color: transparent;
            background-image: none;
            cursor: pointer;
            color: inherit;
            line-height: 0;
            display: flex;
        }
    `

    render() {
        return html`
            <button @click=${this.handleClick}>
                ${this.isBookmarked ? BUTTON_LABELS.BOOKMARKED : BUTTON_LABELS.DEFAULT}
            </button>
        `
    }

    private async handleClick() {
        this.isBookmarked = !this.isBookmarked
        BookmarkManager.updateBookmarkState(this.index, this.isBookmarked, this.getLanguageAndContent())
    }

    private getLanguageAndContent() {
        const codeElement = this.closest('pre')?.querySelector('code')
        if (!codeElement) return {}

        return {
            lang: this.getCodeLanguage(codeElement),
            content: codeElement.innerHTML,
        }
    }

    private getCodeLanguage(codeElement: HTMLElement) {
        return Array.from(codeElement.classList)
            .find(className => className.startsWith('language-'))
            ?.replace('language-', '')
    }
}

// DOM Utilities
export class BookmarkManager {
    static initialize() {
        // Initialize component
        customElements.define('bookmark-button', BookmarkButton)
    }

    static async addBookmarkButtons(bookmarks?: number[]) {
        const blocks = document.querySelectorAll('pre')
        blocks.forEach((codeBlock, index) => {
            if (!codeBlock.closest('article[data-testid^="conversation-turn-"]')) return

            if (this.hasExistingBookmarkButton(codeBlock)) return

            const copyButton = codeBlock.querySelector('button[aria-label="Copy"]')
            if (!copyButton) return

            const bookmarkButton = this.createBookmarkButton(copyButton, index, bookmarks)
            this.insertBookmarkButton(bookmarkButton, copyButton)
        })
    }

    private static hasExistingBookmarkButton(codeBlock: Element) {
        return codeBlock.contains(codeBlock.querySelector('bookmark-button'))
    }

    private static createBookmarkButton(copyButton: Element, index: number, bookmarks?: number[]) {
        const button = document.createElement('bookmark-button') as BookmarkButton
        button.index = index
        button.isBookmarked = bookmarks?.includes(index) ?? false
        button.classList.add('flex', 'select-none')
        return button
    }

    private static insertBookmarkButton(button: BookmarkButton, referenceElement: Element) {
        const wrapper = document.createElement('span')
        wrapper.className = 'bookmark-button-wrapper'
        wrapper.appendChild(button)

        referenceElement.closest('div.flex')?.insertBefore(wrapper, referenceElement.closest('span'))
    }

    static updateBookmarkState(
        index: number,
        isBookmarked: boolean,
        languageAndContent?: { lang?: string; content?: string }
    ) {
        const accessToken = this.getAccessToken()
        if (!accessToken) return

        window.postMessage(
            {
                type: EVENTS.TOGGLE_BOOKMARK,
                payload: {
                    accessToken,
                    index,
                    isBookmarked,
                    ...languageAndContent,
                },
            },
            '*'
        )
    }

    private static getAccessToken(): Promise<string | undefined> {
        return (window as any).__reactRouterContext?.state.loaderData.root.clientBootstrap.session.accessToken
    }
}
