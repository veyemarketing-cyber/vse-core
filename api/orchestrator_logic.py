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
                "insight": "Orchestrator Brain Offline",
                "combined_score": None,
                "market_context": {},
                "signals": [],
                "actions": [],
            }

        # --- Cross-silo synthesis via Data Loom ---
        synthesis = self.loom.weave_silos(crm_data, market_data) if self.loom else {}
        combined_score = synthesis.get("combined_score")
        market_context = synthesis.get("market_context", {})
        signals = synthesis.get("signals", [])

        velocity = crm_data.get("velocity", 0)
        launch_context = ""
        if velocity == 0:
            launch_context = (
                "IMPORTANT CONTEXT: Snov.io outreach initiates tomorrow. "
                "Current zero velocity is an expected pre-launch state. "
            )

        # --- Turn Loom output into a strategist prompt ---
        prompt = (
            "You are the Senior Strategist inside the Velocity Sync Engine (VSE). "
            "You see unified, cross-silo data from CRM, SEO, and paid media.\n\n"
            f"SYNTHESIZED CONTEXT (from the Data Loom): {synthesis}\n\n"
            f"{launch_context}"
            "Context: Veye Media targeting Richmond, Virginia.\n"
            "Task: Produce a strategic recommendation with rationale, risks, and next actions, "
            "explicitly referencing how SEO visibility, CRM pipeline, and paid spend interact.\n"
            "Constraints: Do not use the phrases 'cutting-edge' or 'competitive landscape'.\n"
            "Tone: Professional, authoritative, artisanal."
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=1200,
                ),
            )
            strat_decision = response.text
        except Exception as e:
            strat_decision = f"Fallback: {str(e)[:200]}"

        # --- Map signals to proposed actions for the Actuator / Done List ---
        actions = []
        for sig in signals:
            sig_type = sig.get("type")
            reason = sig.get("narrative")
            if sig_type == "cross_silo_spend_no_pipeline":
                actions.append({
                    "action_type": "propose_budget_reduction",
                    "target_system": "google_ads",
                    "scope": "wasteful_campaigns_with_no_crm_pipeline",
                    "reason": reason,
                })
            elif sig_type == "seo_topic_under_supported_by_paid":
                actions.append({
                    "action_type": "propose_budget_increase",
                    "target_system": "google_ads",
                    "scope": "campaigns_aligned_to_high_value_seo_topics",
                    "reason": reason,
                })
            elif sig_type == "reallocate_budget_from_weak_paid_to_strong_seo":
                actions.append({
                    "action_type": "propose_budget_reallocation",
                    "target_system": "google_ads",
                    "from": "low-converting_paid_terms",
                    "to": "campaigns_mirroring_high-performing_seo_topics",
                    "reason": reason,
                })

        return {
            "status": "PENDING_HUMAN_APPROVAL",
            "insight": strat_decision,
            "combined_score": combined_score,
            "market_context": market_context,
            "signals": signals,
            "actions": actions,
        }