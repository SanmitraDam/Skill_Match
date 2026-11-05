# -*- coding: utf-8 -*-
"""Rename legacy *_usd columns to *_inr and convert stored values x83 (USD->INR)."""
import os
import sqlite3
import sys

sys.stdout.reconfigure(encoding="utf-8")
DB = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "skillmatch.db")
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cur.fetchall()]
done = []
for t in tables:
    cur.execute(f'PRAGMA table_info("{t}")')
    cols = [r[1] for r in cur.fetchall()]
    for c in cols:
        if "usd" in c.lower():
            newc = c.replace("_usdc", "_inr").replace("_usd", "_inr")
            cur.execute(f'ALTER TABLE "{t}" RENAME COLUMN "{c}" TO "{newc}"')
            cur.execute(f'UPDATE "{t}" SET "{newc}" = ROUND("{newc}" * 83, 2) WHERE "{newc}" IS NOT NULL')
            done.append((t, c, newc))
conn.commit()
print("Renamed+converted:", done)
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
legacy = False
for t in [r[0] for r in cur.fetchall()]:
    cur.execute(f'PRAGMA table_info("{t}")')
    hits = [r[1] for r in cur.fetchall() if "usd" in r[1].lower()]
    if hits:
        legacy = True
        print("STILL LEGACY:", t, hits)
print("NO LEGACY COLUMNS REMAIN" if not legacy else "LEGACY COLUMNS REMAIN")
conn.close()
