if (process.env.NODE_ENV === 'development') {
    // reload extension on command
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'reload-extension') {
            chrome.runtime.reload()
        }
    })

    // reload current tab on update
    chrome.runtime.onInstalled.addListener(async event => {
        if (event.reason === 'update') {
            const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
            if (activeTab?.id) {
                chrome.tabs.reload(activeTab.id)
            }
        }
    })
}
