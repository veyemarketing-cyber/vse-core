import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

# VSE ARCHITECTURE: Priority Pathing
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# SILO SYNTHESIS: Import Logic
IMPORT_ERROR = None
try:
    from orchestrator_logic import VSEOrchestrator
    from search_atlas_intel import SearchAtlasSilo
except Exception as e:
    IMPORT_ERROR = str(e)

app = Flask(__name__)
CORS(app) # CRITICAL: This allows the Frontend to talk to the Backend

# NGROK BYPASS: Inject header to skip the browser warning page
@app.after_request
def add_header(response):
    response.headers['ngrok-skip-browser-warning'] = 'true'
    return response

class VSEActuator:
    def __init__(self):
        if 'VSEOrchestrator' not in globals() or 'SearchAtlasSilo' not in globals():
            raise Exception(f"Brain Sync Failed: {IMPORT_ERROR}")
        self.orchestrator = VSEOrchestrator()
        self.surgeon = SearchAtlasSilo()

    def run_market_pivot(self, user_input: str = ""):
        audit_data = self.surgeon.get_richmond_audit()
        if not audit_data:
            return {
                "status": "DEGRADED",
                "insight": "Search Atlas intel unavailable for Richmond.",
                "market": "Richmond, VA"
            }

        crm_data = {
            "velocity": 0.0,
            "status": "ACTIVE_DEPLOY",
            "opportunities_created": 2,
            "pipeline_value_from_seo_topic": 18000.0,
        }

        decision = self.orchestrator.evaluate_strategic_move(
            market_data=audit_data,
            crm_data=crm_data,
        )

        return {
            "status": "SUCCESS",
            "market": audit_data.get("market", "Richmond, VA"),
            "insight": decision.get("insight", "Architecture analysis complete."),
            "mode": "simulate"
        }

@app.route('/api/main', methods=['POST', 'OPTIONS'])
def main_endpoint():
    if request.method == 'OPTIONS':
        return jsonify({"status": "OK"}), 200
    
    try:
        body = request.get_json()
        user_input = body.get("input", "").strip()
        
        actuator = VSEActuator()
        result = actuator.run_market_pivot(user_input)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "CRITICAL_FAILURE",
            "import_error": IMPORT_ERROR
        }), 500

if __name__ == '__main__':
    # SYNCING TO PORT 3000 AS REQUESTED
    print("VSE Orchestrator Online. Listening on Port 3000...")
    app.run(host='127.0.0.1', port=3000, debug=True)