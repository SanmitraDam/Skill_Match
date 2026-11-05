r"""
SkillMatch DNA v17.0 — Computer Vision & Gaze Tracking Proctoring Service
Pillar 1: Multi-Face, 3D Gaze Vector & Deepfake Liveness Detection (MediaPipe WASM / WebGPU)
Features:
- Multi-face presence evaluation (flags >1 face: INCIDENT_MULTIPLE_FACES)
- Candidate absence detector (flags 0 faces: INCIDENT_FACE_ABSENT)
- 3D Gaze vector calculation & screen boundary heatmap stray (INCIDENT_OFFSCREEN_GAZE)
- Head pose Euler angle estimation (Yaw, Pitch, Roll; >15 deg for >2.5s: INCIDENT_SUSPICIOUS_HEAD_POSE)
- Deepfake, static video loop, and virtual webcam (OBS) detection (INCIDENT_DEEPFAKE_OR_SPOOF)
"""

import time
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class GazeVector(BaseModel):
    x: float = Field(default=0.02, description="Normalized horizontal pupil/iris offset [-1.0, 1.0]")
    y: float = Field(default=-0.01, description="Normalized vertical pupil/iris offset [-1.0, 1.0]")
    z: float = Field(default=0.98, description="Depth component")


class HeadPoseEuler(BaseModel):
    yaw: float = Field(default=1.5, description="Horizontal rotation in degrees")
    pitch: float = Field(default=-1.0, description="Vertical tilt in degrees")
    roll: float = Field(default=0.4, description="Side tilt in degrees")


class VisionFrameEvaluateRequest(BaseModel):
    session_id: str = "sess_proctor_v17_001"
    candidate_id: str = "cand_proctor_01"
    faces_detected: int = Field(default=1, ge=0)
    gaze_vector: GazeVector = Field(default_factory=GazeVector)
    screen_bounds_stray: bool = False
    head_pose_euler: HeadPoseEuler = Field(default_factory=HeadPoseEuler)
    head_pose_duration_seconds: float = 0.4
    liveness_score: float = Field(default=0.96, ge=0.0, le=1.0)
    is_virtual_camera: bool = False
    fps: float = 30.0


class VisionProctorService:
    def __init__(self):
        pass

    def evaluate_frame(self, req: VisionFrameEvaluateRequest) -> Dict[str, Any]:
        incidents: List[Dict[str, Any]] = []
        deductions = 0.0

        # 1. Multi-Face & Face Absence Check
        if req.faces_detected > 1:
            incidents.append({
                "code": "INCIDENT_MULTIPLE_FACES",
                "severity": "HIGH",
                "penalty": 30.0,
                "detail": f"Detected {req.faces_detected} faces in webcam field of view. Secondary person present.",
                "timestamp": time.time()
            })
            deductions += 30.0
        elif req.faces_detected == 0:
            incidents.append({
                "code": "INCIDENT_FACE_ABSENT",
                "severity": "HIGH",
                "penalty": 35.0,
                "detail": "Candidate face not detected in webcam frame or camera is obstructed.",
                "timestamp": time.time()
            })
            deductions += 35.0

        # 2. 3D Gaze Vector & Screen Stray Check
        gaze_x = req.gaze_vector.x
        gaze_y = req.gaze_vector.y
        gaze_stray = req.screen_bounds_stray or abs(gaze_x) > 0.32 or abs(gaze_y) > 0.32

        if gaze_stray:
            direction = "OFF_SCREEN"
            if gaze_y < -0.32:
                direction = "DOWN_SMARTPHONE_GLANCE"
            elif gaze_x > 0.32:
                direction = "RIGHT_SECONDARY_MONITOR"
            elif gaze_x < -0.32:
                direction = "LEFT_OFFSCREEN_NOTES"
            elif gaze_y > 0.32:
                direction = "UP_LOOKUP"

            incidents.append({
                "code": "INCIDENT_OFFSCREEN_GAZE",
                "severity": "MEDIUM",
                "penalty": 15.0,
                "detail": f"Sustained gaze stray detected outside interview canvas: {direction} (X={gaze_x:.2f}, Y={gaze_y:.2f}).",
                "timestamp": time.time(),
                "gaze_direction": direction
            })
            deductions += 15.0
        else:
            direction = "CENTER_SCREEN"

        # 3. Head Pose Euler Angle Check (>15 deg for >2.5s)
        yaw_stray = abs(req.head_pose_euler.yaw) > 15.0
        pitch_stray = abs(req.head_pose_euler.pitch) > 15.0
        pose_stray = (yaw_stray or pitch_stray) and req.head_pose_duration_seconds > 2.5

        if pose_stray:
            incidents.append({
                "code": "INCIDENT_SUSPICIOUS_HEAD_POSE",
                "severity": "MEDIUM",
                "penalty": 20.0,
                "detail": f"Sustained head rotation exceeding 15 degrees for {req.head_pose_duration_seconds:.1f}s (Yaw={req.head_pose_euler.yaw:.1f}°, Pitch={req.head_pose_euler.pitch:.1f}°).",
                "timestamp": time.time()
            })
            deductions += 20.0

        # 4. Deepfake Liveness & Virtual Camera Check
        if req.liveness_score < 0.65 or req.is_virtual_camera:
            reason = "Virtual camera device (OBS/Loopback) detected" if req.is_virtual_camera else "Micro-blink & 3D mesh depth liveness failed"
            incidents.append({
                "code": "INCIDENT_DEEPFAKE_OR_SPOOF",
                "severity": "CRITICAL",
                "penalty": 45.0,
                "detail": f"Biometric liveness violation: {reason} (Liveness={req.liveness_score:.2f}).",
                "timestamp": time.time()
            })
            deductions += 45.0

        vision_trust_score = max(0.0, min(100.0, 100.0 - deductions))

        return {
            "session_id": req.session_id,
            "candidate_id": req.candidate_id,
            "faces_detected": req.faces_detected,
            "vision_trust_score": round(vision_trust_score, 1),
            "gaze_direction_label": direction,
            "head_pose_status": "NORMAL" if not pose_stray else "SUSPICIOUS_HEAD_ROTATION",
            "liveness_verified": req.liveness_score >= 0.65 and not req.is_virtual_camera,
            "incidents_count": len(incidents),
            "incidents": incidents,
            "evaluated_at": time.time()
        }


vision_proctor_service = VisionProctorService()
