import { GoogleGenerativeAI } from "@google/generative-ai";

type Req = {
  body?: { prompt?: string };
};

export default async function handler(req: Req, res: any) {
  try {
    if (req?.body == null) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Architect Update: March 2026 Model Standard
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview", 
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    let raw = result.response.text() || "";

    // Design Check: Remove common LLM markdown wrapping if present
    raw = raw.replace(/```json|```/g, "").trim();

    // Guarantee we always return JSON
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.error("Parse Error Raw Output:", raw);
      return res.status(500).json({
        error: "Gemini returned non-JSON architecture",
        raw,
      });
    }

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: err?.message || "VSE Clarity Core failure" });
  }
}