import os
import sys
import json
from http.server import BaseHTTPRequestHandler

IMPORT_ERROR = None

# VSE ARCHITECTURE: Priority Pathing
# This tells the Python engine to look in the current folder for our logic silos
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# SILO SYNTHESIS: Importing the Core and Intel
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # In Vercel, rely on real environment variables instead of .env file
    pass


class VSEActuator:
    def __init__(self):
        if core is None or intel is None:
            raise Exception(f"Brain Sync Failed: {IMPORT_ERROR}")
        self.orchestrator = core.VSEOrchestrator()
        self.surgeon = intel.SearchAtlasSilo()

    def run_market_pivot(self):
        # The engine's strategic move: Richmond cross-silo analysis
        audit_data = self.surgeon.get_richmond_audit()

        if not audit_data:
            return {
                "status": "DEGRADED",
                "insight": "Search Atlas intel unavailable",
                "combined_score": None,
                "market_context": {},
                "signals": [],
                "actions": []
            }

        # Demo CRM payload: proves the VSE is orchestrating silos,
        # not just reading SEO or moving budgets blindly.
        crm_data = {
            "velocity": 0.0,
            "status": "ACTIVE_DEPLOY",
            "opportunities_created": 2,
            "opportunities_from_seo_topic": 2,
            "pipeline_value_from_seo_topic": 18000.0
        }

        decision = self.orchestrator.evaluate_strategic_move(
            market_data=audit_data,
            crm_data=crm_data
        )

        return {
            "status": "SUCCESS",
            "market": audit_data.get("market", "Unknown Market"),
            "insight": decision.get("insight", "Manual Review Required"),
            "combined_score": decision.get("combined_score"),
            "market_context": decision.get("market_context", {}),
            "signals": decision.get("signals", []),
            "actions": decision.get("actions", [])
        }


# THE HANDSHAKE: Vercel Entry Point
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            actuator = VSEActuator()
            result = actuator.run_market_pivot()

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": str(e),
                "status": "CRITICAL_FAILURE",
                "diagnostics": sys.path
            }).encode())
        return