import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('bookmark-item')
export class BookmarkItem extends LitElement {
  static styles = css`
    .sublist-item {
      padding: 0.3rem 0;
      cursor: pointer;
      font-size: 0.9em;
      color: var(--token-text-tertiary);
      transition: color 0.2s ease;
    }

    .sublist-item:hover {
      color: var(--token-text-primary);
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
  `;

  @property({ type: Object }) bookmark!: any;
  @property({ type: String }) chatId = '';
  @property({ type: Number }) bookmarkId = -1;

  render() {
    return html`
      <div class="sublist-item" @click=${this.handleClick}>
        <div class="item-container">
          <span class="item-text">${this.bookmark?.metadata?.name}</span>
          <button class="link-icon" @click=${this.handleOpenChat}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" 
                    stroke="currentColor" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  // bookmark-item.ts
  private handleClick(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('bookmark-selected', {
      detail: {
        chatId: this.chatId,
        bookmarkId: this.bookmarkId
      },
      bubbles: true, // Allow event to bubble up
      composed: true // Cross shadow DOM boundary
    }));
  }

  private handleOpenChat(e: Event) {
    e.stopPropagation();

    window.postMessage({
      type: 'OPEN_CHAT',
      payload: {
        chatId: this.chatId,
        bookmarkIndex: this.bookmarkId,
        url: `/c/${this.chatId.split('chat-')[1]}`
      }
    }, '*');

    this.dispatchEvent(new CustomEvent('close-modal', {
      bubbles: true,    // Important for event propagation
      composed: true    // Cross shadow DOM boundaries
    }));
  }
}
