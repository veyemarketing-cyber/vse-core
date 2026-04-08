import os
import sys
import json
from http.server import BaseHTTPRequestHandler

# VSE ARCHITECTURE: Priority Pathing
# This tells the Python engine to look in the current folder for our logic silos
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# SILO SYNTHESIS: Importing the Core and Intel
try:
    # We import these directly since they are now in the same /api folder
    import orchestrator_logic as core
    import search_atlas_intel as intel
    # This specific line checks for the AI library installation
    import google.generativeai as genai
except ImportError as e:
    core = None
    intel = None
    IMPORT_ERROR = str(e)

class VSEActuator:
    def __init__(self):
        if core is None or intel is None:
            raise Exception(f"Brain Sync Failed: {IMPORT_ERROR}")
        self.orchestrator = core.VSEOrchestrator()
        self.surgeon = intel.SearchAtlasSilo()

    def run_market_pivot(self):
        # The engine's first strategic move: Richmond Analysis
        audit_data = self.surgeon.get_richmond_audit()
        decision = self.orchestrator.evaluate_strategic_move(
            market_data=audit_data,
            crm_data={"velocity": 0.0, "status": "ACTIVE_DEPLOY"}
        )
        return {
            "insight": decision.get("insight", "Manual Review Required"),
            "status": "SUCCESS"
        }

# THE HANDSHAKE: Vercel Entry Point
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            actuator = VSEActuator()
            result = actuator.run_market_pivot()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # This captures the 'genai' error and prints it to the browser
            self.wfile.write(json.dumps({
                "error": str(e), 
                "status": "CRITICAL_FAILURE",
                "diagnostics": sys.path
            }).encode())
        return
