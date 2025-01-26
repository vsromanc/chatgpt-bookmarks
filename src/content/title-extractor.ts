export function extractSidebarTitle(): string {
    const currentPath = window.location.pathname;
    const sidebarLink = document.querySelector(`a[href="${currentPath}"]`);
    return (
        sidebarLink?.querySelector('div[title]')?.getAttribute('title') ||
        sidebarLink?.textContent?.trim() ||
        'Untitled'
    );
}