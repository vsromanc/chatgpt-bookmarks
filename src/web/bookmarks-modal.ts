// src/components/bookmarks-modal/bookmarks-modal.ts
import { html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { BaseElement } from './base'

@customElement('bookmarks-modal')
export class BookmarksModal extends BaseElement {
    static styles = css`
        :host {
            --token-main-surface-primary: #fff;
            --token-text-primary: #000;
            --token-main-surface-tertiary: #e0e0e0;
            --token-main-surface-secondary: #f5f5f5;
        }
        @media (prefers-color-scheme: dark) {
            :host {
                /* Dark mode overrides */
                --token-main-surface-primary: #1e1e1e;
                --token-main-surface-tertiary: #333;
                --token-main-surface-secondary: #252526;
                --token-text-primary: #fff;
            }
        }

        .modal {
            position: fixed;
            inset: 0;
            z-index: 1000;
        }

        .modal-content {
            background: var(--sidebar-surface-primary);
            width: 900px;
            height: 70vh;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 0.5rem;
            display: flex;
            color: var(--token-text-primary);
            overflow: hidden;
        }

        .sidebar {
            width: 200px;
            border-right: 1px solid var(--token-main-surface-tertiary);
            overflow-y: auto;
        }

        .main-view {
            flex: 1;
            overflow: auto;
            display: flex;
        }

        .code-view {
            flex-grow: 1;
            white-space: pre-wrap;
            font-family: monospace;
            padding: 1rem;
            border-radius: 4px;
            color: var(--token-text-primary);
        }

        /* Syntax highlighting */
        .hljs-keyword {
            color: #cf222e;
        }
        .hljs-title {
            color: #8250df;
        }
        .hljs-string {
            color: #0a3069;
        }
        .hljs-number {
            color: #0550ae;
        }
        .hljs-punctuation {
            color: #24292f;
        }
        .hljs-attr {
            color: #116329;
        }
        .hljs-comment {
            color: #6e7781;
            font-style: italic;
        }

        @media (prefers-color-scheme: dark) {
            .code-view {
                background: var(--token-main-surface-secondary, #252526);
            }

            .hljs-keyword {
                color: #ff7b72;
            }
            .hljs-title {
                color: #d2a8ff;
            }
            .hljs-string {
                color: #79c0ff;
            }
            .hljs-number {
                color: #56a4f1;
            }
            .hljs-punctuation {
                color: #8b949e;
            }
            .hljs-attr {
                color: #7ee787;
            }
            .hljs-comment {
                color: #8b949e;
            }
        }
    `

    @property({ type: Object })
    bookmarksData: {
        [chatId: string]: {
            title: string
            bookmarks: {
                [key: string]: {
                    lang: string
                    content: string
                    metadata: any
                }
            }
        }
    } = {}

    @state()
    private isOpen = false

    @state()
    private selected: {
        chatId: string
        bookmarkIndex: number
    } | null = null

    connectedCallback() {
        super.connectedCallback()
        window.addEventListener('message', this.handleWindowMessage)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('message', this.handleWindowMessage)
    }

    private handleWindowMessage = (event: MessageEvent) => {
        if (event.data.type === 'ALL_BOOKMARKS_DATA') {
            this.bookmarksData = event.data.payload
            this.requestUpdate()
        }
    }


    private selectBookmark(chatId: string, bookmarkIndex: number) {
        this.selected = {
            chatId,
            bookmarkIndex,
        }
    }

    private handleBackgroundClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            this.debug('Modal background clicked. Hiding modal')
            this.hide()
        }
    }

    render() {
        const chatKeys = Object.keys(this.bookmarksData)
        const selectedBookmark = this.selected?.chatId
            ? this.bookmarksData[this.selected.chatId].bookmarks[this.selected.bookmarkIndex]
            : null

        const modalCss = 'modal-content focus:outline-none overflow-hidden h-[100%] md:max-h-[600px] md:min-h-[600px] md:max-w-[800px]';
        return html`
            ${unsafeHTML(this.getRootCss()?.outerHTML)}
            <div class="modal bg-black/50" ?hidden=${!this.isOpen} @click=${this.handleBackgroundClick} @close-modal=${this.hide}>
                <div class="${modalCss}" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="sidebar">
                        ${chatKeys.map(
            chatId => html`
                                <bookmark-group
                                    .activeChatId=${this.selected?.chatId}
                                    .activeBookmarkIndex=${this.selected?.bookmarkIndex}
                                    .chatId=${chatId}
                                    .title=${this.bookmarksData[chatId].title}
                                    .bookmarks=${this.bookmarksData[chatId].bookmarks}
                                    @bookmark-selected=${(e: CustomEvent) =>
                    this.selectBookmark(e.detail.chatId, e.detail.bookmarkId)}
                                ></bookmark-group>
                            `
        )}
                    </div>

                    <div class="main-view">
                        <div class="code-view">${unsafeHTML(selectedBookmark?.content)}</div>
                    </div>
                </div>
            </div>
        `
    }

    show() {
        this.log('Show bookmarks modal')
        window.postMessage({ type: 'GET_ALL_BOOKMARKS' }, '*')
        this.isOpen = true
    }

    hide() {
        this.isOpen = false
    }
}
