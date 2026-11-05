# -*- coding: utf-8 -*-
"""Final verification: find genuine leftover dollar-currency references.

Genuine = "$123" display strings, or usd/USD/USDC identifiers/words.
Ignored = markdown (LaTeX $math$), `${...}` TS template literals,
`sha256$` separators, the ($0-100$) score scale, scripts/ helpers.
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IGNORE_DIRS = {".git", "node_modules", ".next", ".venv", "__pycache__",
               ".pytest_cache", "dist", "build", "data", "scripts"}
EXTS = (".py", ".ts", ".tsx", ".html")

CUR_RE = re.compile(
    r"\$\d"                       # $123 display
    r"|(?<![A-Za-z0-9])(?:usdc|usd)(?![A-Za-z0-9])"   # usd/usdc identifiers or words
    r"|\bdollar",                 # the word "dollar"
    re.IGNORECASE,
)
FALSE_POSITIVE_RE = re.compile(
    r"\$\{[^}]*\}"                # TS template literal ${...}
    r"|sha256\$"
    r"|\(\$0-100\$\)"
    r"|\$0-100\$"
)

hits = []
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in IGNORE_DIRS]
    for f in fn:
        if f.endswith(EXTS):
            p = os.path.join(dp, f)
            rel = os.path.relpath(p, ROOT)
            for ln, line in enumerate(open(p, encoding="utf-8", errors="ignore"), 1):
                stripped = FALSE_POSITIVE_RE.sub("", line)
                m = CUR_RE.search(stripped)
                if m:
                    hits.append(f"{rel}:{ln}: {line.strip()[:150]}")

print("\n".join(hits))
print(f"TOTAL genuine leftovers: {len(hits)}")
