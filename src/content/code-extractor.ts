export interface CodeBlock {
    title: string
    language: string
    index: number
    element: HTMLElement
}

export function hasCodeBlocks(): boolean {
    return document.querySelectorAll('pre').length > 0
}

export function extractCodeBlockTitle(preElement: HTMLPreElement): string {
    let title = `Code Block ${Array.from(document.querySelectorAll('pre')).indexOf(preElement) + 1}`
    let el: Element | null = preElement.previousElementSibling

    while (el) {
        if (el.matches('h1, h2, h3, h4, h5, h6')) {
            const codeElement = el.querySelector('code')
            const rawText = codeElement?.textContent?.trim() || el.textContent?.trim() || title

            title = rawText
                .replace(/^\d+\.\s*/, '')
                .replace(/\(([^)]+)\)$/, '$1')
                .replace(/<[^>]+>/g, '')
                .replace(/^[^a-zA-Z0-9]+/, '')
                .replace(/[^a-zA-Z0-9]+$/, '')
            break
        }
        el = el.previousElementSibling
    }

    return title
}

export function detectCodeLanguage(preElement: HTMLPreElement): string {
    const container = preElement.closest('.contain-inline-size')
    if (container) {
        const header = container.querySelector(
            '.flex.items-center.text-token-text-secondary.px-4.py-2.text-xs.font-sans'
        )
        if (header) {
            const lang = header.textContent?.trim().toLowerCase()
            if (lang && lang !== 'copy') return lang
        }
    }

    const preClassLang = Array.from(preElement.classList).find(c => c.startsWith('language-'))
    if (preClassLang) return preClassLang.split('-')[1]

    const codeElement = preElement.querySelector('code')
    const codeClassLang = Array.from(codeElement?.classList || []).find(c => c.startsWith('language-'))
    if (codeClassLang) return codeClassLang.split('-')[1]

    if (codeElement) {
        const firstLine = codeElement.textContent?.split('\n')[0] || ''
        const shebangMatch = firstLine.match(/^#!.*\/(\w+)/)
        if (shebangMatch) return shebangMatch[1]
    }

    return 'unknown'
}

export function extractCodeBlocks(): CodeBlock[] {
    return Array.from(document.querySelectorAll('pre')).map((pre, index) => ({
        title: extractCodeBlockTitle(pre),
        language: detectCodeLanguage(pre),
        element: pre,
        index,
    }))
}
