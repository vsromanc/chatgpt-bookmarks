import { LitElement } from 'lit';
import log from '../lib/loglevel';

export class BaseElement extends LitElement {
    get componentName() {
        return this.tagName.toLowerCase();
    }

    log(...args: any[]) {
        log.info(`[${this.componentName}]`, ...args);
    }

    debug(...args: any[]) {
        log.debug(`[${this.componentName}]`, ...args);
    }

    error(...args: any[]) {
        log.error(`[${this.componentName}]`, ...args);
    }

    connectedCallback() {
        super.connectedCallback();
        this.debug('Connected to DOM');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.debug('Disconnected from DOM');
    }

    dispatch<T>(
        eventName: string,
        detail?: T,
        options: CustomEventInit = {
            bubbles: true,
            composed: true,
            cancelable: true
        }
    ) {
        const event = new CustomEvent(eventName, {
            ...options,
            detail
        });
        this.dispatchEvent(event);
        return event;
    }
}
