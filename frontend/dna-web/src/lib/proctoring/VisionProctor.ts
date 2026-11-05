/**
 * SkillMatch DNA v17.0 — Vision Proctoring Engine (WebAssembly & WebGPU Simulation)
 * Pillar 1: Multi-Face, 3D Gaze Vector Tracking & Deepfake Liveness Detection
 */

export interface GazeVector3D {
  x: number; // horizontal offset [-1.0, 1.0]
  y: number; // vertical offset [-1.0, 1.0]
  z: number; // depth
}

export interface HeadPoseEuler3D {
  yaw: number;   // horizontal rotation in degrees
  pitch: number; // vertical tilt in degrees
  roll: number;  // side tilt in degrees
}

export interface VisionProctorResult {
  facesDetected: number;
  gazeVector: GazeVector3D;
  gazeDirection: 'CENTER_SCREEN' | 'DOWN_SMARTPHONE' | 'RIGHT_MONITOR' | 'LEFT_NOTES' | 'UP_LOOKUP';
  headPose: HeadPoseEuler3D;
  headPoseStatus: 'NORMAL' | 'SUSPICIOUS_ROTATION';
  livenessScore: number;
  isVirtualCamera: boolean;
  visionTrustScore: number;
  incidents: Array<{
    code: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detail: string;
    timestamp: number;
  }>;
}

export function evaluateVisionMetrics(
  facesDetected: number = 1,
  gazeX: number = 0.0,
  gazeY: number = 0.0,
  yawDeg: number = 0.0,
  pitchDeg: number = 0.0,
  liveness: number = 0.98,
  isVirtualCam: boolean = false
): VisionProctorResult {
  const incidents: VisionProctorResult['incidents'] = [];
  let deductions = 0;

  // 1. Multi-Face & Face Absence Check
  if (facesDetected > 1) {
    incidents.push({
      code: 'INCIDENT_MULTIPLE_FACES',
      severity: 'HIGH',
      detail: `Secondary person detected in webcam field of view (${facesDetected} faces).`,
      timestamp: Date.now(),
    });
    deductions += 30;
  } else if (facesDetected === 0) {
    incidents.push({
      code: 'INCIDENT_FACE_ABSENT',
      severity: 'HIGH',
      detail: 'Candidate face absent or camera obstructed.',
      timestamp: Date.now(),
    });
    deductions += 35;
  }

  // 2. 3D Gaze Direction Classification
  let gazeDirection: VisionProctorResult['gazeDirection'] = 'CENTER_SCREEN';
  if (gazeY < -0.32) {
    gazeDirection = 'DOWN_SMARTPHONE';
    incidents.push({
      code: 'INCIDENT_OFFSCREEN_GAZE',
      severity: 'MEDIUM',
      detail: 'Off-screen gaze downward: potential smartphone lookup.',
      timestamp: Date.now(),
    });
    deductions += 15;
  } else if (gazeX > 0.32) {
    gazeDirection = 'RIGHT_MONITOR';
    incidents.push({
      code: 'INCIDENT_OFFSCREEN_GAZE',
      severity: 'MEDIUM',
      detail: 'Off-screen gaze right: potential secondary monitor lookup.',
      timestamp: Date.now(),
    });
    deductions += 15;
  } else if (gazeX < -0.32) {
    gazeDirection = 'LEFT_NOTES';
    incidents.push({
      code: 'INCIDENT_OFFSCREEN_GAZE',
      severity: 'MEDIUM',
      detail: 'Off-screen gaze left: potential physical reference lookup.',
      timestamp: Date.now(),
    });
    deductions += 15;
  } else if (gazeY > 0.32) {
    gazeDirection = 'UP_LOOKUP';
  }

  // 3. Head Pose Euler Angle Check (>15 degrees)
  const isSuspiciousRotation = Math.abs(yawDeg) > 15.0 || Math.abs(pitchDeg) > 15.0;
  if (isSuspiciousRotation) {
    incidents.push({
      code: 'INCIDENT_SUSPICIOUS_HEAD_POSE',
      severity: 'MEDIUM',
      detail: `Sustained head rotation exceeding 15° (Yaw: ${yawDeg.toFixed(1)}°, Pitch: ${pitchDeg.toFixed(1)}°).`,
      timestamp: Date.now(),
    });
    deductions += 20;
  }

  // 4. Liveness & Virtual Camera Check
  if (liveness < 0.65 || isVirtualCam) {
    incidents.push({
      code: 'INCIDENT_DEEPFAKE_OR_SPOOF',
      severity: 'CRITICAL',
      detail: isVirtualCam ? 'OBS / virtual webcam software detected.' : '3D mesh depth liveness check failed.',
      timestamp: Date.now(),
    });
    deductions += 45;
  }

  const visionTrustScore = Math.max(0, Math.min(100, 100 - deductions));

  return {
    facesDetected,
    gazeVector: { x: gazeX, y: gazeY, z: 0.98 },
    gazeDirection,
    headPose: { yaw: yawDeg, pitch: pitchDeg, roll: 0.0 },
    headPoseStatus: isSuspiciousRotation ? 'SUSPICIOUS_ROTATION' : 'NORMAL',
    livenessScore: liveness,
    isVirtualCamera: isVirtualCam,
    visionTrustScore,
    incidents,
  };
}
