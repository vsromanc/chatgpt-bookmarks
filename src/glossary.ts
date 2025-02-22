export const EVENTS = {
    NAVIGATE_TO_CODE_BLOCK: 'NAVIGATE_TO_CODE_BLOCK',
    INIT_BOOKMARKS: 'INIT_BOOKMARKS',
    PROMPT_STATE_COMPLETED: 'PROMPT_STATE_COMPLETED',
    CONVERSATION_DATA: 'CONVERSATION_DATA',
    TOGGLE_BOOKMARK: 'TOGGLE_BOOKMARK',
    TOGGLE_BOOKMARK_COMPLETED: 'TOGGLE_BOOKMARK_COMPLETED',
    GET_ALL_BOOKMARKS: 'GET_ALL_BOOKMARKS',
    OPEN_CHAT: 'OPEN_CHAT',
    SCROLL_TO_BOOKMARK: 'SCROLL_TO_BOOKMARK',
    HISTORY_STATE_UPDATED: 'HISTORY_STATE_UPDATED',
    LOG_EVENT: 'LOG_EVENT',
}

export const API = {
    INFER_METADATA: 'https://chatgpt.com/backend-api/conversation/textdocs/infer_metadata',
}

export const SCROLL_OPTIONS = {
    HIGHLIGHT_DURATION: 1000,
    SCROLL_END_DELAY: 20,
    DEFAULT_MARGIN: 56,
    SCROLL_EXTRA_OFFSET: 100,
}
