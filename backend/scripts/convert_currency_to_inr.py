# -*- coding: utf-8 -*-
"""
Migrate all dollar (USD/USDC) based currency quotations to INR rupees.

Rules applied (at USD_INR_RATE = 83):
  1. Identifier / field / string renames:  usd -> inr, usdc -> inr,
     USD -> INR, USDC -> INR (case preserving).
  2. Numeric literals directly assigned to currency-named keys are
     multiplied by the rate (dict values, kwargs, dataclass/pydantic
     defaults, SQLAlchemy Column defaults, TS object properties).
  3. Display strings "$450k", "$155/h", "$84,250 USD" etc. are converted
     to rupee display strings with Indian formatting (Lakh / Crore).

Skipped: markdown docs (contain LaTeX math like $< 35 ms$), virtualenvs.
"""
import os
import re
import sys
from decimal import Decimal, ROUND_HALF_UP

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RATE = Decimal("83")
IGNORE_DIRS = {".git", "node_modules", ".next", ".venv", "__pycache__",
               ".pytest_cache", "dist", "build", "data"}
EXTS = (".py", ".ts", ".tsx", ".html")
SKIP_FILES = {"scan_currency.py", "convert_currency_to_inr.py"}

changes_log = []

# ----------------------------------------------------------------------------
# Display string conversion
# ----------------------------------------------------------------------------
def inr_group(v: Decimal) -> str:
    """Format number with Indian digit grouping (xx,xx,xxx)."""
    neg = v < 0
    v = abs(v)
    if v == v.to_integral_value():
        s = f"{int(v):,}"
        dec = ""
    else:
        q = v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        whole = q.to_integral_value(rounding=ROUND_DOWN)  # floor, never rounds up
        s = f"{int(whole):,}"
        frac = q - whole
        dec = f"{frac:.2f}"[1:]
        if dec == ".00":
            dec = ""
    if "," in s:
        head, tail = s.rsplit(",", 1)
    else:
        head, tail = "", s
    groups = []
    while len(head) > 2:
        groups.insert(0, head[-2:])
        head = head[:-2]
    if head:
        groups.insert(0, head)
    out = ",".join(groups + [tail]) + dec
    return ("-" + out) if neg else out


def inr_display(v: Decimal, per_hour: bool) -> str:
    """Rupee display string with Lakh/Crore units for large values."""
    if not per_hour:
        if v >= Decimal("10000000"):
            cr = (v / Decimal("10000000")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            s = f"{cr:f}".rstrip("0").rstrip(".")
            return f"₹{s} Cr"
        if v >= Decimal("100000"):
            lk = (v / Decimal("100000")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            s = f"{lk:f}".rstrip("0").rstrip(".")
            return f"₹{s} L"
    return f"₹{inr_group(v)}" + ("/h" if per_hour else "")


MULT = {"k": "1000", "K": "1000", "m": "1000000", "M": "1000000",
        "b": "1000000000", "B": "1000000000",
        "million": "1000000", "billion": "1000000000"}

# $450k  $155/h  $84,250 USD  $1.20/hour  $2.4M
# Guarded so LaTeX-ish "$0-100$" / "$100\\text" do NOT match.
# Whitespace runs are [ \\t]* (same line only) so newlines are never consumed.
AMOUNT_RE = re.compile(
    r"\$(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)[ \t]*"
    r"(k|K|m|M|b|B|million|billion)?"
    r"(/h\b|/hour\b|[ \t]*hour(?:s)?\b|[ \t]*hr\b|[ \t]*USD|[ \t]*INR)?"
    r"(?![\w\-$\\])"
)


def convert_amount_string(text: str) -> str:
    def repl(m):
        num_s, suf, tail = m.group(1), m.group(2), m.group(3) or ""
        base = Decimal(num_s.replace(",", ""))
        if suf:
            base *= Decimal(MULT[suf])
        inr = base * RATE
        per_hour = bool(re.search(r"/h\b|hour|hr", tail))
        return inr_display(inr, per_hour)
    return AMOUNT_RE.sub(repl, text)

# ----------------------------------------------------------------------------
# Identifier / token renames
# ----------------------------------------------------------------------------
def _case_replace(m):
    tok = m.group(0)
    if tok.isupper():
        return "INR"
    if tok[0].isupper():
        return "Inr"
    return "inr"


# `_usd`, "USD", usdc_in ... plus camelCase `liquidityUsd`
RENAME_RE = re.compile(
    r"(?<![A-Za-z0-9])(?:usdc|usd)(?![A-Za-z0-9])"   # snake_case / standalone
    r"|(?<=[a-z])(?:Usdc|Usd)(?![A-Za-z0-9])",       # camelCase
    re.IGNORECASE,
)


def rename_tokens(text: str) -> str:
    return RENAME_RE.sub(_case_replace, text)


# ----------------------------------------------------------------------------
# Numeric literal conversion (context bound)
# ----------------------------------------------------------------------------
NUM = r"-?\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?"


def mult_str(num_s: str) -> str:
    t = num_s.replace("_", "")
    d = Decimal(t) * RATE
    if d == d.to_integral_value():
        return str(int(d))
    out = f"{d:f}"
    out = out.rstrip("0").rstrip(".") if "." in out else out
    return out


CUR_TOKEN = r"(?:usd|USD|Usd|usdc|USDC|Usdc|inr|INR|Inr)"


def convert_numeric_contexts(text: str) -> str:
    def line_conv(line):
        if not re.search(r"usd|usdc|inr", line, re.IGNORECASE):
            return line
        out = line

        # "cur_key": NUM   (python dict / TS quoted prop)
        pat = re.compile(
            r'("[A-Za-z0-9_]*' + CUR_TOKEN + r'[A-Za-z0-9_]*"\s*:\s*)(' + NUM + r')(?![\w.])'
        )
        out = pat.sub(lambda m: m.group(1) + mult_str(m.group(2)), out)

        # cur_key=NUM (kwarg / assignment) or cur_key: NUM (TS prop).
        # Key may be matched as a suffix of a snake_case identifier; only the
        # number is rewritten so a partial key match is harmless.
        pat2 = re.compile(
            r"(?<![A-Za-z])(" + CUR_TOKEN + r"[A-Za-z0-9_]*)(\s*[:=]\s*)(" + NUM + r")(?![\w.=])"
        )
        out = pat2.sub(lambda m: m.group(1) + m.group(2) + mult_str(m.group(3)), out)

        # Field(NUM, ...) on a currency-named field line; matching example value too
        mfield = re.search(r"\bField\(\s*(" + NUM + r")\s*[,)]", out)
        if mfield:
            orig_num = mfield.group(1)
            out = out[:mfield.start(1)] + mult_str(orig_num) + out[mfield.end(1):]

            def ex_repl(em):
                return (em.group(1) + mult_str(em.group(2))
                        if em.group(2).replace("_", "") == orig_num.replace("_", "")
                        else em.group(0))
            out = re.sub(r'("example"\s*:\s*)(' + NUM + r')(?![\w.])', ex_repl, out)

        # Field(default=NUM) with a currency field on the line
        pat3 = re.compile(r"(\bField\(\s*default\s*=\s*)(" + NUM + r")(?![\w.])")
        out = pat3.sub(lambda m: m.group(1) + mult_str(m.group(2)), out)

        # Column(..., default=NUM) where line names a currency column
        if "Column(" in out:
            m4 = re.search(r"(?<=default=)(" + NUM + r")(?![\w.])", out)
            if m4:
                out = out[:m4.start(1)] + mult_str(m4.group(1)) + out[m4.end(1):]
        return out

    return "\n".join(line_conv(l) for l in text.split("\n"))


# ----------------------------------------------------------------------------
def migrate(path: str) -> None:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        orig = f.read()
    text = orig
    text = rename_tokens(text)
    text = convert_amount_string(text)
    text = convert_numeric_contexts(text)
    if text != orig:
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        changes_log.append(path)


def main() -> None:
    for dp, dn, fn in os.walk(ROOT):
        dn[:] = [d for d in dn if d not in IGNORE_DIRS]
        for f in fn:
            if f.endswith(EXTS) and f not in SKIP_FILES:
                migrate(os.path.join(dp, f))
    print(f"Files modified: {len(changes_log)}")
    for p in changes_log:
        print("  ", os.path.relpath(p, ROOT))


if __name__ == "__main__":
    main()
