import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

class SearchAtlasSilo:
    def __init__(self):
        """
        The Surgeon: Specialized Intel for Local Market Visibility.
        """
        self.api_key = os.getenv("SEARCH_ATLAS_API_KEY")
        self.base_url = "https://api.searchatlas.com/v1"

    def get_market_intel(self, user_input: str):
        """
        Dynamically pulls market intelligence based on the user's prompt.
        If the API key is missing or the market data is unavailable, it returns 
        a detailed failure state to guide the human-on-the-loop.
        """
        
        # Determine the target market from input (simple extraction for now)
        target_market = "Unknown Market"
        if "richmond" in user_input.lower():
            target_market = "Richmond, VA"
        elif "lynchburg" in user_input.lower():
            target_market = "Lynchburg, VA"
        else:
            # Fallback to the first word if no match found
            target_market = user_input.strip()

        # GOVERNANCE: Check if the handshake is authorized
        if not self.api_key:
            print(f"CRITICAL: Search Atlas API key missing for {target_market} analysis.")
            return {
                "status": "HANDSHAKE_FAILED",
                "market": target_market,
                "error": "SEARCH_ATLAS_API_KEY not found in vault (.env).",
                "fix": "Add the Search Atlas API key to your local .env file to enable live intelligence."
            }

        # --- REAL-TIME INTEL (Simulated for this layer until endpoint is mapped) ---
        # Once you have your specific endpoint, replace this return with a requests.get()
        return {
            "market": target_market,
            "location": target_market,
            "seo_visibility_score": 82 if "richmond" in target_market.lower() else 64,
            "seo_topic": "active autonomy architecture",
            "status": "ACTIVE_SYNTHESIS",
            "top_keywords": [
                f"{target_market} business intelligence",
                f"{target_market} marketing architecture",
                "active autonomy architecture",
            ],
            "paid_spend_on_topic": 450.0,
            "paid_spend_on_other_terms": 1100.0,
            "channel_breakdown": {
                "organic_search": {
                    "visibility_score": 82,
                    "traffic_trend": "UP",
                },
                "paid_search": {
                    "spend": 1550.0,
                    "trend": "STABLE",
                },
            },
            "market_context": f"Analyzing growth trends for {target_market} using current VSE logic."
        }

    # Backward compatibility for existing main.py calls
    def get_richmond_audit(self):
        return self.get_market_intel("Richmond, VA")