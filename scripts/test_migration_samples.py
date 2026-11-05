# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r"c:\Users\ASUS\Downloads\Skill_Match v1\scripts")
import convert_currency_to_inr as m

sys.stdout.reconfigure(encoding="utf-8")

samples = [
    'initial_treasury_inr: float = Field(207500000, json_schema_extra={"example": 207500000})',
    'rate_per_block_inr: float = Field(6.64, json_schema_extra={"example": 6.64})',
    'disputed_amount_inr: float = Field(2075000, gt=0.0)',
    'spot_price_inr_hr=12865,',
    '"treasury_balance_inr": 402550000,',
    'saved ₹3.74 Cr annually in cloud infrastructure.',
    "spot: '₹12,865/h'",
    '₹69.93 L',
    'Matrix ($0-100$)',
    '# e.g., ₹1.25 Cr, ₹19.92 Cr',
    'total_bounty_budget_inr = Column(Float, nullable=False, default=20750000)',
    'avg_salary_inr: int = Field(default=13280000)',
    'internal upskilling saves ₹92.96 L vs. external',
    '# Underwrite up to ₹41.5 L based on metrics',
    'equity_range_inr["p50"] / 10,  # shares at ₹830 strike',
    'staked_amount_inr: float = Field(207500, json_schema_extra={"example": 207500})',
    "rate: '₹13,695/h max'",
    '"₹3.74 Cr"',
    'Treasury Liquidity ($)',
    'payout_amount": 25.0',
    '        max_rate_inr_hr=13695,',
    'inr_in=20750,',
    '"market_clearing_price_spread_inr": 178.45,',
    'projected_monthly_inr = round(rate_per_block_inr * 216000, 2)',
    'offered_salary = round(min_salary_inr * market_premium, -2)',
    'dispute_amount_inr * 0.75',
    '"example": "pool_photonic_buffer_inr"',
]

for s in samples:
    t = m.rename_tokens(s)
    t = m.convert_amount_string(t)
    t = m.convert_numeric_contexts(t)
    print(s)
    print("  ->", t)
    print()
