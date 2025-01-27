import log from '../lib/loglevel';

export class PageMode {
    private listeners: (() => void)[] = [];

    private mode: 'idle' | 'listening' | 'speaking' = 'idle';

    private selectors = {
        composer: '#composer-background',
        composerSpeachButton: '[data-testid="composer-speach-button"]',
        stopButton: '[data-testid="stop-button"]',
        sendButton: '[data-testid="send-button"]'
    }

    constructor() {
        this.onPromptCompleted = this.onPromptCompleted.bind(this);
    }

    public start() {
        this.watchForButtonChanges();
    }

    private watchForButtonChanges() {
        const composer = document.querySelector(this.selectors.composer);
        if (!composer) {
            log.error('Composer not found');
            return;
        }

        const observer = new MutationObserver(this.handleMutation);
        observer.observe(composer, {
            childList: true,
            subtree: true,
            attributes: false,
        });
    }

    private handleMutation = (mutations: MutationRecord[]) => {
        log.info('Mutation detected', { mutations });
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                // Loop through added nodes
                for (const node of mutation.addedNodes) {
                    // Check if the added node is an element and matches the desired tag
                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "div") {
                        console.log("New <div> added:", node);
                    }
                }
            }
        }
    }

    public onPromptCompleted(callback: () => void) {
        this.listeners.push(callback);
    }
}
