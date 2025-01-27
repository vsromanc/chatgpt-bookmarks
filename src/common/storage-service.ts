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

    public static async getAllBookmarks(): Promise<{
        [chatId: string]: {
            bookmarks: number[]
            bookmarksData: { [key: number]: { lang: string; content: string; inferredMetadata: any } }
        }
    }> {
        const data = await chrome.storage.local.get(null)
        return Object.keys(data).reduce(
            (
                acc: {
                    [chatId: string]: {
                        bookmarks: number[]
                        bookmarksData: { [key: number]: any }
                    }
                },
                key
            ) => {
                const chatId = key.split('::')[0]
                if (!acc[chatId]) {
                    acc[chatId] = { bookmarks: [], bookmarksData: {} }
                }
                const bookmarkIndex = parseInt(key.split('::')[1].split('-')[1])
                acc[chatId].bookmarks.push(bookmarkIndex)
                acc[chatId].bookmarksData[bookmarkIndex] = data[key]
                return acc
            },
            {}
        )
    }
}
