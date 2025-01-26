// src/services/storage-service.ts

export class StorageService {
    public static async toggleBookmark(chatId: string, index: number, { isBookmarked, codeLanguage, codeContent, chatTitle, metadata }: { isBookmarked: boolean; codeLanguage: string; codeContent: string; chatTitle: string; metadata: any }): Promise<void> {
        const storageKey = `chat-${chatId}`;

        return new Promise((resolve) => {
            chrome.storage.local.get([storageKey], (result) => {
                const existingData = result[storageKey] || { bookmarks: [], bookmarksData: {} };
                const bookmarks = new Set<number>(existingData.bookmarks);

                if (isBookmarked) {
                    bookmarks.add(index);
                } else {
                    bookmarks.delete(index);
                }

                chrome.storage.local.set({
                    [storageKey]: {
                        ...existingData,
                        bookmarks: Array.from(bookmarks).sort((a, b) => a - b),
                        bookmarksData: {
                            ...existingData.bookmarksData,
                            [index]: {
                                codeLanguage,
                                codeContent,
                                chatTitle,
                                metadata
                            }
                        }
                    }
                }, () => resolve());
            });
        });
    }

    public static async getBookmarks(chatId: string): Promise<number[]> {
        const storageKey = `chat-${chatId}`;

        return new Promise((resolve) => {
            chrome.storage.local.get([storageKey], (result) => {
                resolve(result[storageKey]?.bookmarks || []);
            });
        });
    }

    public static async getAllBookmarks(): Promise<{ [key: string]: { bookmarks: number[]; bookmarksData: { [key: number]: { codeLanguage: string; codeContent: string; chatTitle: string } } } }> {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (result) => resolve(result));
        });
    }
}