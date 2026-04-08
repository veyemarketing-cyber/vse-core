import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from data_loom import DataLoom
except ImportError:
    DataLoom = None

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
            return {"error": "Orchestrator Brain Offline", "status": self.status}

        synthesis = self.loom.weave_silos(crm_data, market_data) if self.loom else {}

        velocity = crm_data.get("velocity", 0)
        launch_context = ""
        if velocity == 0:
            launch_context = (
                "IMPORTANT CONTEXT: Snov.io outreach initiates tomorrow. "
                "Current zero velocity is an expected pre-launch state. "
            )

        prompt = (
            f"As the VSE Senior Strategist, analyze this synthesized context: {synthesis}. "
            f"{launch_context}"
            "Context: Veye Media targeting Richmond, Virginia. "
            "Task: Produce a strategic recommendation with rationale, risks, and next actions. "
            "Constraints: Do not use the phrases 'cutting-edge' or 'competitive landscape'. "
            "Tone: Professional, authoritative, artisanal."
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=1200
                ),
            )
            strat_decision = response.text
        except Exception as e:
            strat_decision = f"Fallback: {str(e)[:200]}"

        return {
            "status": "PENDING_HUMAN_APPROVAL",
            "insight": strat_decision,
            "metadata": synthesis.get("market_context") if synthesis else "No Context",
            "launch_readiness": "READY_FOR_REVIEW"
        }