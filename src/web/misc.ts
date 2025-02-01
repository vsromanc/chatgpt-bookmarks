function getOffsetFromContainerTop(element: HTMLElement, container: HTMLElement) {
    const elementRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    return elementRect.top - containerRect.top
}

export const scrollAndHighlight = (container: HTMLDivElement, element: HTMLElement) => {
    const header = element?.closest('article')?.parentElement?.firstElementChild
    const marginHeight = header?.getBoundingClientRect().height || 56

    const offset = getOffsetFromContainerTop(element, container)
    const scrollTo = container.scrollTop + offset - marginHeight - 100
    container.scrollTo({
        top: scrollTo,
        behavior: 'smooth',
    })

    const originalTransition = element.style.transition
    const originalOutline = element.style.outline

    // Apply highlight styles
    element.style.transition = 'outline 0.3s ease'
    element.style.outline = '2px solid #2196f3'
    element.style.outlineOffset = '2px'

    // Reset styles after timeout
    setTimeout(() => {
        element.style.transition = originalTransition
        element.style.outline = originalOutline
        element.style.outlineOffset = ''
    }, 1000)
}
