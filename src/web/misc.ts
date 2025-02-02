import log from '../lib/loglevel'
import { SCROLL_OPTIONS } from '../glossary'

interface ScrollOptions {
    behavior?: ScrollBehavior
    extraOffset?: number
}

function getVerticalOffset(element: HTMLElement, container: HTMLElement): number {
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    return elementRect.top - containerRect.top
}

function getHeaderHeight(element: HTMLElement): number {
    const header = element?.closest('article')?.parentElement?.firstElementChild
    return header?.getBoundingClientRect().height || SCROLL_OPTIONS.DEFAULT_MARGIN
}

async function smoothScrollToPosition(container: HTMLElement, targetPosition: number, options: ScrollOptions = {}) {
    const startTime = performance.now()

    container.scrollTo({
        top: targetPosition,
        behavior: options.behavior || 'smooth',
    })

    try {
        await waitForScrollEnd(container)
        const duration = performance.now() - startTime
        log.info(`Scroll complete in ${duration.toFixed(1)}ms`)
    } catch (error) {
        log.warn('Scroll interrupted or timed out', error)
    }
}

function waitForScrollEnd(container: HTMLElement, timeout = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
        let scrollTimeout: NodeJS.Timeout
        const timeoutId = setTimeout(() => {
            container.removeEventListener('scroll', scrollHandler)
            reject(new Error('Scroll timeout exceeded'))
        }, timeout)

        const scrollHandler = () => {
            clearTimeout(scrollTimeout)
            scrollTimeout = setTimeout(() => {
                container.removeEventListener('scroll', scrollHandler)
                clearTimeout(timeoutId)
                resolve()
            }, SCROLL_OPTIONS.SCROLL_END_DELAY)
        }

        container.addEventListener('scroll', scrollHandler)
    })
}

function applyTemporaryHighlight(element: HTMLElement, duration: number) {
    const originalTransition = element.style.transition
    const originalOutline = element.style.outline
    const originalOutlineOffset = element.style.outlineOffset

    // Apply highlight styles
    element.style.transition = 'outline 0.3s ease'
    element.style.outline = '2px solid #2196f3'
    element.style.outlineOffset = '2px'

    // Restore original styles
    setTimeout(() => {
        element.style.transition = originalTransition
        element.style.outline = originalOutline
        element.style.outlineOffset = originalOutlineOffset
    }, duration)
}

export async function scrollAndHighlight(container: HTMLElement, element: HTMLElement, options: ScrollOptions = {}) {
    if (!container || !element) {
        log.warn('Invalid elements for scrolling')
        return
    }

    const marginHeight = getHeaderHeight(element)
    const elementOffset = getVerticalOffset(element, container)
    const initialScrollTop = container.scrollTop
    const targetScrollPosition =
        initialScrollTop + elementOffset - marginHeight - (options.extraOffset ?? SCROLL_OPTIONS.SCROLL_EXTRA_OFFSET)

    const scrollPromise = smoothScrollToPosition(container, targetScrollPosition, options)
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 100))

    try {
        await Promise.race([scrollPromise, timeoutPromise])
    } catch (error) {
        log.warn('Scroll error during race:', error)
    }

    // Check if scroll hasn't started after 100ms
    if (Math.abs(container.scrollTop - initialScrollTop) < 1) {
        // Scroll hasn't started; apply highlight immediately
        applyTemporaryHighlight(element, SCROLL_OPTIONS.HIGHLIGHT_DURATION)
    } else {
        // Scroll has started; wait for it to finish and then apply highlight
        try {
            await scrollPromise
        } catch (error) {
            log.warn('Scroll interrupted or timed out after starting', error)
        }
        applyTemporaryHighlight(element, SCROLL_OPTIONS.HIGHLIGHT_DURATION)
    }
}
