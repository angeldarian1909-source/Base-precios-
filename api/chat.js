// /api/chat.js — Vercel serverless function
// Proxy para proteger la API Key de Anthropic

export const config = {
api: {
bodyParser: {
sizeLimit: ‘20mb’,
},
},
};

export default async function handler(req, res) {
// CORS headers
res.setHeader(“Access-Control-Allow-Origin”, “*”);
res.setHeader(“Access-Control-Allow-Methods”, “POST, OPTIONS”);
res.setHeader(“Access-Control-Allow-Headers”, “Content-Type, x-api-key”);

if (req.method === “OPTIONS”) return res.status(200).end();
if (req.method !== “POST”) return res.status(405).json({ error: “Method not allowed” });

// Usar API key del entorno de Vercel
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
return res.status(401).json({ error: “API key no configurada en el servidor” });
}

try {
let body = req.body;
if (typeof body === “string”) body = JSON.parse(body);

```
const { messages, model, max_tokens, system } = body;

const payload = {
  model:      model      || "claude-opus-4-5",
  max_tokens: max_tokens || 4000,
  messages:   messages   || [],
};
if (system) payload.system = system;

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type":      "application/json",
    "x-api-key":         apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-beta":    "pdfs-2024-09-25",
  },
  body: JSON.stringify(payload),
});

const data = await response.json();

if (!response.ok) {
  return res.status(response.status).json(data);
}

return res.status(200).json(data);
```

} catch (err) {
console.error(“Proxy error:”, err);
return res.status(500).json({ error: err.message });
}
}