import log from '../lib/loglevel'

type PromptState = 'generating' | 'completed'

export class PromptStateObserver {
    private listeners: ((testId: PromptState) => void)[] = []
    private selectors = {
        composer: '#composer-background',
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

        this.submitButtonObserver = new MutationObserver(this.handleSubmitButtonMutation)
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
                        if (testId === 'send-button') {
                            log.debug('Observing send button', new Date().toISOString())
                            this.submitButtonObserver?.observe(button, {
                                attributes: true,
                            })
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
