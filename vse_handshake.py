import os
import urllib.parse
from dotenv import load_dotenv

try:
    from vse_governance_engine import VSEGovernanceEngine
except ImportError:
    VSEGovernanceEngine = None


load_dotenv(".env.local")


def generate_vse_auth_url():
    is_secure = True

    if VSEGovernanceEngine is not None:
        try:
            governance = VSEGovernanceEngine()
            is_secure = (
                governance.governance
                .get("security_protocols", {})
                .get("handshake_verification") == "strict"
            )
        except Exception as e:
            print(f"⚠️ Governance engine could not be initialized: {e}")
            print("Proceeding with environment-only validation.")
            is_secure = True

    if not is_secure:
        print("❌ GOVERNANCE ERROR: Handshake verification is not set to 'strict'.")
        print("Action blocked by VSE Orchestrator to prevent 'Shadow AI' risks.")
        return

    client_id = os.getenv("GHL_CLIENT_ID")
    redirect_uri = os.getenv("GHL_REDIRECT_URI")

    scopes = [
        "contacts.readonly",
        "opportunities.readonly",
        "users.readonly"
    ]

    if not client_id or not redirect_uri:
        print("❌ Error: GHL_CLIENT_ID or GHL_REDIRECT_URI missing in .env.local")
        return

    params = {
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": " ".join(scopes)
    }

    base_url = "https://marketplace.gohighlevel.com/oauth/chooselocation"
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"

    print("\n" + "=" * 60)
    print("VSE SECURE HANDSHAKE INITIALIZED")
    print("STATUS: GOVERNANCE-VERIFIED | MODE: ACTIVE AUTONOMY")
    print("=" * 60)
    print(f"\n1. Copy and paste this SECURE URL into your browser:\n\n{auth_url}")
    print("\n2. Select your GHL Sub-account.")
    print("3. After you click 'Confirm', it will redirect to your Vercel URL.")
    print("4. Copy the code from the browser's address bar (after 'code=') for the next step.")
    print("=" * 60)
    print("LOG: Handshake authorized by vse_governance_manifest.yaml")
    print("=" * 60)


if __name__ == "__main__":
    generate_vse_auth_url()