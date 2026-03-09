export default async function handler(req, res) {
res.setHeader(“Access-Control-Allow-Origin”, “*”);
res.setHeader(“Access-Control-Allow-Methods”, “POST, OPTIONS”);
res.setHeader(“Access-Control-Allow-Headers”, “Content-Type”);

if (req.method === “OPTIONS”) return res.status(200).end();
if (req.method !== “POST”) return res.status(405).json({ error: “Method not allowed” });

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) return res.status(401).json({ error: “API key no configurada” });

try {
let body = req.body;
if (typeof body === “string”) body = JSON.parse(body);

```
const payload = {
  model: body.model || "claude-opus-4-5",
  max_tokens: body.max_tokens || 4000,
  messages: body.messages || [],
};
if (body.system) payload.system = body.system;

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-beta": "pdfs-2024-09-25",
  },
  body: JSON.stringify(payload),
});

const data = await response.json();
return res.status(response.status).json(data);
```

} catch (err) {
return res.status(500).json({ error: err.message });
}
}