import os
import sys
import json

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi.testclient import TestClient
from app.main import app
from app.models.database import SessionLocal
from app.models import models

client = TestClient(app)
USE_LIVE_SERVER = os.environ.get("TEST_USE_LIVE_SERVER", "0") == "1"
BASE_URL = os.environ.get("AUTH_BASE_URL", "http://127.0.0.1:8000/api/v1/auth")

def post_json(endpoint, payload):
    if USE_LIVE_SERVER:
        import urllib.request
        url = f"{BASE_URL}/{endpoint}"
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            return e.code, json.loads(e.read().decode("utf-8"))

    # In-process TestClient execution (fast, isolated, zero server-startup dependency)
    res = client.post(f"/api/v1/auth/{endpoint}", json=payload)
    try:
        data = res.json()
    except Exception:
        data = {"detail": res.text}
    return res.status_code, data

def cleanup_test_user(email: str, username: str):
    db = SessionLocal()
    try:
        db.query(models.User).filter(
            (models.User.email == email) | (models.User.username == username)
        ).delete()
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

def test_full_auth_flows():
    print("=" * 60)
    print("TESTING FULL AUTH VERIFICATION FLOWS (SIGNUP & SIGNIN)")
    print("=" * 60)

    email = "elena.rostova@quantum.ai"
    username = "elena_rostova"

    # Pre-clean test user to guarantee idempotency across multiple test runs
    cleanup_test_user(email, username)

    try:
        # 1. Sign Up OTP Flow
        print(f"\n[1] Dispatching Signup OTP for {email}...")
        status, res = post_json("send-verification", {"email": email, "purpose": "signup"})
        print(f"Status: {status}, Response: {res}")
        assert status == 200, f"Failed to send signup OTP: {res}"
        demo_code = res.get("demo_code")
        print(f"Generated OTP Code: {demo_code}")

        print("\n[2] Verifying OTP code with wrong code...")
        status, res = post_json("verify-code", {"email": email, "code": "000000", "purpose": "signup"})
        print(f"Status: {status}, Response: {res}")
        assert status == 400, "Should fail on invalid code"

        print("\n[3] Verifying OTP with valid code...")
        status, res = post_json("verify-code", {"email": email, "code": demo_code, "purpose": "signup"})
        print(f"Status: {status}, Response: {res}")
        assert status == 200 and res.get("verified") is True, "Failed to verify valid OTP"

        print("\n[4] Registering new candidate account...")
        status, res = post_json("register", {
            "username": username,
            "email": email,
            "password": "ElenaSecurePassword123!",
            "role": "candidate",
            "tenant_id": "tenant_default"
        })
        print(f"Status: {status}, Response: {res}")
        assert status == 200, f"Registration failed: {res}"
        assert "access_token" in res, "Token not issued"
        print(f"Successfully registered user: {res['user']['name']} ({res['user']['role']})")

        # 2. Login Flow (Standard)
        print("\n[5] Testing standard login with new credentials...")
        status, res = post_json("login-json", {
            "identity": email,
            "password": "ElenaSecurePassword123!",
            "require_2fa": False
        })
        print(f"Status: {status}, Response: {res}")
        assert status == 200, "Standard login failed"
        print(f"Login success! Access token length: {len(res['access_token'])}")

        # 3. Login Flow with 2FA
        print("\n[6] Testing login with 2FA enabled...")
        status, res = post_json("login-json", {
            "identity": email,
            "password": "ElenaSecurePassword123!",
            "require_2fa": True
        })
        print(f"Status: {status}, Response: {res}")
        assert status == 200 and res.get("status") == "MFA_REQUIRED", "2FA step not triggered"
        mfa_code = res.get("demo_code")
        print(f"2FA OTP Dispatched: {mfa_code}")

        print("\n[7] Confirming 2FA with invalid code...")
        status, res = post_json("login-json", {
            "identity": email,
            "password": "ElenaSecurePassword123!",
            "require_2fa": True,
            "code": "888888"
        })
        print(f"Status: {status}, Response: {res}")
        assert status == 400, "Invalid 2FA code should be rejected"

        print("\n[8] Confirming 2FA with valid OTP code...")
        status, res = post_json("login-json", {
            "identity": email,
            "password": "ElenaSecurePassword123!",
            "require_2fa": True,
            "code": mfa_code
        })
        print(f"Status: {status}, Response: {res}")
        assert status == 200 and "access_token" in res, "Valid 2FA login failed"
        print("2FA login confirmed and token issued!")

        print("\n" + "=" * 60)
        print("ALL AUTHENTICATION & VERIFICATION FLOW TESTS PASSED 100%!")
        print("=" * 60)
    finally:
        # Clean up after test completion
        cleanup_test_user(email, username)

if __name__ == "__main__":
    test_full_auth_flows()

