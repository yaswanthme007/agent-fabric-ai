const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function runAgent(agentName: string, agentType: string, task: string): Promise<string> {
  const systemPrompt = `You are ${agentName}, an AI agent specialized in ${agentType}. You are part of the NEXUS agent platform. Respond concisely and professionally, showing your work step by step like a real autonomous agent would. Use short lines, prefix each step with a timestamp like [14:02:31] and action like INFO/PROCESSING/COMPLETE.`

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: task }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })
  const data = await response.json()
  return data.choices[0].message.content
}
