// src/components/bookmark-group.ts
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('bookmark-group')
export class BookmarkGroup extends LitElement {
    static styles = css`
        .parent-item {
            padding: 0.5rem;
            cursor: pointer;
            color: var(--token-text-secondary);
            transition: background 0.2s ease;
        }

        .parent-item:hover {
            background: var(--token-main-surface-secondary);
        }

        .parent-item > .title {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.5rem;
            margin: 0;
        }

        .sublist {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }

        .parent-item.expanded .sublist {
            max-height: 1000px;
        }

        .single-line {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `

    @property({ type: String }) activeChatId = ''
    @property({ type: String }) activeBookmarkIndex = ''
    @property({ type: String }) chatId = ''
    @property({ type: String }) title = ''
    @property({ type: Boolean }) expanded = false
    @property({ type: Array }) bookmarks: {
        [key: string]: {
            lang: string
            content: string
            metadata: any
        }
    } = {}

    render() {
        const bookmarkIndexes = Object.keys(this.bookmarks)
        return html`
            <div
                class="parent-item single-line ${this.expanded ? 'expanded' : ''} ${this.activeChatId === this.chatId
                    ? 'active'
                    : ''}"
                @click=${this.toggle}
            >
                <h3 class="title">${this.title}</h3>
                <div class="sublist">
                    ${bookmarkIndexes.map(bookmarkIndex => {
                        return html`
                            <bookmark-item
                                .bookmark=${this.bookmarks[bookmarkIndex]}
                                .chatId=${this.chatId}
                                .bookmarkIndex=${bookmarkIndex}
                                .active=${this.activeChatId === this.chatId &&
                                this.activeBookmarkIndex === bookmarkIndex}
                            ></bookmark-item>
                        `
                    })}
                </div>
            </div>
        `
    }

    private toggle() {
        this.dispatchEvent(new CustomEvent('group-toggled', { detail: this.title }))
    }
}
