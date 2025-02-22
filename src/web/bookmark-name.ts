import { html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BaseElement } from './base'
import { EVENTS } from '../glossary'
import { invariant } from 'outvariant'

@customElement('bookmark-name')
export class BookmarkName extends BaseElement {
    static styles = css``

    @property({ type: Number }) bookmarkIndex = -1
    @property({ type: String }) name = ''
    @property({ type: String }) lang = ''

    createRenderRoot() {
        return this
    }

    render() {
        return html`<span>✏️ ${this.name}</span>`
    }

    static getLanguageDiv(index: number) {
        const blocks = document.querySelectorAll('pre')
        const selectedBlock = blocks[index]

        const langDiv = document.evaluate(
            `(//pre)[${index + 1}]/div/div`,
            selectedBlock,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue as HTMLDivElement
        invariant(langDiv, 'Language div not found')
        return langDiv
    }

    static inject(index: number, name: string, lang: string) {
        const langDiv = this.getLanguageDiv(index)

        const bookmarkName = document.createElement('bookmark-name') as BookmarkName
        bookmarkName.bookmarkIndex = index
        bookmarkName.name = name
        bookmarkName.lang = lang

        langDiv.replaceChildren(bookmarkName)
    }

    static reset(index: number) {
        const langDiv = this.getLanguageDiv(index)
        langDiv.replaceChildren()
    }
}
