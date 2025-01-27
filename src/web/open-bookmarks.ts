import { html, css } from 'lit'
import { customElement } from 'lit/decorators.js'
import { BaseElement } from './base'

@customElement('open-bookmarks-button')
export class OpenBookmarksButton extends BaseElement {
    static styles = css`
        .btn {
            all: unset;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 8px;
            background: rgba(var(--token-main-surface-secondary-rgb), 0.1);
            border: 1px solid var(--token-main-surface-tertiary);
            color: var(--token-text-secondary);
            transition: all 0.2s ease;
            font-size: 0.875rem;
            position: relative;
            margin-right: 12px;
        }

        .btn:hover {
            background: rgba(var(--token-main-surface-secondary-rgb), 0.2);
            border-color: var(--token-text-tertiary);
        }

        .icon {
            width: 16px;
            height: 16px;
            color: currentColor;
        }

        .text-container {
            position: relative;
            display: inline-block;
        }

        .badge {
            /* Keep the styling that you need for your badge here, if any. */
        }
    `

    render() {
        return html`
            <button class="btn" part="button">
                <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V22L12 18.5L5 22V4Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    ></path>
                </svg>
                <span class="text-container">
                    Bookmarks
                    <div class="badge"></div>
                </span>
            </button>
        `
    }

    /**
     * Injection helper to place this button in the DOM
     */
    static injectButton() {
        // Create an instance of this element
        const button = document.createElement('open-bookmarks-button')

        // Attempt insertion before the share button or profile button
        const shareButton = document.querySelector('[data-testid="share-chat-button"]')
        const profileButton = document.querySelector('[data-testid="profile-button"]')

        const insertionPoint = shareButton ?? profileButton
        if (insertionPoint) {
            insertionPoint.insertAdjacentElement('beforebegin', button)
        } else {
            // Fallback insertion
            document.querySelector('.draggable.sticky.top-0')?.appendChild(button)
        }

        return button
    }
}
