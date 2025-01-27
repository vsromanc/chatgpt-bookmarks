export class OpenBookmarksButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
          <style>
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
    
            .text-container {
              position: relative;
              display: inline-block;
            }
    
            .icon {
              width: 16px;
              height: 16px;
              color: currentColor;
            }
    
            .label {
              position: relative;
            }
          </style>
          <button class="btn" part="button">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V22L12 18.5L5 22V4Z" 
                    stroke="currentColor" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
            <span class="text-container">
              Bookmarks
              <div class="badge"></div>
            </span>
          </button>
        `;
  }

  static injectButton() {
    const button = document.createElement('open-bookmarks-modal');

    // Find the best insertion point using stable selectors
    const shareButton = document.querySelector('[data-testid="share-chat-button"]');
    const profileButton = document.querySelector('[data-testid="profile-button"]');

    const insertionPoint = shareButton ?? profileButton;
    if (insertionPoint) {
      insertionPoint.insertAdjacentElement('beforebegin', button);
    } else {
      document.querySelector('.draggable.sticky.top-0')?.appendChild(button);
    }

    return button;
  }
}