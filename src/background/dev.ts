if (process.env.NODE_ENV === 'development') {
    chrome.commands.onCommand.addListener(command => {
        if (command === 'reload-extension') {
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
