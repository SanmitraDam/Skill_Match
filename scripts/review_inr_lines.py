# -*- coding: utf-8 -*-
"""Show all lines with _inr/_usd tokens AND digits, for manual conversion review."""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = r"c:\Users\ASUS\Downloads\Skill_Match v1"
IGNORE = {".git", "node_modules", ".next", ".venv", "__pycache__", ".pytest_cache", "dist", "build", "data", "scripts"}
FILES = [
    r"app\services\autonomous_enterprise_service.py",
    r"app\services\swarm_market_service.py",
    r"app\services\skill_staking_service.py",
    r"app\services\agent_negotiation.py",
    r"app\services\multi_species_enterprise_guild_service.py",
    r"app\services\skill_amm_service.py",
    r"app\services\autonomous_consortium_service.py",
    r"app\services\dat_constitution_service.py",
    r"app\services\marl_squad_orchestrator_service.py",
    r"app\services\project_swarm_service.py",
    r"app\services\zk_did_royalty_service.py",
    r"app\services\executive_copilot_service.py",
    r"app\services\skill_treasury_vault_service.py",
]
for f in FILES:
    p = os.path.join(ROOT, f)
    print("==== " + f)
    for i, l in enumerate(open(p, encoding="utf-8", errors="ignore"), 1):
        if "_inr" in l and re.search(r"\d", l):
            print(f"{i}: {l.strip()[:150]}")
