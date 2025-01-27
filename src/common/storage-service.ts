import log from '../lib/loglevel'
// src/services/storage-service.ts

export class StorageService {
    public static async toggleBookmark(
        chatId: string,
        index: number,
        isBookmarked: boolean,
        {
            lang,
            content,
            chatTitle,
            metadata,
        }: {
            lang: string
            content: string
            chatTitle: string
            metadata: any
        }
    ): Promise<void> {
        const storageKey = `chat-${chatId}::bookmark-${index}`
        const data = await chrome.storage.local.get(storageKey)

        log.debug('Toggle bookmark', storageKey, structuredClone(data))

        // update bookmark data if exist
        if (data[storageKey]) {
            data[storageKey].isBookmarked = isBookmarked
            data[storageKey].lang = lang
            data[storageKey].content = content
            data[storageKey].metadata = metadata
        } else {
            data[storageKey] = {
                isBookmarked,
                lang,
                content,
                metadata,
            }
        }

        const chatTitleKey = `chat-${chatId}`
        data[chatTitleKey] = { title: chatTitle }

        log.debug('Toggle bookmark updated', data)

        // update bookmark data
        await chrome.storage.local.set(data)
    }

    public static async getBookmarks(chatId: string): Promise<number[]> {
        const keys = await chrome.storage.local.getKeys()
        const chatKeys = keys.filter(key => key.startsWith(`chat-${chatId}::bookmark-`))
        const data = await chrome.storage.local.get(chatKeys)

        const result = Object.keys(data)
            // filter bookmarked data only
            .filter(key => data[key].isBookmarked)
            // get index from key
            .map(key => parseInt(key.split('::bookmark-')[1]))

        log.debug('Toggled chat bookmarks', chatId, result)

        return result
    }

    public static async getAllBookmarks() {
        const input = await chrome.storage.local.get(null)

        const result: {
            [chatId: string]: {
                title: string
                bookmarks: {
                    [key: string]: {
                        lang: string
                        content: string
                        metadata: any
                    }
                }
            }
        } = {}

        // Process chat entries first
        Object.entries(input).forEach(([key, value]) => {
            if (!key.includes('::bookmark-')) {
                const chatId = key.substring(5) // Remove 'chat-' prefix
                result[chatId] = {
                    title: value.title,
                    bookmarks: {},
                }
            }
        })

        // Process bookmark entries
        Object.entries(input).forEach(([key, value]) => {
            if (key.includes('::bookmark-')) {
                const [chatKeyPart, bookmarkId] = key.split('::bookmark-')
                const chatId = chatKeyPart.substring(5) // Extract UUID from chat part
                if (result[chatId] && value.isBookmarked) {
                    // Omit isBookmarked property and add remaining fields
                    const { isBookmarked, ...bookmarkData } = value
                    result[chatId].bookmarks[bookmarkId] = bookmarkData
                }
            }
        })

        log.debug('Get all bookmarks', result)

        return result
    }
}
