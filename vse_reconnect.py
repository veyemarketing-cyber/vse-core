import os
import requests
from dotenv import load_dotenv

# Load your Architecture credentials
load_dotenv(".env.local")

def get_new_auth_code():
    # 1. Trigger the Reconnect API
    reconnect_url = "https://services.leadconnectorhq.com/oauth/reconnect"
    
    # You will need your Location ID from your GHL URL (the string of characters after /location/)
    location_id = input("Enter your Veye Media Location ID: ")

    payload = {
        "clientKey": os.getenv("GHL_CLIENT_ID"),
        "clientSecret": os.getenv("GHL_CLIENT_SECRET"),
        "locationId": location_id
    }
    
    print("\nRequesting fresh Authorization Code via Reconnect API...")
    response = requests.post(reconnect_url, json=payload)
    
    if response.status_code == 200:
        auth_code = response.json().get("authorizationCode")
        print(f"✅ Success! New Auth Code obtained: {auth_code}")
        return auth_code
    else:
        print(f"❌ Reconnect Failed: {response.text}")
        return None

def exchange_for_permanent_tokens(auth_code):
    # 2. Exchange that code for your Permanent Refresh Token
    token_url = "https://services.leadconnectorhq.com/oauth/token"
    
    payload = {
        'client_id': os.getenv("GHL_CLIENT_ID"),
        'client_secret': os.getenv("GHL_CLIENT_SECRET"),
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': os.getenv("GHL_REDIRECT_URI"),
        'user_type': 'Location'
    }
    
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    response = requests.post(token_url, data=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("\n" + "="*50)
        print("✅ ACTIVE AUTONOMY ENABLED")
        print("="*50)
        print(f"NEW REFRESH TOKEN: {data['refresh_token']}")
        print("\nACTION: Copy this Refresh Token into your .env.local file!")
        print("="*50)
    else:
        print(f"❌ Token Exchange Failed: {response.text}")

if __name__ == "__main__":
    code = get_new_auth_code()
    if code:
        exchange_for_permanent_tokens(code)