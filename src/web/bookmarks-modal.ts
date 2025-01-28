// src/components/bookmarks-modal/bookmarks-modal.ts
import { html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { BaseElement } from './base'

@customElement('bookmarks-modal')
export class BookmarksModal extends BaseElement {
    static styles = css`
        .modal {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }

        .modal-content {
            background: var(--token-main-surface-primary, #fff);
            width: 900px;
            height: 70vh;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 0.5rem;
            display: flex;
            color: var(--token-text-primary);
            border: 1px solid var(--token-main-surface-tertiary);
        }

        .sidebar {
            width: 200px;
            border-right: 1px solid var(--token-main-surface-tertiary);
            overflow-y: auto;
        }

        .main-view {
            flex: 1;
            max-width: 500px;
            overflow: auto;
        }

        .code-view {
            white-space: pre-wrap;
            font-family: monospace;
            padding: 1rem;
            background: var(--token-main-surface-secondary, #f5f5f5);
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
            .modal-content {
                background: var(--token-main-surface-primary, #1e1e1e);
                border-color: var(--token-main-surface-tertiary, #333);
            }

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
    private selectedCodeContent = ''

    @state()
    private expandedGroups = new Set<string>()

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

    private toggleGroup(groupTitle: string) {
        this.debug('Toggle group:', groupTitle)

        const newExpanded = new Set(this.expandedGroups)
        newExpanded.has(groupTitle) ? newExpanded.delete(groupTitle) : newExpanded.add(groupTitle)
        this.expandedGroups = newExpanded
    }

    private selectBookmark(chatId: string, bookmarkId: number) {
        this.debug('Show bookmark content:', chatId, bookmarkId)
        const bookmark = this.bookmarksData[chatId].bookmarks[bookmarkId]

        if (bookmark?.content) {
            this.selectedCodeContent = bookmark?.content
        } else {
            this.selectedCodeContent = 'Content not available'
            this.error('Bookmark content not available', bookmark)
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
        return html`
            <div class="modal" ?hidden=${!this.isOpen} @click=${this.handleBackgroundClick} @close-modal=${this.hide}>
                <div class="modal-content" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="sidebar">
                        ${chatKeys.map(
                            chatId => html`
                                <bookmark-group
                                    .chatId=${chatId}
                                    .title=${this.bookmarksData[chatId].title}
                                    .bookmarks=${this.bookmarksData[chatId].bookmarks}
                                    .expanded=${this.expandedGroups.has(chatId)}
                                    @group-toggled=${() => this.toggleGroup(chatId)}
                                    @bookmark-selected=${(e: CustomEvent) =>
                                        this.selectBookmark(e.detail.chatId, e.detail.bookmarkId)}
                                ></bookmark-group>
                            `
                        )}
                    </div>

                    <div class="main-view">
                        <div class="code-view">${unsafeHTML(this.selectedCodeContent)}</div>
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
