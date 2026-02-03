import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8000"
USERNAME = "adede"
PASSWORD = "nashipae"

def test_api():
    print(f"Attempting login for {USERNAME}...")
    try:
        response = requests.post(f"{BASE_URL}/api/token/", json={"username": USERNAME, "password": PASSWORD})
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        sys.exit(1)

    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        sys.exit(1)
    
    token = response.json().get("token")
    print(f"Login successful. Token: {token[:10]}...")
    
    headers = {"Authorization": f"Token {token}"}
    
    # Test Transactions
    print("\nTesting /api/transactions/...")
    try:
        r = requests.get(f"{BASE_URL}/api/transactions/", headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Response: {r.text}")
        else:
            print(f"Success. Count: {len(r.json())}")
    except Exception as e:
        print(f"Exception: {e}")

    # Test Dashboard Stats
    print("\nTesting /api/dashboard/stats/...")
    try:
        r = requests.get(f"{BASE_URL}/api/dashboard/stats/", headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code != 200:
            print(f"Response: {r.text}")
        else:
            print(f"Success. Data: {r.json()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # Give server a moment if just started
    time.sleep(2)
    test_api()
