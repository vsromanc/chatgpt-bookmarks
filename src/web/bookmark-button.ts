// bookmark-button.ts
export class BookmarkButton extends HTMLElement {
    private preElement: HTMLElement | null = null;
    private isBookmarked = false;
    private index: number = 0;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Enable Shadow DOM for encapsulation
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', this.handleClick);
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.handleClick);
    }

    private async handleClick() {
        this.isBookmarked = !this.isBookmarked;
        this.updateButtonText();

        const code = this.closest('pre')?.querySelector('code');
        if (code) {
            const codeLanguage = Array.from(code.classList).find(className => className.startsWith('language-'));
            const codeContent = code.innerHTML;

            this.dispatchEvent(new CustomEvent('toggle', {
                detail: { isBookmarked: this.isBookmarked, index: this.index, codeLanguage, codeContent, accessToken: await this.getAccessToken() },
                bubbles: true,
                composed: true
            }));
        }
    }

    private async getAccessToken() {
        const accessToken = (window as any).__reactRouterContext.state.loaderData.root.clientBootstrap.session.accessToken as string;
        return accessToken;
    }

    private updateButtonText() {
        const button = this.shadowRoot!.querySelector('button');
        if (button) {
            button.textContent = this.isBookmarked ? '✓ Bookmarked' : '⭐ Bookmark';
        }
    }

    private render() {
        this.shadowRoot!.innerHTML = `
            <style>
                button {
                    border: none;
                    background-color: transparent;
                    background-image: none;
                    cursor: pointer;
                    color: #5d5d5d;
                }
            </style>
            <button>${this.isBookmarked ? '✓ Bookmarked' : '⭐ Bookmark'}</button>
        `;
    }

    // Setter for the associated <pre> element
    setPreElement(preElement: HTMLElement) {
        this.preElement = preElement;
    }

    static initialize() {
        customElements.define('bookmark-button', BookmarkButton);
    }

    // Static method to add the bookmark button to a code block
    static addToCodeBlock(preElement: HTMLElement, index: number, isBookmarked: boolean) {
        // Check if the button already exists
        if (preElement.previousElementSibling?.querySelector('bookmark-button')) {
            return;
        }

        // Find the copy button within the container
        const copyButton = preElement.querySelector('button[aria-label="Copy"]');
        if (!copyButton) {
            return;
        }

        // Create a span to wrap the bookmark button
        const bookmarkButtonWrapper = document.createElement('span');
        bookmarkButtonWrapper.classList.add('bookmark-button-wrapper');

        // Create and append the bookmark button
        const bookmarkButton = document.createElement('bookmark-button') as BookmarkButton;
        bookmarkButton.index = index;
        bookmarkButton.isBookmarked = isBookmarked;
        bookmarkButton.classList.add(...Array.from(copyButton.classList));
        bookmarkButton.updateButtonText();
        bookmarkButtonWrapper.appendChild(bookmarkButton);

        // Insert the bookmark button wrapper before the copy button
        copyButton.closest('div.flex')?.insertBefore(bookmarkButtonWrapper, copyButton.closest('span'));

        return bookmarkButton
    }
}
