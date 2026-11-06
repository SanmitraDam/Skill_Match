"""
sync_vercel_env.py — Sync Local Environment Variables to Vercel
==============================================================
Reads environment variables from .env and frontend/dna-web/.env.local,
generates a consolidated .env.vercel file ready for direct paste into the
Vercel Dashboard (Settings -> Environment Variables), and optionally pushes
them via the Vercel CLI if logged in.
"""

import os
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT_DIR / ".env"
ENV_LOCAL = ROOT_DIR / "frontend" / "dna-web" / ".env.local"
OUTPUT_FILE = ROOT_DIR / ".env.vercel"

def parse_env_file(path: Path) -> dict:
    if not path.exists():
        return {}
    vars = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                vars[key] = val
    return vars

def main():
    root_vars = parse_env_file(ENV_FILE)
    front_vars = parse_env_file(ENV_LOCAL)

    # Master map of variables needed by Vercel (FastAPI Backend + Next.js Frontend)
    vercel_vars = {
        # Database (Neon PostgreSQL Pooled)
        "DATABASE_URL": root_vars.get("DATABASE_URL", ""),
        "DATABASE_URL_UNPOOLED": root_vars.get("DATABASE_URL_UNPOOLED", ""),
        "NEON_BRANCH": root_vars.get("NEON_BRANCH", "production"),

        # Security & Auth
        "SECRET_KEY": root_vars.get("SECRET_KEY", "adcb2fb4d7bcd00be52f1a4b9110a321858c220c204b7fe95fb8576e2f61798a"),
        "ALGORITHM": root_vars.get("ALGORITHM", "HS256"),
        "ACCESS_TOKEN_EXPIRE_MINUTES": root_vars.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"),
        "ALLOWED_ORIGINS": root_vars.get("ALLOWED_ORIGINS", "*"),

        # AI APIs
        "GROQ_API_KEY": root_vars.get("GROQ_API_KEY", ""),
        "GEMINI_API_KEY": root_vars.get("GEMINI_API_KEY", ""),
        "GEMINI_MODEL": root_vars.get("GEMINI_MODEL", "gemini-flash-latest"),

        # Storage (Neon Object Storage - S3 Compatible)
        "STORAGE_TYPE": "s3",
        "S3_BUCKET_NAME": "assets",
        "AWS_ACCESS_KEY_ID": root_vars.get("AWS_ACCESS_KEY_ID", ""),
        "AWS_SECRET_ACCESS_KEY": root_vars.get("AWS_SECRET_ACCESS_KEY", ""),
        "AWS_ENDPOINT_URL_S3": root_vars.get("AWS_ENDPOINT_URL_S3", ""),
        "AWS_REGION": root_vars.get("AWS_REGION", "ap-southeast-1"),

        # Neon Auth & Services
        "NEON_AUTH_BASE_URL": root_vars.get("NEON_AUTH_BASE_URL", ""),
        "NEON_AUTH_JWKS_URL": root_vars.get("NEON_AUTH_JWKS_URL", ""),
        "NEXT_PUBLIC_NEON_AUTH_BASE_URL": front_vars.get("NEXT_PUBLIC_NEON_AUTH_BASE_URL", root_vars.get("NEON_AUTH_BASE_URL", "")),
        "NEON_REALTIME_URL": root_vars.get("NEON_REALTIME_URL", ""),
        "NEON_REALTIME_SECRET": root_vars.get("NEON_REALTIME_SECRET", ""),
        "NEON_FUNCTION_HELLO_BASE_URL": root_vars.get("NEON_FUNCTION_HELLO_BASE_URL", ""),
    }

    # Write .env.vercel
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("# Skill Match — Production Environment Variables for Vercel\n")
        f.write("# Paste directly into: Vercel Dashboard -> Settings -> Environment Variables\n\n")
        for k, v in vercel_vars.items():
            f.write(f'{k}="{v}"\n')

    print(f"[OK] Generated {OUTPUT_FILE} with {len(vercel_vars)} variables.")

    # Check Vercel CLI status
    try:
        res = subprocess.run(["npx", "vercel", "whoami"], capture_output=True, text=True, shell=True)
        if res.returncode == 0 and "Logged out" not in res.stdout and "Logged out" not in res.stderr:
            username = res.stdout.strip()
            print(f"[INFO] Vercel CLI is logged in as: {username}")
            if "--push" in sys.argv:
                print("[INFO] Pushing variables to Vercel via CLI...")
                for k, v in vercel_vars.items():
                    if not v:
                        continue
                    cmd = [
                        "npx", "vercel", "env", "add", k,
                        "--environment", "production,preview,development",
                        "--value", str(v),
                        "--force",
                        "--yes"
                    ]
                    print(f"  Uploading {k}...")
                    subprocess.run(cmd, shell=True)
                print("[OK] All variables pushed to Vercel successfully!")
        else:
            print("[NOTICE] Vercel CLI is not logged in. To sync automatically:")
            print("  1. Run: npx vercel login")
            print("  2. Run: npx vercel link")
            print("  3. Run: python scripts/sync_vercel_env.py --push")
    except Exception as e:
        print(f"[WARN] Vercel CLI check error: {e}")

if __name__ == "__main__":
    main()
