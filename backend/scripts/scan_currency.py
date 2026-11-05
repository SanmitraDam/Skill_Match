import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ignore_dirs = {'.git', 'node_modules', '.next', '.venv', '__pycache__', '.pytest_cache'}

matches = []
for dp, dirs, files in os.walk(root):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for fn in files:
        if fn.endswith(('.ts', '.tsx', '.py', '.html')):
            fpath = os.path.join(dp, fn)
            relpath = os.path.relpath(fpath, root)
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                for ln, l in enumerate(f, 1):
                    # Check for explicit rupee amounts or INR or dollar/salary/rate display
                    if re.search(r'(₹\s*\d|\bINR\b|\brupee|\bfees?_saved|₹\s*\{fmt|`\s*₹|>\s*₹|["\']\s*₹|spot:\s*[\'"`]₹|rate:\s*[\'"`]₹|cost_savings|base_salary|signing_bonus|avg_salary)', l, re.IGNORECASE):
                        matches.append((relpath, ln, l.strip()))

for m in matches:
    print(f"{m[0]}:{m[1]}: {m[2]}")
print(f"Total matches found: {len(matches)}")
