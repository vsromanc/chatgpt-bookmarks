import log from '../lib/loglevel'

type PromptState = 'generating' | 'completed'

export class PromptStateObserver {
    private listeners: ((testId: PromptState) => void)[] = []
    private selectors = {
        composer: '#composer-background',
        submitButton: '[data-testid="send-button"]',
    }

    private submitButtonObserver: MutationObserver | null = null

    constructor() {
        this.onStateChanged = this.onStateChanged.bind(this)
    }

    public start() {
        this.watchForButtonChanges()
    }

    private watchForButtonChanges() {
        const composer = document.querySelector(this.selectors.composer)
        if (!composer) {
            log.error('Composer not found')
            return
        }

        const observer = new MutationObserver(this.handleMutation)
        observer.observe(composer, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false,
        })

        const submitButton = document.querySelector(this.selectors.submitButton)
        if (submitButton) {
            log.debug('Send button already exists. Watch for streaming state')
            this.submitButtonObserver = new MutationObserver(this.handleSubmitButtonMutation)
            this.submitButtonObserver?.observe(submitButton, {
                attributes: true,
            })
        }
    }

    private initSubmitButtonObserver(button: HTMLButtonElement) {
        const submitButton = button || document.querySelector(this.selectors.submitButton)
        if (submitButton && !this.submitButtonObserver) {
            log.debug('Send button already exists. Watch for streaming state')
            this.submitButtonObserver = new MutationObserver(this.handleSubmitButtonMutation)
            this.submitButtonObserver?.observe(submitButton, {
                attributes: true,
            })
        }
    }

    private handleSubmitButtonMutation = (mutations: MutationRecord[]) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-testid') {
                const button = mutation.target as HTMLButtonElement
                const testId = button.getAttribute('data-testid')
                if (testId === 'stop-button') {
                    log.info('Streaming started', new Date().toISOString())
                    this.listeners.forEach(listener => listener('generating'))
                }
            }
        }
    }

    private handleMutation = (mutations: MutationRecord[]) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BUTTON') {
                        const button = node as HTMLButtonElement
                        const testId = button.getAttribute('data-testid')
                        if (testId === 'send-button' && !this.submitButtonObserver) {
                            log.debug('Send button added. Watch for streaming state')
                            this.initSubmitButtonObserver(button)
                        }
                    }
                })
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'BUTTON') {
                        const button = node as HTMLButtonElement
                        const testId = button.getAttribute('data-testid')
                        if (testId === 'stop-button') {
                            log.info('Streaming stopped', new Date().toISOString())

                            this.submitButtonObserver?.disconnect()
                            this.submitButtonObserver = null
                            this.listeners.forEach(listener => listener('completed'))
                        }
                    }
                })
            }
        }
    }

    public onStateChanged(callback: (state: PromptState) => void) {
        this.listeners.push(callback)
    }
}
