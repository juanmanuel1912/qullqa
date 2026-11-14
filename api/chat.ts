/**
 * Función de Vercel: asistente agrícola de Qullqa con Claude.
 * POST /api/chat  { messages: [{role, content}], context: {...}, lang: 'en'|'es'|'qu' }
 *
 * - La clave vive solo en el servidor: variable de entorno ANTHROPIC_API_KEY en Vercel.
 * - Sin clave responde 503 { error: 'not_configured' } y la app usa su asistente local.
 */
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-5-5'
const MAX_TURNS = 10
const MAX_CHARS = 1500
const MAX_CONTEXT_CHARS = 8000

const SYSTEM_PROMPT = `You are Qullqa, a friendly farming assistant for small farmers, mainly in the Peruvian Andes. You help them decide what and when to plant, when to irrigate, how to handle frost and El Niño, and when they will harvest.

You receive a <farm_context> block with real data for the user's farm: location and altitude, 25-year NASA POWER climate normals per month (mean temperature, coldest minimum, rain), this week's forecast plan, the current El Niño status from NOAA, the farmer's crop and planting date, and requirements for the crops in the app. Base your answers on that data and say when a number is an estimate. When you use general agronomy knowledge that is not in the context, say so briefly. Never invent measurements.

How to answer:
- Reply in the language given in <language> (en = English, es = Spanish, qu = Spanish with a short greeting or key words in Southern Quechua).
- Use simple words for a farmer, no jargon. Keep it short: 3 to 6 sentences, or a short list with "- " bullets. No headings, tables or bold text.
- For "should I plant X in month Y" questions, give a clear verdict first (good idea / possible with care / not recommended), then the reasons (altitude, temperature, frost, rain, season), the estimated time to harvest, and a better alternative if it does not fit.
- For pesticides, credit, insurance or other high-stakes decisions, suggest confirming with a local agronomist (INIA or the regional agrarian agency).
- If a question is not about farming, weather or food, answer briefly and steer back to the farm.`

type Role = 'user' | 'assistant'
interface InMessage {
  role: Role
  content: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

function cleanMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw)) return null
  const msgs = raw
    .filter((m): m is InMessage => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS).trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_TURNS)
  // La conversación debe empezar y terminar con el usuario
  while (msgs.length && msgs[0].role !== 'user') msgs.shift()
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null
  return msgs
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503)

  let body: { messages?: unknown; context?: unknown; lang?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const messages = cleanMessages(body.messages)
  if (!messages) return json({ error: 'bad_request' }, 400)
  const lang = body.lang === 'es' || body.lang === 'qu' ? body.lang : 'en'
  const context = JSON.stringify(body.context ?? {}).slice(0, MAX_CONTEXT_CHARS)

  const client = new Anthropic()
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      // Chat corto: esfuerzo bajo = respuestas rápidas y baratas
      output_config: { effort: 'low' },
      // Si el modelo declina, el servidor reintenta con otro modelo adecuado
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `<language>${lang}</language>\n<farm_context>\n${context}\n</farm_context>` },
      ],
      messages,
    })

    if (response.stop_reason === 'refusal') return json({ reply: null, refused: true })
    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    return json({ reply, model: response.model, truncated: response.stop_reason === 'max_tokens' })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return json({ error: 'not_configured' }, 503)
    if (error instanceof Anthropic.RateLimitError) return json({ error: 'rate_limited' }, 429)
    if (error instanceof Anthropic.BadRequestError) return json({ error: 'bad_request' }, 400)
    if (error instanceof Anthropic.APIError) return json({ error: 'upstream', status: error.status }, 502)
    return json({ error: 'server_error' }, 500)
  }
}
