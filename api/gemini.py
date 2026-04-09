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

    client = genai.Client(api_key=api_key)

    # Parse JSON body from request to get the prompt
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

    # Call Gemini with the full orchestration prompt
    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
    )

    # response.text is already the JSON object you saw in DevTools.
    # Wrap it in { "text": ... } so the TS client continues to work unchanged.
    orchestration_json = response.text  # string

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"text": orchestration_json})
    }