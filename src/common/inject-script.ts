export function injectWebScript(id: string, src: string) {
    return new Promise<void>((resolve, reject) => {
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = chrome.runtime.getURL(src);
            script.onload = () => {
                script.remove();
                resolve();
            }
            script.onerror = (error) => {
                reject(error);
            }
            (document.head || document.documentElement).appendChild(script);
        } else {
            resolve();
        }
    });
}

