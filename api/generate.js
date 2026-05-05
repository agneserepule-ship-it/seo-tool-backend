export const config = {
  runtime: 'edge',
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { type, keyword, topic } = req.body;

  const API_KEY = process.env.OPENAI_API_KEY;

  let prompt = "";

  if (type === "topics") {
    prompt = `
Izveido 10 SEO rakstu tēmas latviešu valodā par: "${keyword}"

- dažādi search intent
- bez listicle
- dabiskā valodā
katra jaunā rindā
`;
  }

  if (type === "h2") {
    prompt = `
Izveido MAKSIMĀLI 5 H2 virsrakstus.

Tēma: "${topic}"

- katrs unikāls
- izmanto keyword variācijas
- semantiski dažādi
katrs jaunā rindā
`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "Tu esi SEO eksperts latviešu valodā." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    const lines = text
      .split("\n")
      .map(l => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter(l => l.length > 0);

    if (type === "topics") {
      return res.status(200).json({ topics: lines });
    }

    if (type === "h2") {
      return res.status(200).json({ h2: lines });
    }

    return res.status(400).json({ error: "Invalid type" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
