import { API } from '../glossary'

export async function inferMetadata(accessToken: string, codeContent: string) {
    const resp = await fetch(API.INFER_METADATA, {
        method: 'POST',
        body: JSON.stringify({
            content: codeContent,
        }),
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })

    return await resp.json()
}
