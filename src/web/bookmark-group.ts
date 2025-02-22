// src/components/bookmark-group.ts
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('bookmark-group')
export class BookmarkGroup extends LitElement {
    static styles = css`
        .parent-item {
            padding: 0.5rem;
            cursor: pointer;
        }

        .parent-item > .title {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.5rem;
            margin: 0;
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
                class="parent-item single-line ${this.activeChatId === this.chatId
                    ? 'active'
                    : ''}"
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
}
