// bookmarks-button.ts
export class BookmarksButton extends HTMLElement {
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
    console.log('insertionPoint', insertionPoint);
    if (insertionPoint) {
      insertionPoint.insertAdjacentElement('beforebegin', button);
    } else {
      document.querySelector('.draggable.sticky.top-0')?.appendChild(button);
    }

    return button;
  }
}

export class BookmarksModal extends HTMLElement {
  bookmarksData: Record<string, {
    bookmarks: number[];
    bookmarksData: Record<string, {
      chatTitle: string;
      codeContent: string;
      codeLanguage: string;
      metadata: { name: string };
    }>;
  }> = {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.innerHTML = `
        <style>
          .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
          }
          .modal-content {
            background: var(--token-main-surface-primary, #fff);
            padding: 1rem;
            width: 700px;
            height: 80vh;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 0.5rem;
            display: flex;
            gap: 1rem;
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
            padding-left: 1rem;
          }
          .parent-item {
            padding: 0.5rem;
            cursor: pointer;
            color: var(--token-text-secondary);
            border-bottom: 1px solid var(--token-main-surface-tertiary, #eee);
          }
          .parent-item:hover {
            background: var(--token-main-surface-secondary);
          }
          .sublist {
            padding-left: 1rem;
            display: none;
          }
          .sublist-item {
            padding: 0.3rem 0;
            cursor: pointer;
            font-size: 0.9em;
            color: var(--token-text-tertiary);
          }
          .sublist-item:hover {
            color: var(--token-text-primary);
          }
          .active .sublist {
            display: block;
          }
          .code-view {
            white-space: pre-wrap;
            font-family: monospace;
            margin-top: 1rem;
            padding: 1rem;
            background: var(--token-main-surface-secondary, #f5f5f5);
            border-radius: 4px;
            color: var(--token-text-primary);
          }

          /* Syntax highlighting - light theme defaults */
          .hljs-keyword { color: #cf222e; }
          .hljs-title { color: #8250df; }
          .hljs-string { color: #0a3069; }
          .hljs-number { color: #0550ae; }
          .hljs-punctuation { color: #24292f; }
          .hljs-attr { color: #116329; }
          .hljs-comment { color: #6e7781; font-style: italic; }

          @media (prefers-color-scheme: dark) {
            .modal-content {
              background: var(--token-main-surface-primary, #1e1e1e);
              border-color: var(--token-main-surface-tertiary, #333);
            }
            .code-view {
              background: var(--token-main-surface-secondary, #252526);
            }
            .hljs-keyword { color: #ff7b72; }
            .hljs-title { color: #d2a8ff; }
            .hljs-string { color: #79c0ff; }
            .hljs-number { color: #56a4f1; }
            .hljs-punctuation { color: #8b949e; }
            .hljs-attr { color: #7ee787; }
            .hljs-comment { color: #8b949e; }
          }

          .sublist-item {
            padding: 0.3rem 0;
            cursor: pointer;
            font-size: 0.9em;
            color: var(--token-text-tertiary);
            width: 100%;
          }

          .sublist-item:hover {
            color: var(--token-text-primary);
          }

          .item-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .link-icon {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            margin: 0;
            color: currentColor;
            opacity: 0;
            transition: opacity 0.2s ease;
          }

          .sublist-item:hover .link-icon {
            opacity: 1;
          }

          .link-icon svg {
            width: 16px;
            height: 16px;
          }
        </style>
        <div class="modal">
          <div class="modal-content">
            <div class="sidebar">
              <h3>Bookmarks Structure</h3>
              <!-- Dynamic content will be inserted here -->
            </div>
            <div class="main-view">
              <h3>Code Preview</h3>
              <div class="code-view">Select an item to view code</div>
            </div>
          </div>
        </div>
      `;

    const sidebar = this.shadowRoot!.querySelector('.sidebar')!;
    sidebar.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      console.log('target', target);

      // Handle link icon clicks FIRST
      const linkIcon = target.closest('.link-icon');
      if (linkIcon) {
        console.log('123');
        // Let the icon's native click handler handle this case
        return;
      }

      // Then handle sublist item selection
      const sublistItem = target.closest('.sublist-item') as HTMLElement;
      console.log('sublistItem', sublistItem);
      if (sublistItem) {
        const codeView = this.shadowRoot!.querySelector('.code-view') as HTMLElement;
        console.log('sublistItem.dataset', sublistItem.dataset);
        const chatId = sublistItem.dataset.chatId as string;
        const data = this.bookmarksData[chatId];
        const codeBlock = data.bookmarksData[parseInt(sublistItem.dataset.bookmarkIndex as string)];
        codeView.innerHTML = codeBlock.codeContent;
        e.stopPropagation();
        return;
      }

      // Then handle parent item toggle
      const parentItem = target.closest('.parent-item');
      if (parentItem) {
        parentItem.classList.toggle('active');
        e.stopPropagation();
      }
    });

    // Modal close handler
    this.shadowRoot!.querySelector('.modal')!.addEventListener('click', (e) => {
      if (e.target === this.shadowRoot!.querySelector('.modal')) {
        this.hide();
      }
    });
  }

  // Lifecycle methods for event listeners
  connectedCallback() {
    window.addEventListener('message', this.handleWindowMessage);
  }

  disconnectedCallback() {
    window.removeEventListener('message', this.handleWindowMessage);
  }

  private handleWindowMessage = (e: MessageEvent) => {
    if (e.data.type === 'ALL_BOOKMARKS_DATA') {
      this.populateBookmarks(e.data.payload);
    }
  };

  private populateBookmarks(bookmarksData: Record<string, {
    bookmarks: number[];
    bookmarksData: Record<string, {
      chatTitle: string;
      codeContent: string;
      codeLanguage: string;
      metadata: { name: string }; // Ensure metadata exists in your data structure
    }>;
  }>) {
    this.bookmarksData = bookmarksData;

    const sidebar = this.shadowRoot!.querySelector('.sidebar')!;
    sidebar.innerHTML = '<h3>Bookmarks Structure</h3>';

    const chatGroups = new Map<string, Array<{
      chatId: string;
      bookmarks: number[];
      bookmarksData: Record<string, any>;
    }>>();

    Object.entries(bookmarksData).forEach(([chatId, chatData]) => {
      const firstBookmarkKey = chatData.bookmarks[0]?.toString();
      const chatTitle = chatData.bookmarksData?.[firstBookmarkKey]?.chatTitle || chatId;

      if (!chatGroups.has(chatTitle)) {
        chatGroups.set(chatTitle, []);
      }
      chatGroups.get(chatTitle)!.push({
        chatId,
        bookmarks: chatData.bookmarks,
        bookmarksData: chatData.bookmarksData
      });
    });

    chatGroups.forEach((chats, chatTitle) => {
      const parentItem = document.createElement('div');
      parentItem.className = 'parent-item';
      parentItem.textContent = chatTitle;

      const sublist = document.createElement('div');
      sublist.className = 'sublist';

      chats.forEach(chat => {
        chat.bookmarks.forEach(bookmarkIndex => {
          const bookmarkKey = bookmarkIndex.toString();
          const bookmark = chat.bookmarksData?.[bookmarkKey];
          if (bookmark) {
            const sublistItem = document.createElement('div');
            sublistItem.className = 'sublist-item';

            // Store URL parameters in dataset
            sublistItem.dataset.chatId = chat.chatId;
            sublistItem.dataset.bookmarkIndex = bookmarkKey;

            // Item container with flex layout
            const itemContainer = document.createElement('div');
            itemContainer.className = 'item-container';

            // Item text
            const itemText = document.createElement('span');
            itemText.className = 'item-text';
            itemText.textContent = bookmark.metadata.name;

            // Link icon button
            const iconButton = document.createElement('button');
            iconButton.className = 'link-icon';
            iconButton.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" 
                      stroke="currentColor" 
                      stroke-width="1.5" 
                      stroke-linecap="round" 
                      stroke-linejoin="round"/>
              </svg>
            `;

            // Add click handler for navigation
            iconButton.addEventListener('click', (e) => {
              e.stopPropagation();
              const chatId = sublistItem.dataset.chatId;
              const bookmarkIndex = sublistItem.dataset.bookmarkIndex;
              if (chatId && bookmarkIndex) {
                const url = `/c/${chatId.split('chat-')[1]}`;
                // send message to background to open chat
                window.postMessage({
                  type: 'OPEN_CHAT',
                  payload: { chatId, bookmarkIndex, url }
                }, '*');

                this.hide();
              }
            });

            // Assemble components
            itemContainer.appendChild(itemText);
            itemContainer.appendChild(iconButton);
            sublistItem.appendChild(itemContainer);
            sublist.appendChild(sublistItem);
          }
        });
      });

      parentItem.appendChild(sublist);
      sidebar.appendChild(parentItem);
    });
  }

  show() {
    window.postMessage({
      type: 'GET_ALL_BOOKMARKS'
    }, '*');

    (this.shadowRoot!.querySelector('.modal')! as HTMLElement).style.display = 'block';
  }

  hide() {
    (this.shadowRoot!.querySelector('.modal')! as HTMLElement).style.display = 'none';
  }
}