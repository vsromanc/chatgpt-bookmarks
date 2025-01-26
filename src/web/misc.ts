export function scrollAndHighlight(element: HTMLElement): void {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    const originalTransition = element.style.transition;
    const originalOutline = element.style.outline;

    // Apply highlight styles
    element.style.transition = 'outline 0.3s ease';
    element.style.outline = '2px solid #2196f3';
    element.style.outlineOffset = '2px';

    // Reset styles after timeout
    setTimeout(() => {
        element.style.transition = originalTransition;
        element.style.outline = originalOutline;
        element.style.outlineOffset = '';
    }, 1000);
}