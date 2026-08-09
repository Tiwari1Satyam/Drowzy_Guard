import requests

TELEGRAM_TOKEN = "8542957804:AAGVR3SCoX12G5CFZT3d3_wUmFlg6HNcadc"
TELEGRAM_CHAT_ID = "8788131109"

def test_telegram():
    print(f"Testing Telegram Bot with Token: {TELEGRAM_TOKEN[:10]}...")
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": "🛠️ TEST: SOS system connected! If you see this, your Telegram bot is working."
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response JSON: {response.json()}")
        if response.status_code == 200:
            print("✅ SUCCESS! Check your Telegram app.")
        else:
            print("❌ FAILED. Look at the error message above.")
    except Exception as e:
        print(f"💥 CONNECTION ERROR: {e}")

if __name__ == "__main__":
    test_telegram()
