import { LitElement } from 'lit';
import log from '../lib/loglevel';

export class BaseElement extends LitElement {
    get componentName() {
        return this.tagName.toLowerCase();
    }

    log(message: string) {
        log.debug(`[${this.componentName}] ${message}`);
    }

    error(message: string) {
        log.error(`[${this.componentName}] ${message}`);
    }

    connectedCallback() {
        super.connectedCallback();
        this.log('Connected to DOM');
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // this.log('Disconnected from DOM');
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
