import os

for f in [".env", ".env.example"]:
    print(f"--- {f} ---")
    if not os.path.exists(f):
        print("NOT FOUND")
        continue
    for ln in open(f, encoding="utf-8").read().splitlines():
        if ln.strip().startswith(("GEMINI", "GROQ")):
            k, _, v = ln.partition("=")
            v = v.strip()
            shown = v[:6] + "..." + v[-4:] if len(v) > 12 else "(short/placeholder)"
            print(f"{k}={shown} (len={len(v)})")
        else:
            print(ln)

# Now check what the app settings actually load
from app.core.config import settings
k = settings.GEMINI_API_KEY
print("--- settings ---")
print("GEMINI_MODEL:", settings.GEMINI_MODEL)
print("GEMINI_API_KEY:", (k[:6] + "..." + k[-4:]) if len(k) > 12 else "(placeholder/empty)")
