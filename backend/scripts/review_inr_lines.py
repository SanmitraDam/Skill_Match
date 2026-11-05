# -*- coding: utf-8 -*-
"""Show all lines with _inr/_usd tokens AND digits, for manual conversion review."""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IGNORE = {".git", "node_modules", ".next", ".venv", "__pycache__", ".pytest_cache", "dist", "build", "data", "scripts"}
FILES = [
    r"backend\app\services\autonomous_enterprise_service.py",
    r"backend\app\services\swarm_market_service.py",
    r"backend\app\services\skill_staking_service.py",
    r"backend\app\services\agent_negotiation.py",
    r"backend\app\services\multi_species_enterprise_guild_service.py",
    r"backend\app\services\skill_amm_service.py",
    r"backend\app\services\autonomous_consortium_service.py",
    r"backend\app\services\dat_constitution_service.py",
    r"backend\app\services\marl_squad_orchestrator_service.py",
    r"backend\app\services\project_swarm_service.py",
    r"backend\app\services\zk_did_royalty_service.py",
    r"backend\app\services\executive_copilot_service.py",
    r"backend\app\services\skill_treasury_vault_service.py",
]
for f in FILES:
    p = os.path.join(ROOT, f)
    print("==== " + f)
    for i, l in enumerate(open(p, encoding="utf-8", errors="ignore"), 1):
        if "_inr" in l and re.search(r"\d", l):
            print(f"{i}: {l.strip()[:150]}")
