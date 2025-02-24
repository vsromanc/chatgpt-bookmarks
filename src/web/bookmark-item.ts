import { html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BaseElement } from './base'
import { EVENTS } from '../glossary'

@customElement('bookmark-item')
export class BookmarkItem extends BaseElement {
    static styles = css`
        :host {
            /* Interactive states */
            --item-active: var(--sidebar-surface-tertiary);
            --item-hover: var(--sidebar-surface-secondary);
        }

        .sublist-item {
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.9em;
            color: var(--text-primary);
        }

        .sublist-item.active {
            background-color: var(--item-active);
        }
        .sublist-item:hover {
            background-color: var(--item-hover);
        }

        .item-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;
        }

        .link-icon {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            opacity: 0;
            transition: opacity 0.2s ease;
            color: currentColor;
        }

        .sublist-item:hover .link-icon {
            opacity: 1;
        }
    `

    @property({ type: Boolean }) active!: boolean
    @property({ type: Object }) bookmark!: any
    @property({ type: String }) chatId = ''
    @property({ type: Number }) bookmarkIndex = -1

    render() {
        return html`
            <div class="sublist-item ${this.active ? 'active' : ''}" @click=${this.handleClick}>
                <div class="item-container">
                    <span class="item-text">${this.bookmark?.metadata?.name}</span>
                    <button class="link-icon" @click=${this.handleOpenChat}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        `
    }

    private handleClick(e: Event) {
        e.stopPropagation()
        this.debug('Bookmark item clicked', this.chatId, this.bookmarkIndex)

        this.dispatchEvent(
            new CustomEvent('bookmark-selected', {
                detail: {
                    chatId: this.chatId,
                    bookmarkId: this.bookmarkIndex,
                },
                bubbles: true, // Allow event to bubble up
                composed: true, // Cross shadow DOM boundary
            })
        )
    }

    private handleOpenChat(e: Event) {
        e.stopPropagation()
        const url = `/c/${this.chatId}`
        this.log('Open chat', url)

        window.postMessage(
            {
                type: EVENTS.OPEN_CHAT,
                payload: {
                    chatId: this.chatId,
                    bookmarkIndex: this.bookmarkIndex,
                    url,
                },
            },
            '*'
        )

        this.dispatchEvent(
            new CustomEvent('close-modal', {
                bubbles: true, // Important for event propagation
                composed: true, // Cross shadow DOM boundaries
            })
        )
    }
}
