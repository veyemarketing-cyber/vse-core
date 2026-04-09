import os
import sys
import json
from http.server import BaseHTTPRequestHandler

IMPORT_ERROR = None
core = None
intel = None

# VSE ARCHITECTURE: Priority Pathing
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Local .env support when available
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# SILO SYNTHESIS: Importing the Core and Intel
try:
    from orchestrator_logic import core, intel
except Exception as e:
    IMPORT_ERROR = str(e)


class VSEActuator:
    def __init__(self):
        if core is None or intel is None:
            raise Exception(f"Brain Sync Failed: {IMPORT_ERROR}")

        self.orchestrator = core.VSEOrchestrator()
        self.surgeon = intel.SearchAtlasSilo()

    def run_market_pivot(self, user_input=""):
        audit_data = self.surgeon.get_richmond_audit()

        if not audit_data:
            return {
                "status": "DEGRADED",
                "mode": "simulate",
                "input": user_input,
                "market": "Unknown Market",
                "insight": "Search Atlas intel unavailable",
                "combined_score": None,
                "market_context": {},
                "signals": [],
                "actions": []
            }

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
            "mode": "simulate",
            "input": user_input,
            "market": audit_data.get("market", "Unknown Market"),
            "insight": decision.get("insight", "Manual Review Required"),
            "combined_score": decision.get("combined_score"),
            "market_context": decision.get("market_context", {}),
            "signals": decision.get("signals", []),
            "actions": decision.get("actions", [])
        }


class handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        self.send_response(status)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({"status": "OK"}, 200)
        return

    def do_GET(self):
        try:
            actuator = VSEActuator()
            result = actuator.run_market_pivot("")
            self._send_json(result, 200)
        except Exception as e:
            self._send_json({
                "error": str(e),
                "status": "CRITICAL_FAILURE",
                "import_error": IMPORT_ERROR,
                "diagnostics": sys.path
            }, 500)
        return

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"
            body = json.loads(raw_body.decode("utf-8") or "{}")

            user_input = str(body.get("input", "")).strip()

            actuator = VSEActuator()
            result = actuator.run_market_pivot(user_input)
            self._send_json(result, 200)
        except Exception as e:
            self._send_json({
                "error": str(e),
                "status": "CRITICAL_FAILURE",
                "import_error": IMPORT_ERROR,
                "diagnostics": sys.path
            }, 500)
        return