"""Collect aggregate HighLevel campaign metrics for Veye Media and Veye Marketing.

Set GHL_VEYE_MEDIA_TOKEN and GHL_VEYE_MARKETING_TOKEN in the runtime environment.
Run python3 scripts/ghl_campaign_report.py for a JSON report. Standard output is
newline-delimited JSON suitable for a BigQuery load into vse_intelligence.
Email figures are source-to-date; skips cover the explicit window in each row.
Null metrics indicate unavailable data. A partial report exits with status 1.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API = "https://services.leadconnectorhq.com"
CAMPAIGNS = (
    (
        "Veye Media", "Marketing Agency Sequence - 2026",
        "2BO0WzizAZIvAKFKyiD4", "dfc1a06f-f50e-4668-aebd-43ae7f742bd5",
        "GHL_VEYE_MEDIA_TOKEN",
    ),
    (
        "Veye Marketing", "Website & Digital Marketing Services",
        "hsomGVxHulD1vPcCLyvN", "bf441db2-1c07-42d0-baed-bb61ab79664b",
        "GHL_VEYE_MARKETING_TOKEN",
    ),
)


def get_json(path, token, params=None):
    url = API + path
    if params:
        url += "?" + urlencode(params)
    request = Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Version": "v3",
        "Accept": "application/json",
    })
    try:
        with urlopen(request, timeout=15) as response:
            data = json.load(response)
    except HTTPError as error:
        raise RuntimeError(f"HighLevel HTTP {error.code}") from None
    except (URLError, TimeoutError, ValueError):
        raise RuntimeError("HighLevel response unavailable or invalid") from None
    if not isinstance(data, dict):
        raise RuntimeError("Unexpected HighLevel response")
    return data


def count(value):
    if type(value) is not int or value < 0:
        raise RuntimeError("Missing or invalid count in HighLevel response")
    return value


def collect(campaign, end, start):
    brand, name, location, workflow, variable = campaign
    report = {
        "brand": brand, "campaign": name, "location_id": location,
        "workflow_id": workflow, "collected_at": end,
        "skip_window_start": start, "skip_window_end": end,
        "sent": None, "delivered": None, "bounces": None,
        "hard_bounces": None, "soft_bounces": None, "skipped_email_actions": None,
        "email_stats_error": None, "workflow_logs_error": None,
    }
    token = os.getenv(variable, "").strip()
    if not token:
        report.update(email_stats_error=f"Missing {variable}", workflow_logs_error=f"Missing {variable}")
        return report

    try:
        data = get_json(
            f"/emails/locations/{location}/campaigns/stats/workflow-campaigns/{workflow}",
            token,
        )
        stats = data.get("stats")
        if not isinstance(stats, dict):
            raise RuntimeError("Missing email statistics")
        sent, delivered, hard, soft = (
            count(stats.get(key)) for key in ("sent", "delivered", "permanentFail", "temporaryFail")
        )
        report.update(sent=sent, delivered=delivered, bounces=hard + soft,
                      hard_bounces=hard, soft_bounces=soft)
    except RuntimeError as error:
        report["email_stats_error"] = str(error)

    try:
        data = get_json(f"/workflows/{workflow}/logs/aggregate", token, {
            "locationId": location, "startDate": start, "endDate": end,
            "groupBy": "status", "statuses": "skipped", "types": "email",
        })
        rows = data.get("statistics")
        if not isinstance(rows, list) or count(data.get("count")) != len(rows):
            raise RuntimeError("Missing or incomplete workflow statistics")
        if any(not isinstance(row, dict) or row.get("status") != "skipped" for row in rows):
            raise RuntimeError("Unexpected workflow statistics")
        report["skipped_email_actions"] = sum(count(row.get("count")) for row in rows)
    except RuntimeError as error:
        report["workflow_logs_error"] = str(error)
    return report


def main():
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=30)).isoformat(timespec="seconds")
    end = now.isoformat(timespec="seconds")
    reports = [collect(campaign, end, start) for campaign in CAMPAIGNS]
    for report in reports:
        print(json.dumps(report))
    return 1 if any(row["email_stats_error"] or row["workflow_logs_error"] for row in reports) else 0


if __name__ == "__main__":
    sys.exit(main())
