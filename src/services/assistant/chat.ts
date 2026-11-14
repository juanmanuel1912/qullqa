/**
 * Cliente del asistente: llama a /api/chat (función de Vercel con Claude).
 * Si la IA no está configurada o no hay conexión, lanza AssistantUnavailable
 * y la pantalla responde con el asistente local.
 */
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export class AssistantUnavailable extends Error {}

export interface ClaudeReply {
  reply: string | null
  refused?: boolean
}

export async function askClaude(messages: ChatTurn[], context: unknown, lang: string, signal?: AbortSignal): Promise<ClaudeReply> {
  let res: Response
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, context, lang }),
      signal,
    })
  } catch {
    throw new AssistantUnavailable('network')
  }
  const type = res.headers.get('content-type') ?? ''
  // En local (sin la función de Vercel) llega 404 o el index.html: usar el asistente local
  if (!type.includes('application/json')) throw new AssistantUnavailable('no-function')
  const data = (await res.json()) as ClaudeReply & { error?: string }
  if (!res.ok || data.error) throw new AssistantUnavailable(data.error ?? `http-${res.status}`)
  return data
}
