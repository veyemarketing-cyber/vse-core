import os
from google import genai

def handler(request):
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not api_key:
        return {
            "statusCode": 500,
            "body": "Missing GEMINI_API_KEY"
        }

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents="Reply with exactly: VSE heartbeat online"
    )

    return {
        "statusCode": 200,
        "body": response.text
    }