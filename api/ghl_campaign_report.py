"""Authenticated on-demand campaign report for the VSE server runtime."""
import hmac
import json
import os
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler

from scripts.ghl_campaign_report import CAMPAIGNS, collect


class handler(BaseHTTPRequestHandler):
    def respond(self, status, body):
        payload = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "private, no-store")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        secret = os.getenv("VSE_CAMPAIGN_REPORT_SECRET", "")
        authorization = self.headers.get("Authorization", "")
        if not secret or not hmac.compare_digest(
            authorization.encode("utf-8"), f"Bearer {secret}".encode("utf-8")
        ):
            self.respond(401, {"error": "Unauthorized"})
            return

        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=30)).isoformat(timespec="seconds")
        end = now.isoformat(timespec="seconds")
        campaigns = [collect(campaign, end, start) for campaign in CAMPAIGNS]
        self.respond(200, {"campaigns": campaigns})
