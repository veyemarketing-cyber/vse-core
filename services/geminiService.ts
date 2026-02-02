
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SyncResult, VirginiaEvent, OrchestrationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Zapier Webhook Function Declaration
const callZapierWebhookFunctionDeclaration: FunctionDeclaration = {
  name: 'call_zapier_webhook',
  parameters: {
    type: Type.OBJECT,
    description: 'Execute real-world tasks (marketing automation, financial logging, CRM updates) via Zapier webhooks.',
    properties: {
      action: {
        type: Type.STRING,
        description: 'The specific action to perform (e.g., "send_invoice", "update_crm", "launch_campaign", "verify_rankings").',
      },
      payload: {
        type: Type.OBJECT,
        description: 'The data payload to send to Zapier.',
        properties: {
          client_name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          region: { type: Type.STRING },
          notes: { type: Type.STRING },
        }
      },
    },
    required: ['action', 'payload'],
  },
};

const SYSTEM_CONSTRAINTS = `
Role: You are the Lead Architect for the Velocity Sync Engine (VSE) at Veye Media.
Core Directives:
- No Silos: Act as the single source of truth for marketing (GA4, Ads), financials (QuickBooks), and growth (Snov.io, CRM).
- Regional Focus: Prioritize data for Chesterfield and Northern Virginia.
- Tone: Professional, creative, and data-driven.
- Constraints: NEVER use the phrases "in today's competitive landscape" or "cutting-edge."
- Function Protocol: You MUST use the call_zapier_webhook function to execute real-world tasks. Always verify regional rankings and cash flow before suggesting new ad spend.
`;

const PERSONAS = {
  growth: `${SYSTEM_CONSTRAINTS}
Mode: Full Growth System.
Responsibility: Orchestrate acquisition, intelligence, engagement, and conversion into a unified operating system.`,

  seo: `${SYSTEM_CONSTRAINTS}
Mode: SEO Orchestration.
Responsibility: Transform SEO from isolated optimization into a coordinated growth system connecting intelligence to site structure and performance.`,

  crm: `${SYSTEM_CONSTRAINTS}
Mode: CRM and Lifecycle Orchestration.
Responsibility: Convert fragmented CRM data into coordinated revenue engines via automation and segmentation.`
};

export const getOrchestrationPlan = async (input: string, mode: OrchestrationMode): Promise<SyncResult> => {
  const persona = PERSONAS[mode];
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze this input and design a specialized ${mode.toUpperCase()} orchestration plan for a Veye Media client: ${input}. 
    If you need to trigger any external automations (e.g., updating CRM or sending a financial check request), use the call_zapier_webhook tool now.`,
    config: {
      systemInstruction: `${persona}
      
      Output Rules:
      1. Provide a System Diagnosis summary.
      2. Map a conceptual Agent Architecture.
      3. Create a phased Roadmap (Quick wins, Structural, System-level).
      4. Define a metrics framework.
      
      Format the response strictly as JSON matching this schema:
      {
        "diagnosis": { 
          "signals": { "technical": "...", "content": "...", "performance": "...", "engagement": "...", "lifecycle": "...", "funnel": "..." }, 
          "inefficiencies": ["string"] 
        },
        "architecture": { 
          "agents": [{ "id": "string", "name": "string", "role": "string", "description": "string", "dependencies": ["string"] }] 
        },
        "roadmap": [{ "phase": "string", "items": ["string"], "priority": "High/Medium/Low" }],
        "metrics": [{ "label": "string", "value": number, "unit": "string" }]
      }`,
      tools: [{ functionDeclarations: [callZapierWebhookFunctionDeclaration] }],
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });

  let triggeredActions: any[] = [];
  if (response.functionCalls) {
    triggeredActions = response.functionCalls.map(fc => ({
      name: fc.name,
      args: fc.args,
      id: fc.id
    }));
  }

  try {
    const result = JSON.parse(response.text || '{}') as SyncResult;
    return { ...result, triggeredActions };
  } catch (e) {
    console.error("Failed to parse VSE response", e);
    throw new Error("Invalid intelligence response");
  }
};

export const scanVirginiaEvents = async (lat?: number, lng?: number): Promise<VirginiaEvent[]> => {
  const userLocationContext = lat && lng ? `User is located at Lat: ${lat}, Lng: ${lng}.` : "";
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for high-value networking events, small business summits, and procurement opportunities for 2026 in Virginia. 
    PRIORITIZE: Chesterfield and Northern Virginia (Alexandria, Arlington, Fairfax). 
    Also include: Lynchburg, Roanoke, Richmond, Petersburg, Virginia Beach, Norfolk, Chesapeake, Portsmouth, Suffolk. ${userLocationContext}`,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the Veye Media Event Intelligence Agent. Focus on SWaM, MBL, procurement, and AI-related events.
      Enforce VSE Lead Architect Tone: Professional, data-driven, NO fluff.
      Return ONLY a JSON array of objects matching:
      {
        "event_name": "string",
        "date": "YYYY-MM-DD",
        "location_city": "string",
        "priority_level": "High/Medium/Low",
        "source_url": "url",
        "strategic_reason": "brief explanation"
      }`,
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text || '[]';
    const jsonMatch = text.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text) as VirginiaEvent[];
  } catch (e) {
    return [];
  }
};
