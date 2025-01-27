export async function inferMetadata(accessToken: string, codeContent: string) {
    const resp = await fetch('https://chatgpt.com/backend-api/conversation/textdocs/infer_metadata', {
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
