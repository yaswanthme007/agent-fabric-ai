export async function runAgent(agentName: string, agentType: string, task: string): Promise<string> {
  const GROQ_API_KEY = localStorage.getItem('nexus_groq_key') || import.meta.env.VITE_GROQ_API_KEY

  if (!GROQ_API_KEY) {
    return '[ERROR] No API key found. Go to Settings → add your free Groq API key from console.groq.com'
  }

  const systemPrompts: Record<string, string> = {
    NLP: `You are ${agentName}, an NLP AI agent on the NEXUS platform. When given a task, you analyze text, summarize documents, classify content, or extract information. Structure your output with clear labeled sections. Prefix each line with a timestamp like [14:02:31] and status like INFO/RESULT/COMPLETE.`,
    Data: `You are ${agentName}, a Data AI agent on the NEXUS platform. When given data or a data task, you analyze it, find patterns, extract structured information, or generate insights. Output results in structured format. Prefix each line with [14:02:31] INFO/ANALYSIS/RESULT.`,
    Automation: `You are ${agentName}, an Automation AI agent on the NEXUS platform. When given a workflow or automation task, break it down into executable steps, identify tools needed, and output a detailed execution plan. Prefix each line with [14:02:31] STEP/STATUS/COMPLETE.`,
    Vision: `You are ${agentName}, a Vision AI agent on the NEXUS platform. When given a description of an image or visual task, analyze it and describe what you would extract, detect, or generate. Prefix each line with [14:02:31] SCANNING/DETECTING/RESULT.`,
  }

  const systemPrompt = systemPrompts[agentType] ?? systemPrompts.NLP

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: task },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      return `[ERROR] Groq API ${response.status}: ${errData?.error?.message ?? response.statusText}`
    }

    const data = await response.json()
    if (!data?.choices?.[0]?.message?.content) {
      return `[ERROR] Unexpected response: ${JSON.stringify(data)}`
    }
    return data.choices[0].message.content
  } catch (e: any) {
    return `[ERROR] ${e?.message ?? 'Request failed'}`
  }
}
