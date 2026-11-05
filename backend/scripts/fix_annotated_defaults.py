# -*- coding: utf-8 -*-
"""Second pass: convert `cur_key: type = NUM` annotated defaults to INR (x83).

The main migration handled dict values, kwargs, Field(...) defaults and
TS object literals, but Python/TS *annotated* assignments of the form
`some_usd_field: float = 2500000.0` were not converted. This pass targets
only that form (safe: `: type =` cannot be a dict entry).
"""
import os
import re
import sys
from decimal import Decimal

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RATE = Decimal("83")
IGNORE_DIRS = {".git", "node_modules", ".next", ".venv", "__pycache__",
               ".pytest_cache", "dist", "build", "data"}
EXTS = (".py", ".ts", ".tsx")
SKIP_FILES = {"convert_currency_to_inr.py", "fix_annotated_defaults.py",
              "scan_currency.py", "test_migration_samples.py"}

CUR_TOKEN = r"(?:usd|USD|Usd|usdc|USDC|Usdc|inr|INR|Inr)"
NUM = r"-?\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?"

# cur_key: float = 123.4   /   cur_key: number = 123   (annotated default)
PAT = re.compile(
    r"(?<![A-Za-z])(" + CUR_TOKEN + r"[A-Za-z0-9_]*)"
    r"(\s*:\s*[\w.\[\]\"']+\s*=\s*)"
    r"(" + NUM + r")(?![\w.=])"
)


def mult_str(num_s: str) -> str:
    d = Decimal(num_s.replace("_", "")) * RATE
    if d == d.to_integral_value():
        return str(int(d))
    out = f"{d:f}".rstrip("0").rstrip(".")
    return out


changed = []


def migrate(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        orig = f.read()
    new = PAT.sub(lambda m: m.group(1) + m.group(2) + mult_str(m.group(3)), orig)
    if new != orig:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(new)
        changed.append(os.path.relpath(path, ROOT))


for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in IGNORE_DIRS]
    for f in fn:
        if f.endswith(EXTS) and f not in SKIP_FILES:
            migrate(os.path.join(dp, f))

print(f"Files modified: {len(changed)}")
for p in changed:
    print("  ", p)
