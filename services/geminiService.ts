import { SyncResult, VirginiaEvent, OrchestrationMode } from "../types";

/* =========================
   Helpers
========================= */
function extractJson(text: string): string {
  if (!text) return "";

  const brace = text.indexOf("{");
  const bracket = text.indexOf("[");

  if (brace === -1 && bracket === -1) return "";

  const start =
    brace === -1 ? bracket : bracket === -1 ? brace : Math.min(brace, bracket);

  const open = text[start];
  const close = open === "{" ? "}" : "]";

  let depth = 0;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === open) depth++;
    if (ch === close) depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }

  return "";
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Gemini request failed (${res.status})`);
  }

  return data?.text || "";
}

/* =========================
   Prompt constants
========================= */
const SYSTEM_CONSTRAINTS = `
Role: You are the Lead Architect for the Velocity Sync Engine (VSE) at Veye Media.
Core Directives:
- No Silos: Act as the single source of truth for marketing (GA4, Ads), financials (QuickBooks), and growth (Snov.io, CRM).
- Regional Focus: Prioritize data for Chesterfield and Northern Virginia.
- Tone: Professional, creative, and data-driven.
- Constraints: NEVER use the phrases "in today's competitive landscape" or "cutting-edge."
- Function Protocol: If asked to execute real-world tasks, describe the action as a "triggeredActions" entry (do NOT claim you executed it).
`;

const PERSONAS: Record<OrchestrationMode, string> = {
  growth: `${SYSTEM_CONSTRAINTS}
Mode: Full Growth System.
Responsibility: Orchestrate acquisition, intelligence, engagement, and conversion into a unified operating system.`,

  seo: `${SYSTEM_CONSTRAINTS}
Mode: SEO Orchestration.
Responsibility: Transform SEO from isolated optimization into a coordinated growth system connecting intelligence to site structure and performance.`,

  crm: `${SYSTEM_CONSTRAINTS}
Mode: CRM and Lifecycle Orchestration.
Responsibility: Convert fragmented CRM data into coordinated revenue engines via automation and segmentation.`,
};

/* =========================
   Public API (used by App.tsx)
========================= */
export const getOrchestrationPlan = async (
  input: string,
  mode: OrchestrationMode
): Promise<SyncResult> => {
  const persona = PERSONAS[mode];

  const prompt = `
${persona}

Task:
Analyze this input and design a specialized ${mode.toUpperCase()} orchestration plan for a Veye Media client.

Client input:
${input}

Output Rules:
1) Provide a System Diagnosis summary.
2) Map a conceptual Agent Architecture.
3) Create a phased Roadmap (Quick wins, Structural, System-level).
4) Define a metrics framework.

IMPORTANT:
- Return STRICT JSON only (no markdown).
- If you would normally call external automation, include it as triggeredActions entries like:
  { "id": "action-1", "name": "call_zapier_webhook", "args": { "action": "...", "payload": {...} } }

Return JSON matching exactly:

{
  "diagnosis": { 
    "signals": { "technical": "...", "content": "...", "performance": "...", "engagement": "...", "lifecycle": "...", "funnel": "..." }, 
    "inefficiencies": ["string"] 
  },
  "architecture": { 
    "agents": [{ "id": "string", "name": "string", "role": "string", "description": "string", "dependencies": ["string"] }] 
  },
  "roadmap": [{ "phase": "string", "items": ["string"], "priority": "High/Medium/Low" }],
  "metrics": [{ "label": "string", "value": number, "unit": "string" }],
  "triggeredActions": [{ "id": "string", "name": "string", "args": {} }]
}
`;

  const text = await callGemini(prompt);
  const json = extractJson(text) || text;

  try {
    const result = JSON.parse(json || "{}") as SyncResult;

    // If model omitted triggeredActions, normalize it.
    (result as any).triggeredActions = (result as any).triggeredActions || [];

    return result;
  } catch (e) {
    console.error("Failed to parse VSE response:", e);
    throw new Error("Invalid intelligence response");
  }
};

export const scanVirginiaEvents = async (
  lat?: number,
  lng?: number
): Promise<VirginiaEvent[]> => {
  const userLocationContext =
    lat != null && lng != null ? `User is located at Lat: ${lat}, Lng: ${lng}.` : "";

  const prompt = `
${SYSTEM_CONSTRAINTS}

You are the Veye Media Event Intelligence Agent.
Focus: SWaM, MBL, procurement, and AI-related events.

Task:
Find high-value networking events, small business summits, and procurement opportunities for 2026 in Virginia.

PRIORITIZE:
- Chesterfield
- Northern Virginia (Alexandria, Arlington, Fairfax)

Also include:
Lynchburg, Roanoke, Richmond, Petersburg, Virginia Beach, Norfolk, Chesapeake, Portsmouth, Suffolk.

${userLocationContext}

Return ONLY a JSON array matching exactly:
[
  {
    "event_name": "string",
    "date": "YYYY-MM-DD",
    "location_city": "string",
    "priority_level": "High/Medium/Low",
    "source_url": "url",
    "strategic_reason": "brief explanation"
  }
]

IMPORTANT:
- JSON only, no markdown.
- Provide 6–10 items.
`;

  try {
    const text = await callGemini(prompt);
    const json = extractJson(text) || text;
    return JSON.parse(json || "[]") as VirginiaEvent[];
  } catch (e) {
    console.error("Event scan parse error:", e);
    return [];
  }
};
