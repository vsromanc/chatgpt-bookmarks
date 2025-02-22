const SESSION_EXPIRATION_IN_MIN = 30;

const GA_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const MEASUREMENT_ID = process.env.MEASUREMENT_ID;
const API_SECRET = process.env.API_SECRET;
const DEFAULT_ENGAGEMENT_TIME_IN_MSEC = 100;

async function getOrCreateClientId() {
    const result = await chrome.storage.local.get('clientId');
    let clientId = result.clientId;
    if (!clientId) {
        clientId = self.crypto.randomUUID();
        await chrome.storage.local.set({ clientId });
    }
    return clientId;
}

async function getOrCreateSessionId() {
    let { sessionData } = await chrome.storage.session.get('sessionData');
    const currentTimeInMs = Date.now();
    if (sessionData && sessionData.timestamp) {
        const durationInMin = (currentTimeInMs - sessionData.timestamp) / 60000;
        if (durationInMin > SESSION_EXPIRATION_IN_MIN) {
            sessionData = null;
        } else {
            sessionData.timestamp = currentTimeInMs;
            await chrome.storage.session.set({ sessionData });
        }
    }
    if (!sessionData) {
        sessionData = {
            session_id: currentTimeInMs.toString(),
            timestamp: currentTimeInMs.toString(),
        };
        await chrome.storage.session.set({ sessionData });
    }
    return sessionData.session_id;
}

export async function sendEvent(event: string) {
    fetch(
        `${GA_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
            method: "POST",
            body: JSON.stringify({
                client_id: await getOrCreateClientId(),
                events: [
                    {
                        name: event,
                        params: {
                            session_id: await getOrCreateSessionId(),
                            engagement_time_msec: DEFAULT_ENGAGEMENT_TIME_IN_MSEC,
                            id: "my-button",
                        },
                    },
                ],
            }),
        }
    );
}