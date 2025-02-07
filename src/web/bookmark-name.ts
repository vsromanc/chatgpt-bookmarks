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

    static inject(index: number, name: string, lang: string) {
        const blocks = document.querySelectorAll('pre')
        const selectedBlock = blocks[index]
        invariant(selectedBlock, 'Selected block not found')

        const bookmarkName = document.createElement('bookmark-name') as BookmarkName
        bookmarkName.bookmarkIndex = index
        bookmarkName.name = name
        bookmarkName.lang = lang

        const langDiv = document.evaluate(
            `(//pre)[${index + 1}]/div/div`,
            selectedBlock,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue as HTMLDivElement
        invariant(langDiv, 'Language div not found')

        langDiv.replaceChildren(bookmarkName)
        this.highlightBlock(selectedBlock)
    }

    static highlightBlock(block: HTMLPreElement) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        if (darkModeQuery.matches) {
            block.style.border = '1px solid #777'
        } else {
            block.style.border = '1px solid #858585'
        }

        function handleColorSchemeChange(event: MediaQueryListEvent) {
            if (event.matches) {
                block.style.border = '1px solid #777'
            } else {
                block.style.border = '1px solid #858585'
            }
        }

        // Modern browsers support addEventListener on MediaQueryList
        darkModeQuery.addEventListener('change', handleColorSchemeChange)
    }
}
