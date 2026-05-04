export interface SessionData {
  email: string,
  password: string
  createdAt: number
}

const TTL_SECONDS = 600 // 10 minutos

export async function saveSession(kv: KVNamespace, sessionId: string, data: SessionData) {
  await kv.put(`session:${sessionId}`, JSON.stringify(data), { expirationTtl: TTL_SECONDS })
}

export async function getSession(kv: KVNamespace, sessionId: string): Promise<SessionData | null> {
  const raw = await kv.get(`session:${sessionId}`)
  if (!raw) return null
  return JSON.parse(raw) as SessionData
}

export async function deleteSession(kv: KVNamespace, sessionId: string) {
  await kv.delete(`session:${sessionId}`)
}

export function generateSessionId() {
  return crypto.randomUUID()
}
