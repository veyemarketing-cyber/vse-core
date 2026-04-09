class DataLoom:
    def __init__(self):
        self.layer = "Synthesis"

    def weave_silos(self, crm_data, market_data):
        """
        Combines siloed threads (CRM, SEO, spend) into a unified tapestry
        for the Senior Strategist and the Clarity Core.

        Expected structure (you can mock this in search_atlas_intel/orchestrator):

        crm_data = {
            "opportunities_created": int,
            "opportunities_from_seo_topic": int,
            "pipeline_value_from_seo_topic": float,
            "status": "ACTIVE_DEPLOY" | ...
        }

        market_data = {
            "seo_visibility_score": float,   # 0–100
            "seo_topic": str,               # e.g. "active autonomy architecture"
            "paid_spend_on_topic": float,   # dollars
            "paid_spend_on_other_terms": float,
            "location": "Richmond, VA",
            "channel_breakdown": {...}
        }
        """

        # --- Extract core signals ---
        seo_visibility = float(market_data.get("seo_visibility_score", 0.0))
        seo_topic = market_data.get("seo_topic", "Unknown Topic")
        paid_on_topic = float(market_data.get("paid_spend_on_topic", 0.0))
        paid_on_other = float(market_data.get("paid_spend_on_other_terms", 0.0))

        opps_total = int(crm_data.get("opportunities_created", 0))
        opps_from_seo = int(crm_data.get("opportunities_from_seo_topic", 0))
        pipeline_from_seo = float(crm_data.get("pipeline_value_from_seo_topic", 0.0))

        location = market_data.get("location", "Unknown Market")

        # --- Build cross-silo insights ---

        signals = []

        # 1) Wasteful paid (spend without pipeline)
        if paid_on_other > 0 and opps_total == 0:
            signals.append({
                "type": "cross_silo_spend_no_pipeline",
                "severity": "warning",
                "narrative": (
                    f"In {location}, there is paid spend on generic terms "
                    f"(${paid_on_other:,.0f}) that is not creating opportunities in the CRM."
                ),
                "recommended_action": (
                    "Reduce spend on these low-converting paid campaigns and reallocate toward "
                    "proven demand around the SEO topic."
                )
            })

        # 2) Strong SEO + CRM performance, under-supported by paid
        if seo_visibility >= 70 and opps_from_seo > 0:
            if paid_on_topic < paid_on_other:
                signals.append({
                    "type": "seo_topic_under_supported_by_paid",
                    "severity": "info",
                    "narrative": (
                        f"The SEO topic '{seo_topic}' in {location} has strong visibility "
                        f"and is generating {opps_from_seo} opportunities worth "
                        f"${pipeline_from_seo:,.0f} in pipeline, but paid support on this "
                        "topic is relatively low."
                    ),
                    "recommended_action": (
                        "Increase budget around this topic and related keywords to amplify "
                        "proven, CRM-backed demand."
                    )
                })

        # 3) Aggregate reallocation recommendation
        if paid_on_other > 0 and opps_from_seo > 0:
            signals.append({
                "type": "reallocate_budget_from_weak_paid_to_strong_seo",
                "severity": "info",
                "narrative": (
                    f"Cross-silo view for {location}: generic paid spend is underperforming "
                    "while the SEO topic is creating real pipeline. Budget should be shifted "
                    "from the weak paid segment into campaigns aligned with the high-performing "
                    "SEO topic."
                ),
                "recommended_action": (
                    "Reallocate a portion of paid search spend from low-converting terms to "
                    "campaigns that mirror the high-performing SEO topic."
                )
            })

        # Fallback if no specific signals fired
        if not signals:
            signals.append({
                "type": "status_check",
                "severity": "info",
                "narrative": (
                    f"Market {location} is in a neutral state. No critical cross-silo "
                    "imbalances detected in this snapshot."
                ),
                "recommended_action": "Continue monitoring; no immediate reallocations required."
            })

        # --- Combined score for quick read ---
        # Simple demo metric: visibility + pipeline weight - waste
        combined_score = (
            seo_visibility
            + (pipeline_from_seo / 1000.0)  # scale pipeline
            - (paid_on_other / 1000.0)      # penalize wasteful spend
        )

        return {
            "combined_score": combined_score,
            "market_context": {
                "location": location,
                "seo_topic": seo_topic,
                "seo_visibility_score": seo_visibility,
                "paid_spend_on_topic": paid_on_topic,
                "paid_spend_on_other_terms": paid_on_other,
                "opportunities_created": opps_total,
                "opportunities_from_seo_topic": opps_from_seo,
                "pipeline_value_from_seo_topic": pipeline_from_seo,
            },
            "signals": signals,
        }