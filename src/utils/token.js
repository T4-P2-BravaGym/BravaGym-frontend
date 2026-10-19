export function readTokenPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
        return JSON.parse(atob(padded))
    } catch {
        return null
    }
}

export function sessionFromToken(token) {
    const payload = token ? readTokenPayload(token) : null
    if (!payload?.sub || !payload?.role || !payload?.exp) return null

    const expiresAt = payload.exp * 1000
    if (expiresAt <= Date.now()) return null

    return { id: Number(payload.sub), role: payload.role, expiresAt }
}