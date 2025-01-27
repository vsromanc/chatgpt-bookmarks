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

        .sublist {
            padding-left: 1rem;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }

        .parent-item.active .sublist {
            max-height: 1000px;
        }

        .single-line {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `

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
            <div class="parent-item single-line ${this.expanded ? 'active' : ''}" @click=${this.toggle}>
                ${this.title}
                <div class="sublist">
                    ${bookmarkIndexes.map(
                        bookmarkIndex => html`
                            <bookmark-item
                                .bookmark=${this.bookmarks[bookmarkIndex]}
                                .chatId=${this.chatId}
                                .bookmarkIndex=${bookmarkIndex}
                            ></bookmark-item>
                        `
                    )}
                </div>
            </div>
        `
    }

    private toggle() {
        this.dispatchEvent(new CustomEvent('group-toggled', { detail: this.title }))
    }
}
