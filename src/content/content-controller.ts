import { extractCodeBlocks, CodeBlock, hasCodeBlocks } from './code-extractor';
import { extractSidebarTitle } from './title-extractor';
import { StorageService } from '../common/storage-service';
import { extractChatId } from '../common/url-utils';
import { sendMessage } from '../common/communication';
import { scrollAndHighlight } from '../web/misc';

export class ContentController {
    private lastSentHash = '';
    private observer: MutationObserver;

    constructor() {
        this.observer = new MutationObserver(this.handleMutation);
    }

    public async initialize() {
        await this.injectWebScript();
        this.sendUpdate();
        this.startObserving();
        this.addEventListeners();
    }

    private injectWebScript() {
        return new Promise<void>((resolve, reject) => {
            if (!document.getElementById('code-nav-script')) {
                const script = document.createElement('script');
                script.id = 'code-nav-script';
                script.src = chrome.runtime.getURL('dist/web.js');
                script.onload = () => {
                    script.remove();
                    resolve();
                }
                script.onerror = (error) => {
                    reject(error);
                }
                (document.head || document.documentElement).appendChild(script);
            } else {
                resolve();
            }
        });
    }

    private sendUpdate = async () => {
        const chatId = extractChatId();
        if (!chatId) return;

        if (!hasCodeBlocks()) {
            this.sendClearState();
            return;
        }


        const bookmarks = await StorageService.getBookmarks(chatId);
        const blocks = extractCodeBlocks();
        const currentHash = this.generateHash(blocks);

        if (currentHash !== this.lastSentHash) {
            blocks.forEach((b, index) => {
                b.element.setAttribute('data-code-index', index.toString());
            });

            window.postMessage({
                type: 'CODE_BLOCKS_UPDATE',
                payload: {
                    blocks: blocks.map(b => ({
                        title: b.title,
                        language: b.language,
                        index: b.index
                    })),
                    bookmarks,
                    title: extractSidebarTitle()
                }
            }, '*');

            this.lastSentHash = currentHash;
        }
    }

    private sendClearState() {
        if (this.lastSentHash !== '') {
            window.postMessage({
                type: 'CODE_BLOCKS_CLEAR'
            }, '*');
            this.lastSentHash = '';
        }
    }

    private generateHash(blocks: CodeBlock[]): string {
        return blocks.map((b, index) =>
            `${index}|${b.title}|${b.language}`
        ).join('#');
    }

    private handleMutation = (mutations: MutationRecord[]) => {
        const hasRelevantChange = mutations.some(mutation =>
            mutation.addedNodes.length > 0 ||
            mutation.removedNodes.length > 0 ||
            (mutation.type === 'attributes' &&
                mutation.target instanceof Element &&
                mutation.target.matches('pre, h1, h2, h3, h4, h5, h6, code'))
        );

        if (hasRelevantChange) this.sendUpdate();
    }

    private startObserving() {
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'id']
        });
    }

    private addEventListeners() {
        window.addEventListener('load', this.sendUpdate.bind(this));
        window.addEventListener('scroll', this.sendUpdate.bind(this));
        window.addEventListener('message', this.handleWindowMessage.bind(this));

        chrome.runtime.onMessage.addListener((request) => {
            if (request.type === 'NAVIGATE_TO_CODE_BLOCK') {
                // navigate to code block
                console.log('NAVIGATE_TO_CODE_BLOCK', request.payload);
                const pre = document.querySelector(`pre[data-code-index="${request.payload.bookmarkIndex}"]`);
                scrollAndHighlight(pre as HTMLElement);
                console.log('pre', pre);
            }
        });
    }

    private async inferMetadata(codeContent: string, accessToken: string) {
        const resp = await fetch('https://chatgpt.com/backend-api/conversation/textdocs/infer_metadata', {
            method: 'POST',
            body: JSON.stringify({
                content: codeContent,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return await resp.json();
    }

    private async handleWindowMessage(event: MessageEvent) {
        if (event.source === window && event.data.type === 'TOGGLE_BOOKMARK') {
            const isBookmarked = event.data.payload.isBookmarked;
            const index = event.data.payload.index;

            const chatId = extractChatId();
            if (!chatId) return;

            const chatTitle = extractSidebarTitle();

            const metadata = await this.inferMetadata(event.data.payload.codeContent, event.data.payload.accessToken);

            console.log('metadata', metadata);

            StorageService.toggleBookmark(chatId, index, { isBookmarked, codeLanguage: event.data.payload.codeLanguage, codeContent: event.data.payload.codeContent, chatTitle, metadata })
                .catch(console.error);
        } else if (event.source === window && event.data.type === 'GET_ALL_BOOKMARKS') {
            const bookmarks = await StorageService.getAllBookmarks();
            window.postMessage({
                type: 'ALL_BOOKMARKS_DATA',
                payload: bookmarks
            }, '*');
        } else if (event.source === window && event.data.type === 'OPEN_CHAT') {
            const chatId = event.data.payload.chatId;
            const bookmarkIndex = event.data.payload.bookmarkIndex;
            const url = event.data.payload.url;

            const reply = await chrome.runtime.sendMessage({
                type: 'OPEN_CHAT',
                payload: { chatId, bookmarkIndex, url }
            });
            if (reply.status === 'received') {
                const href = `/c/${chatId.split('chat-')[1]}`;
                const sidebarTag = document.querySelector(`a[href="${href}"]`);
                if (sidebarTag) {
                    (sidebarTag as HTMLElement).click();
                }
            }
        }
    }

    private cleanup() {
        this.observer.disconnect();
        window.removeEventListener('load', this.sendUpdate.bind(this));
        window.removeEventListener('scroll', this.sendUpdate.bind(this));
        window.removeEventListener('message', this.handleWindowMessage.bind(this));
    }
}