"""
SkillMatch DNA v18.0 — Device Attestation & Root-of-Trust API Router
Pillar 2: Hardware-Backed Device Attestation & TPM 2.0 / Apple Secure Enclave Root-of-Trust
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.device_attestation_service import (
    device_attestation_service,
    AttestationChallengeRequest,
    DeviceAttestationVerifyRequest,
    HypervisorCheckRequest,
    AuditClockTimingRequest
)

router = APIRouter(tags=["Device Attestation"])


@router.post("/security/attest/challenge")
@router.post("/proctor/device/challenge")
async def create_attestation_challenge(req: AttestationChallengeRequest) -> Dict[str, Any]:
    """
    Creates high-entropy challenge for WebAuthn platform authenticator verification.
    """
    try:
        return device_attestation_service.create_challenge(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/attest/verify")
@router.post("/security/attest/verify-attestation")
@router.post("/proctor/device/verify")
@router.post("/proctor/device/verify-attestation")
async def verify_device_attestation(req: DeviceAttestationVerifyRequest) -> Dict[str, Any]:
    """
    Verifies TPM 2.0 / Apple Secure Enclave hardware root-of-trust.
    """
    try:
        return device_attestation_service.verify_device_attestation(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/attest/hypervisor-check")
@router.post("/proctor/device/hypervisor-check")
async def check_hypervisor(req: HypervisorCheckRequest) -> Dict[str, Any]:
    """
    Checks WebGL/WebGPU drivers to detect virtualized VM instances (SwiftShader, VMware, QEMU).
    """
    try:
        return device_attestation_service.check_hypervisor(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/security/attest/timer-jitter-audit")
@router.post("/security/attest/audit-clock-timing")
@router.post("/proctor/device/timer-jitter-audit")
@router.post("/proctor/device/audit-clock-timing")
async def audit_clock_timing(req: AuditClockTimingRequest) -> Dict[str, Any]:
    """
    Audits precision timer micro-jitter to detect VM time-dilation and debugger pauses.
    """
    try:
        return device_attestation_service.audit_clock_timing(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
