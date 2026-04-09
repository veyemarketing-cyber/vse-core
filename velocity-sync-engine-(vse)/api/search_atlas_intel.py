import os
from dotenv import load_dotenv

# VSE Silo Handshake: Connecting to the Search Atlas Vault
load_dotenv()


class SearchAtlasSilo:
    def __init__(self):
        """
        The Surgeon: Specialized Intel for Local Market Visibility.
        """
        self.api_key = os.getenv("SEARCH_ATLAS_API_KEY")
        self.base_url = "https://api.searchatlas.com/v1"

    def get_richmond_audit(self):
        """
        Pulls high-resolution market intelligence for the RVA sector.

        For demo purposes, this returns a simulated cross-silo SEO / paid snapshot
        that the Data Loom can combine with CRM data.
        """
        if not self.api_key:
            print("WARNING: Search Atlas API key is missing. Using demo market segmentation.")
            return None

        return {
            "market": "Richmond, VA",
            "location": "Richmond, VA",
            "seo_visibility_score": 78,
            "seo_topic": "active autonomy architecture",
            "target_zips": ["23219", "23220", "23221"],
            "competitors": ["Legacy Firm A", "Regional Bank B"],
            "status": "ACTIVE",
            "top_keywords": [
                "Richmond financial advisor",
                "RVA corporate law",
                "active autonomy architecture",
            ],

            # Cross-silo demo fields
            "paid_spend_on_topic": 300.0,
            "paid_spend_on_other_terms": 1200.0,
            "channel_breakdown": {
                "organic_search": {
                    "visibility_score": 78,
                    "traffic_trend": "UP",
                    "top_topic": "active autonomy architecture",
                },
                "paid_search": {
                    "spend": 1500.0,
                    "trend": "UNDERPERFORMING",
                },
            },

            # Keep backwards compatibility in case other parts still use it
            "visibility_score": 78,
            "market_context": "Richmond growth market with under-supported SEO demand"
        }