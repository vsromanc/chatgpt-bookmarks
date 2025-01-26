// src/utils/url-utils.ts

export function extractChatId(): string | null {
    const pathParts = window.location.pathname.split('/');
    const chatIdIndex = pathParts.indexOf('c') + 1;

    if (chatIdIndex > 0 && chatIdIndex < pathParts.length) {
        const potentialChatId = pathParts[chatIdIndex];
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialChatId)) {
            return potentialChatId;
        }
    }
    return null;
}