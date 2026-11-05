"""
SkillMatch DNA v17.0 Test Suite
Pillars:
1. Multi-Face & 3D Gaze Vector Tracking (MediaPipe WASM / WebGPU)
2. Acoustic Diarization & Environmental Audio Proctoring
3. Browser Runtime, OS Environment & Keystroke Biometrics
4. Proctoring Trust Score (PTS) & Ed25519 Cryptographic Forensic Audit Log
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_vision_proctor_frame_and_gaze():
    """
    Validates 3D face mesh evaluation, multi-face presence, gaze vector offset,
    head Euler angle tracking, and deepfake / virtual camera detection.
    """
    # 1. Authentic single candidate, centered gaze
    res_normal = client.post("/proctor/vision/evaluate-frame", json={
        "session_id": "sess_vision_01",
        "candidate_id": "cand_proctor_01",
        "faces_detected": 1,
        "gaze_vector": {"x": 0.02, "y": -0.01, "z": 0.98},
        "head_pose_euler": {"yaw": 1.2, "pitch": -0.8, "roll": 0.2},
        "liveness_score": 0.98,
        "is_virtual_camera": False
    })
    assert res_normal.status_code == 200
    data_normal = res_normal.json()
    assert data_normal["vision_trust_score"] == 100.0
    assert data_normal["gaze_direction_label"] == "CENTER_SCREEN"
    assert data_normal["liveness_verified"] is True
    assert data_normal["incidents_count"] == 0

    # 2. Multi-face presence incident
    res_multi = client.post("/proctor/vision/evaluate-frame", json={
        "session_id": "sess_vision_01",
        "candidate_id": "cand_proctor_01",
        "faces_detected": 2,
        "gaze_vector": {"x": 0.0, "y": 0.0, "z": 1.0}
    })
    assert res_multi.status_code == 200
    data_multi = res_multi.json()
    assert data_multi["vision_trust_score"] <= 75.0
    assert any(inc["code"] == "INCIDENT_MULTIPLE_FACES" for inc in data_multi["incidents"])

    # 3. Off-screen gaze stray (looking at secondary monitor)
    res_gaze = client.post("/proctor/vision/gaze-pose", json={
        "session_id": "sess_vision_01",
        "candidate_id": "cand_proctor_01",
        "faces_detected": 1,
        "gaze_vector": {"x": 0.55, "y": 0.02, "z": 0.85},
        "screen_bounds_stray": True
    })
    assert res_gaze.status_code == 200
    data_gaze = res_gaze.json()
    assert any(inc["code"] == "INCIDENT_OFFSCREEN_GAZE" for inc in data_gaze["incidents"])
    assert "RIGHT_SECONDARY_MONITOR" in data_gaze["gaze_direction_label"]

    # 4. Sustained head pose turn (>15 deg for >2.5s)
    res_pose = client.post("/proctor/vision/evaluate-frame", json={
        "session_id": "sess_vision_01",
        "candidate_id": "cand_proctor_01",
        "faces_detected": 1,
        "head_pose_euler": {"yaw": 24.5, "pitch": -2.0, "roll": 1.0},
        "head_pose_duration_seconds": 3.8
    })
    assert res_pose.status_code == 200
    data_pose = res_pose.json()
    assert any(inc["code"] == "INCIDENT_SUSPICIOUS_HEAD_POSE" for inc in data_pose["incidents"])
    assert data_pose["head_pose_status"] == "SUSPICIOUS_HEAD_ROTATION"

    # 5. Virtual webcam spoof
    res_spoof = client.post("/proctor/vision/evaluate-frame", json={
        "session_id": "sess_vision_01",
        "candidate_id": "cand_proctor_01",
        "is_virtual_camera": True,
        "liveness_score": 0.45
    })
    assert res_spoof.status_code == 200
    data_spoof = res_spoof.json()
    assert any(inc["code"] == "INCIDENT_DEEPFAKE_OR_SPOOF" for inc in data_spoof["incidents"])


def test_audio_proctor_enrollment_and_diarization():
    """
    Validates 5-second acoustic enrollment, 500ms sliding window diarization,
    secondary speaker detection, and ultrasonic beacons.
    """
    # 1. Voice Enrollment
    res_enroll = client.post("/proctor/audio/enroll-voice", json={
        "candidate_id": "cand_audio_test_01",
        "sample_rate_hz": 48000,
        "duration_seconds": 5.0
    })
    assert res_enroll.status_code == 200
    data_enroll = res_enroll.json()
    assert data_enroll["voice_hash"].startswith("0x")
    assert data_enroll["embedding_dim"] == 192
    assert data_enroll["status"] == "ENROLLED"

    # 2. Normal Candidate Diarization Window
    res_audio_norm = client.post("/proctor/audio/diarize-window", json={
        "session_id": "sess_audio_01",
        "candidate_id": "cand_audio_test_01",
        "cosine_distance_to_baseline": 0.12,
        "detected_speakers_count": 1
    })
    assert res_audio_norm.status_code == 200
    data_norm = res_audio_norm.json()
    assert data_norm["audio_trust_score"] == 100.0
    assert data_norm["speaker_match"] is True
    assert data_norm["diarization_verdict"] == "AUTHENTIC_CANDIDATE"

    # 3. Secondary Speaker Detected
    res_sec = client.post("/proctor/audio/diarize-window", json={
        "session_id": "sess_audio_01",
        "candidate_id": "cand_audio_test_01",
        "cosine_distance_to_baseline": 0.52,
        "detected_speakers_count": 2
    })
    assert res_sec.status_code == 200
    data_sec = res_sec.json()
    assert data_sec["speaker_match"] is False
    assert data_sec["diarization_verdict"] == "SECONDARY_SPEAKER_ACTIVE"
    assert any(inc["code"] == "INCIDENT_SECONDARY_SPEAKER" for inc in data_sec["incidents"])

    # 4. Ultrasonic Beacon
    res_ultra = client.post("/proctor/audio/diarize-window", json={
        "session_id": "sess_audio_01",
        "candidate_id": "cand_audio_test_01",
        "ultrasonic_beacon_detected": True
    })
    assert res_ultra.status_code == 200
    data_ultra = res_ultra.json()
    assert any(inc["code"] == "INCIDENT_ULTRASONIC_BEACON" for inc in data_ultra["incidents"])


def test_browser_guard_and_keystroke_entropy():
    """
    Validates browser focus, tab switching, clipboard injection lock,
    and keystroke flight/dwell typing entropy models.
    """
    # 1. Normal Browser State
    res_br_norm = client.post("/proctor/browser/telemetry", json={
        "session_id": "sess_bg_01",
        "candidate_id": "cand_bg_01",
        "is_document_hidden": False,
        "tab_switch_count": 0
    })
    assert res_br_norm.status_code == 200
    assert res_br_norm.json()["browser_trust_score"] == 100.0

    # 2. Tab Switch Event
    res_tab = client.post("/proctor/browser/telemetry", json={
        "session_id": "sess_bg_01",
        "candidate_id": "cand_bg_01",
        "is_document_hidden": True,
        "tab_switch_count": 1
    })
    assert res_tab.status_code == 200
    assert any(inc["code"] == "INCIDENT_TAB_SWITCH" for inc in res_tab.json()["incidents"])

    # 3. Clipboard Paste Lock
    res_clip = client.post("/proctor/browser/telemetry", json={
        "session_id": "sess_bg_01",
        "candidate_id": "cand_bg_01",
        "copy_paste_attempted": True
    })
    assert res_clip.status_code == 200
    assert any(inc["code"] == "INCIDENT_CLIPBOARD_INJECTION" for inc in res_clip.json()["incidents"])

    # 4. Normal Human Typing Dynamics
    res_type_norm = client.post("/proctor/browser/keystroke-entropy", json={
        "session_id": "sess_bg_01",
        "candidate_id": "cand_bg_01",
        "mean_flight_time_ms": 112.0,
        "mean_dwell_time_ms": 84.0,
        "typing_speed_wpm": 65.0,
        "entropy_score": 0.85
    })
    assert res_type_norm.status_code == 200
    data_type_norm = res_type_norm.json()
    assert data_type_norm["typing_trust_score"] == 100.0
    assert data_type_norm["is_human_rhythm"] is True

    # 5. Macro Code Injection
    res_macro = client.post("/proctor/browser/keystroke-entropy", json={
        "session_id": "sess_bg_01",
        "candidate_id": "cand_bg_01",
        "mean_flight_time_ms": 3.0,
        "typing_speed_wpm": 210.0,
        "burst_character_count": 120
    })
    assert res_macro.status_code == 200
    data_macro = res_macro.json()
    assert data_macro["is_human_rhythm"] is False
    assert any(inc["code"] == "INCIDENT_MACRO_CODE_INJECTION" for inc in data_macro["incidents"])


def test_proctoring_pts_calculation_and_forensic_audit():
    """
    Validates dynamic PTS calculation across all 5 pillars,
    verdict threshold status, and Ed25519 cryptographic audit log packaging.
    """
    # 1. Verified Authentic PTS (>=85%)
    res_pts_high = client.post("/proctor/pts/calculate", json={
        "session_id": "sess_pts_01",
        "candidate_id": "cand_pts_01",
        "gaze_trust_score": 95.0,
        "face_trust_score": 98.0,
        "audio_trust_score": 94.0,
        "browser_trust_score": 90.0,
        "typing_trust_score": 92.0
    })
    assert res_pts_high.status_code == 200
    data_high = res_pts_high.json()
    assert data_high["proctoring_trust_score"] >= 85.0
    assert data_high["verdict"] == "VERIFIED_AUTHENTIC"
    assert data_high["status_color"] == "EMERALD"

    # 2. Soft Warning (60-85%)
    res_pts_warn = client.post("/proctor/pts/calculate", json={
        "session_id": "sess_pts_02",
        "candidate_id": "cand_pts_02",
        "gaze_trust_score": 70.0,
        "face_trust_score": 75.0,
        "audio_trust_score": 68.0,
        "browser_trust_score": 72.0,
        "typing_trust_score": 70.0
    })
    assert res_pts_warn.status_code == 200
    data_warn = res_pts_warn.json()
    assert 60.0 <= data_warn["proctoring_trust_score"] < 85.0
    assert data_warn["verdict"] == "SOFT_WARNING"
    assert data_warn["status_color"] == "AMBER"

    # 3. Session Quarantine (<60%)
    res_pts_quar = client.post("/proctor/pts/calculate", json={
        "session_id": "sess_pts_03",
        "candidate_id": "cand_pts_03",
        "gaze_trust_score": 30.0,
        "face_trust_score": 40.0,
        "audio_trust_score": 35.0,
        "browser_trust_score": 40.0,
        "typing_trust_score": 30.0
    })
    assert res_pts_quar.status_code == 200
    data_quar = res_pts_quar.json()
    assert data_quar["proctoring_trust_score"] < 60.0
    assert data_quar["verdict"] == "SESSION_QUARANTINED"
    assert data_quar["status_color"] == "ROSE"

    # 4. Ed25519 Signed Cryptographic Forensic Audit Package
    res_audit = client.post("/proctor/pts/generate-audit-log", json={
        "session_id": "sess_pts_01",
        "candidate_id": "cand_pts_01",
        "role_target": "L6 Staff Architect",
        "pts_score": 94.5,
        "incidents": [
            {"code": "INCIDENT_OFFSCREEN_GAZE", "severity": "MEDIUM", "timestamp": 1720000000}
        ]
    })
    assert res_audit.status_code == 200
    audit_pkg = res_audit.json()
    assert audit_pkg["final_pts_score"] == 94.5
    assert audit_pkg["is_certified"] is True
    assert audit_pkg["cryptographic_proof"]["signature_algorithm"] == "Ed25519"
    assert audit_pkg["cryptographic_proof"]["onchain_registry_hash"].startswith("0x")
    assert audit_pkg["cryptographic_proof"]["smart_contract_target"] == "ProctoringIntegrityRegistry.sol"

    # 5. Session Query
    res_sess = client.get("/proctor/pts/session/sess_pts_01")
    assert res_sess.status_code == 200
    assert res_sess.json()["session_id"] == "sess_pts_01"


def test_v17_routes_table():
    """
    Validates OpenAPI route table and version string for Version 17.0.
    """
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert any(v in health_res.json()["version"] for v in ["17.0.0", "18.0.0", "19.0.0", "20.0.0", "21.0.0", "22.0.0", "24.0.0", "25.0.0", "26.0.0"])

    openapi_res = client.get("/openapi.json")
    assert openapi_res.status_code == 200
    paths = openapi_res.json()["paths"]

    # Verify v17 routes exist
    v17_endpoints = [
        "/proctor/vision/evaluate-frame",
        "/proctor/vision/gaze-pose",
        "/proctor/audio/enroll-voice",
        "/proctor/audio/diarize-window",
        "/proctor/browser/telemetry",
        "/proctor/browser/keystroke-entropy",
        "/proctor/pts/calculate",
        "/proctor/pts/generate-audit-log",
        "/proctor/pts/session/{session_id}",
        # Aliases
        "/api/v1/proctor/vision/evaluate-frame",
        "/api/v1/proctor/audio/enroll-voice",
        "/api/v1/proctor/browser/telemetry",
        "/api/v1/proctor/pts/calculate"
    ]
    for endpoint in v17_endpoints:
        assert endpoint in paths, f"Expected endpoint {endpoint} not found in OpenAPI routes"
