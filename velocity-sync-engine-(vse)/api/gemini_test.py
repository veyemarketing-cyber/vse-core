import os
import json
from google import genai

def handler(request):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing GEMINI_API_KEY"})
        }

    # Parse JSON body from the POST request
    try:
        body = json.loads(request.body or "{}")
        prompt = body.get("prompt", "")
    except Exception:
        prompt = ""

    if not prompt:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing prompt"})
        }

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
    )

    text = getattr(response, "text", "") or ""

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"text": text})
    }