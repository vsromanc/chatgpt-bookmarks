interface ChromeMessage {
    _reqId?: string;
    type: string;
    payload?: any;
    error?: any;
    data?: any;
}

export const sendMessage = (message: ChromeMessage) => {
    return new Promise((resolve, reject) => {
        // Create temporary listener
        const tempListener = (response: ChromeMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
            if (response._reqId === message._reqId) {
                chrome.runtime.onMessage.removeListener(tempListener);
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.payload);
                }
            }
        };

        // Add unique ID to track responses
        message._reqId = Date.now() + Math.random().toString(36).substr(2, 9);

        // Register temporary listener
        chrome.runtime.onMessage.addListener(tempListener);

        // Send message to background
        chrome.runtime.sendMessage(message);
    });
};