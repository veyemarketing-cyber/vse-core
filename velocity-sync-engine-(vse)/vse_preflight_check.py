import yaml
import os
# Adjusting imports for the new directory structure
from core.data_loom import DataLoom
from core.orchestrator_logic import VSEOrchestrator

def run_preflight():
    print("--- VSE Architecture: Pre-Flight Check ---")
    
    # 1. Initialize Orchestration
    # The Orchestrator will automatically load the Governance Manifest
    orchestrator = VSEOrchestrator()

    # 2. Simulate Richmond, VA Market Truth (External)
    mock_market_data = {
        "visibility_score": 45, 
        "vse_metadata": {
            "estimated_cost_usd": 0.0042,
            "token_count": 850
        }
    }
    
    # 3. Simulate Lead Connector Data (Internal)
    mock_crm_data = {
        "lead_velocity": 0.85
    }

    print("[1/2] Weaving Silos in the Data Loom...")
    
    # 4. Run through the Governance Gate
    decision = orchestrator.evaluate_strategic_move(mock_market_data, mock_crm_data)
    
    print(f"[2/2] Orchestrator Decision: {decision['status']}")
    print(f"Strategic Insight: {decision.get('insight') or decision.get('reason')}")

    if decision['status'] == "PENDING_HUMAN_APPROVAL":
        print("\nSUCCESS: Governance-as-Code is ACTIVE.")
        print("The Actuator is locked. System is awaiting your handshake.")
    else:
        print("\nALERT: Check Governance Manifest paths.")

if __name__ == "__main__":
    run_preflight()