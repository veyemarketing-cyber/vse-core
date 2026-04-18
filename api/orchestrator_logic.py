import os
import sys
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass
from google import genai
from google.genai import types

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from data_loom import DataLoom
except ImportError:
    DataLoom = None

# Load env from local vaults
for vault_path in [".env.local", ".env", "../.env.local", "../.env"]:
    if os.path.exists(vault_path):
        load_dotenv(dotenv_path=vault_path, override=True)
        break


class VSEOrchestrator:
    def __init__(self):
        # GOVERNANCE: Authenticating the Brain via Vaulted Keys
        api_key = (
            os.getenv("GEMINI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
            or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        )

        if not api_key:
            self.client = None
            self.status = "OFFLINE: Missing API Key"
        else:
            self.client = genai.Client(api_key=api_key)
            self.status = "ONLINE"

        self.loom = DataLoom() if DataLoom else None

    def evaluate_strategic_move(self, market_data, crm_data):
        if not self.client:
            return {
                "status": self.status,
                "insight": "Orchestrator Brain Offline: Verify API Credentials in .env",
                "combined_score": None,
                "market_context": {},
                "signals": [],
                "actions": [],
            }

        # --- DYNAMIC SILO SYNTHESIS: Weaving live CRM and Market threads ---
        # If DataLoom fails, we report the "Silo Disconnect" rather than faking data.
        synthesis = self.loom.weave_silos(crm_data, market_data) if self.loom else {}
        combined_score = synthesis.get("combined_score")
        market_context = synthesis.get("market_context", {})
        signals = synthesis.get("signals", [])
        
        # Capture current market for dynamic prompting
        active_market = market_data.get("market", "Unknown Target")

        velocity = crm_data.get("velocity", 0)
        launch_context = ""
        if velocity == 0:
            launch_context = (
                "STRATEGIC NOTE: Snov.io outreach initiates tomorrow. "
                "Current zero velocity is an expected pre-launch state—do not penalize growth score. "
            )

        # --- THE ARTISANAL PROMPT: No longer hardcoded to Richmond ---
        prompt = (
            "You are the Senior Strategist inside the Velocity Sync Engine (VSE). "
            "You are tasked with providing Business Clarity through Silo Synthesis.\n\n"
            f"SYNTHESIZED DATA LOOM CONTEXT: {synthesis}\n"
            f"REAL-TIME CRM VELOCITY: {crm_data}\n"
            f"MARKET INTELLIGENCE: {market_data}\n\n"
            f"{launch_context}"
            f"CURRENT OPERATIONAL FOCUS: Veye Media targeting {active_market}.\n\n"
            "Task: Produce a data-driven strategic recommendation. Reference the interaction between "
            "SEO visibility (Market Data) and CRM pipeline (CRM Data) to justify your logic.\n"
            "Tone: Professional, authoritative, data-driven, and artisanal.\n"
            "Constraints: Never use 'in today's competitive landscape' or 'cutting-edge'.\n"
            "Terminology: Use 'Architecture' to describe the solution design."
        )

        try:
            # Using Mariner-level reasoning for the synthesis
            response = self.client.models.generate_content(
                model="gemini-2.0-flash", # Updated to current production stable
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3, # Lower temperature for data-driven precision
                    max_output_tokens=1000,
                ),
            )
            strat_decision = response.text
        except Exception as e:
            strat_decision = f"CRITICAL: Silo Synthesis Failure during LLM generation. Error: {str(e)[:200]}"

        # --- THE ACTUATOR: Mapping signals to the "Done List" ---
        actions = []
        for sig in signals:
            sig_type = sig.get("type")
            reason = sig.get("narrative")
            if sig_type == "cross_silo_spend_no_pipeline":
                actions.append({
                    "action_type": "propose_budget_reduction",
                    "target_system": "google_ads",
                    "scope": "Wasteful spend identified with no CRM pipeline matching.",
                    "reason": reason,
                })
            elif sig_type == "seo_topic_under_supported_by_paid":
                actions.append({
                    "action_type": "propose_budget_increase",
                    "target_system": "google_ads",
                    "scope": "High-value SEO topics currently lacking paid amplification.",
                    "reason": reason,
                })
            elif sig_type == "reallocate_budget_from_weak_paid_to_strong_seo":
                actions.append({
                    "action_type": "propose_budget_reallocation",
                    "target_system": "google_ads",
                    "from": "low-converting_paid_terms",
                    "to": "high-performing_seo_topics",
                    "reason": reason,
                })

        return {
            "status": "SUCCESS" if self.client else "DEGRADED",
            "insight": strat_decision,
            "combined_score": combined_score,
            "market_context": market_context,
            "signals": signals,
            "actions": actions,
            "market_focus": active_market
        }