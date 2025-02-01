export const awaitTimeout = (timeout: number, reason?: string) =>
    new Promise<void>((resolve, reject) =>
        setTimeout(() => {
            reason ? reject(reason) : resolve()
        }, timeout)
    )
