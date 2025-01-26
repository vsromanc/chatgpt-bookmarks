// types.ts
export type Bookmark = {
    chatTitle: string;
    codeContent: string;
    codeLanguage: string;
    metadata: { name: string };
};

export type ChatBookmarks = {
    bookmarks: number[];
    bookmarksData: Record<string, Bookmark>;
};

export type GroupedBookmarks = {
    title: string;
    chats: ({ chatId: string } & ChatBookmarks)[];
};