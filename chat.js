export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const { messages, system, provider } = req.body;

    let reply = '';

    if (provider === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages })
      });
      const data = await response.json();
      reply = data.content?.[0]?.text || 'Erreur Claude.';

    } else if (provider === 'gpt4') {
      const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o', max_tokens: 1000, messages: msgs })
      });
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || 'Erreur GPT-4.';

    } else if (provider === 'gemini') {
      const msgs = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: msgs })
      });
      const data = await response.json();
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erreur Gemini.';

    } else {
      // Groq par défaut
      const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: msgs })
      });
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || 'Erreur Groq.';
    }

    res.status(200).json({ content: [{ type: 'text', text: reply }] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
