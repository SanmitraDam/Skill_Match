r"""
SkillMatch DNA v17.0 — Browser Guard & Keystroke Biometrics Service
Pillar 3: Browser Runtime, OS Environment & Peripheral Device Detection
Features:
- Visibility API & window blur telemetry monitoring (INCIDENT_TAB_SWITCH)
- Clipboard & programmatic text injection guard (INCIDENT_CLIPBOARD_INJECTION)
- Developer Tools & DOM mutation tamper protection (INCIDENT_DOM_TAMPER_DEVTOOLS)
- Keystroke dynamics (Dwell time, Flight time) & Typing entropy model (INCIDENT_MACRO_CODE_INJECTION)
- WebHID & WebUSB peripheral proxy scanner (INCIDENT_UNAUTHORIZED_PERIPHERAL)
"""

import time
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class BrowserTelemetryRequest(BaseModel):
    session_id: str = "sess_proctor_v17_001"
    candidate_id: str = "cand_proctor_01"
    event_type: str = Field(default="visibilitychange", description="focus | blur | visibilitychange | copy | paste | dom_mutation")
    is_document_hidden: bool = False
    tab_switch_count: int = 0
    copy_paste_attempted: bool = False
    devtools_open: bool = False
    unauthorized_peripherals: List[str] = []


class KeystrokeEntropyRequest(BaseModel):
    session_id: str = "sess_proctor_v17_001"
    candidate_id: str = "cand_proctor_01"
    mean_flight_time_ms: float = Field(default=105.0, ge=0.0)
    mean_dwell_time_ms: float = Field(default=82.0, ge=0.0)
    typing_speed_wpm: float = Field(default=68.0, ge=0.0)
    entropy_score: float = Field(default=0.84, ge=0.0, le=1.0)
    burst_character_count: int = Field(default=12, ge=0)


class BrowserGuardService:
    def __init__(self):
        pass

    def evaluate_browser_telemetry(self, req: BrowserTelemetryRequest) -> Dict[str, Any]:
        incidents: List[Dict[str, Any]] = []
        deductions = 0.0

        # 1. Tab Switch / Window Blur Detection
        if req.is_document_hidden or req.tab_switch_count > 0 or req.event_type == "blur":
            count = max(1, req.tab_switch_count)
            penalty = min(50.0, 25.0 * count)
            incidents.append({
                "code": "INCIDENT_TAB_SWITCH",
                "severity": "HIGH",
                "penalty": penalty,
                "detail": f"Browser focus lost or tab switched ({count} instances). Potential secondary monitor / search lookup.",
                "timestamp": time.time()
            })
            deductions += penalty

        # 2. Clipboard Copy-Paste Injection
        if req.copy_paste_attempted or req.event_type in ["copy", "paste"]:
            incidents.append({
                "code": "INCIDENT_CLIPBOARD_INJECTION",
                "severity": "MEDIUM",
                "penalty": 20.0,
                "detail": "Unauthorized clipboard paste event intercepted in coding / interview canvas.",
                "timestamp": time.time()
            })
            deductions += 20.0

        # 3. Developer Tools & DOM Tampering
        if req.devtools_open or req.event_type == "dom_mutation":
            incidents.append({
                "code": "INCIDENT_DOM_TAMPER_DEVTOOLS",
                "severity": "CRITICAL",
                "penalty": 35.0,
                "detail": "Browser Developer Tools open or DOM tree mutation detected on evaluation tests.",
                "timestamp": time.time()
            })
            deductions += 35.0

        # 4. Unauthorized WebHID/WebUSB Hardware
        if len(req.unauthorized_peripherals) > 0:
            peripherals_str = ", ".join(req.unauthorized_peripherals)
            incidents.append({
                "code": "INCIDENT_UNAUTHORIZED_PERIPHERAL",
                "severity": "HIGH",
                "penalty": 30.0,
                "detail": f"Unauthorized peripheral proxy devices intercepted: {peripherals_str}.",
                "timestamp": time.time()
            })
            deductions += 30.0

        browser_trust_score = max(0.0, min(100.0, 100.0 - deductions))

        return {
            "session_id": req.session_id,
            "candidate_id": req.candidate_id,
            "browser_trust_score": round(browser_trust_score, 1),
            "tab_switch_count": req.tab_switch_count,
            "devtools_active": req.devtools_open,
            "incidents_count": len(incidents),
            "incidents": incidents,
            "evaluated_at": time.time()
        }

    def evaluate_keystroke_entropy(self, req: KeystrokeEntropyRequest) -> Dict[str, Any]:
        incidents: List[Dict[str, Any]] = []
        deductions = 0.0

        # 1. Macro & Auto-Typer Injection: flight time near 0 and speed > 180 wpm
        is_macro_injected = (req.mean_flight_time_ms < 12.0 and req.typing_speed_wpm > 175.0) or (req.burst_character_count > 80 and req.mean_flight_time_ms < 5.0)
        if is_macro_injected:
            incidents.append({
                "code": "INCIDENT_MACRO_CODE_INJECTION",
                "severity": "CRITICAL",
                "penalty": 40.0,
                "detail": f"Automated script or virtual keyboard injection: {req.typing_speed_wpm:.1f} WPM with flight time {req.mean_flight_time_ms:.1f}ms.",
                "timestamp": time.time()
            })
            deductions += 40.0

        # 2. Unnatural Typing Entropy (robotic pacing)
        if req.entropy_score < 0.28:
            incidents.append({
                "code": "INCIDENT_UNNATURAL_TYPING_ENTROPY",
                "severity": "MEDIUM",
                "penalty": 20.0,
                "detail": f"Unnaturally uniform typing rhythm: entropy {req.entropy_score:.2f} (human baseline 0.60-0.95).",
                "timestamp": time.time()
            })
            deductions += 20.0

        typing_trust_score = max(0.0, min(100.0, 100.0 - deductions))

        return {
            "session_id": req.session_id,
            "candidate_id": req.candidate_id,
            "typing_trust_score": round(typing_trust_score, 1),
            "is_human_rhythm": not is_macro_injected and req.entropy_score >= 0.28,
            "flight_time_ms": req.mean_flight_time_ms,
            "dwell_time_ms": req.mean_dwell_time_ms,
            "wpm": req.typing_speed_wpm,
            "entropy_score": req.entropy_score,
            "incidents_count": len(incidents),
            "incidents": incidents,
            "evaluated_at": time.time()
        }


browser_guard_service = BrowserGuardService()
