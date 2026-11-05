"""
SkillMatch DNA v6.0 - Post-Quantum Cryptography & FHE API Router
Endpoints:
- POST /pqc/generate-keys : Generate NIST ML-DSA-65 & ML-KEM-768 lattice keypair
- POST /pqc/sign-credential : Mint quantum-safe verifiable credential
- POST /pqc/verify-signature : Verify NIST ML-DSA-65 lattice signature
- POST /pqc/fhe-encrypt-vector : Encrypt vector into CKKS homomorphic ciphertext polynomials
- POST /pqc/fhe-match : Compute homomorphic cosine distance directly over ciphertexts (Zero plaintext exposure)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from app.models.database import get_db
from app.services.pqc_fhe_service import PQCFHEService

router = APIRouter(prefix="/pqc", tags=["Post-Quantum Cryptography & Fully Homomorphic Encryption"])

class GenerateKeysRequest(BaseModel):
    seed: Optional[str] = None

class SignPQCCredentialRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_pqc_9912"})
    role_title: str = Field(..., json_schema_extra={"example": "Staff Distributed Systems Architect"})
    ccrs_score: float = Field(..., json_schema_extra={"example": 89.5})
    tenant_id: str = "tenant_default"

class VerifyPQCSignatureRequest(BaseModel):
    canonical_statement: str = Field(
        ...,
        json_schema_extra={"example": "CANDIDATE=cand_pqc_9912|ROLE=Staff Distributed Systems Architect|CCRS=89.50|TENANT=tenant_default"}
    )
    public_key_hex: str = Field(..., json_schema_extra={"example": "pqc_pk_mldsa65_4e8a..."})
    signature_hex: str = Field(..., json_schema_extra={"example": "mldsa65_sig_7b2f..."})

class FHEEncryptVectorRequest(BaseModel):
    vector: List[float] = Field(..., json_schema_extra={"example": [0.12, 0.45, -0.22, 0.88]})
    key_id: str = "client_fhe_key"

class FHEMatchRequest(BaseModel):
    candidate_id: str = Field(..., json_schema_extra={"example": "cand_pqc_9912"})
    resume_ciphertext: Dict[str, Any]
    job_ciphertext: Dict[str, Any]
    candidate_skills: Optional[List[str]] = None
    job_skills: Optional[List[str]] = None
    tenant_id: str = "tenant_default"

@router.post("/generate-keys")
def generate_pqc_keys(req: GenerateKeysRequest):
    service = PQCFHEService()
    keys = service.generate_pqc_keypair(seed=req.seed)
    return {"status": "success", **keys}

@router.post("/sign-credential")
def sign_quantum_credential(
    req: SignPQCCredentialRequest,
    db: Session = Depends(get_db)
):
    service = PQCFHEService(db)
    credential = service.sign_quantum_credential(
        candidate_id=req.candidate_id,
        role_title=req.role_title,
        ccrs_score=req.ccrs_score,
        tenant_id=req.tenant_id
    )
    return {"status": "success", "credential": credential}

@router.post("/verify-signature")
def verify_quantum_signature(req: VerifyPQCSignatureRequest):
    service = PQCFHEService()
    verification = service.verify_quantum_signature(
        canonical_statement=req.canonical_statement,
        public_key_hex=req.public_key_hex,
        signature_hex=req.signature_hex
    )
    return {"status": "success", **verification}

@router.post("/fhe-encrypt-vector")
def fhe_encrypt_vector(req: FHEEncryptVectorRequest):
    service = PQCFHEService()
    encrypted = service.fhe_encrypt_vector(vector=req.vector, key_id=req.key_id)
    return {"status": "success", "ciphertext": encrypted}

@router.post("/fhe-match")
def fhe_match(
    req: FHEMatchRequest,
    db: Session = Depends(get_db)
):
    service = PQCFHEService(db)
    result = service.fhe_compute_encrypted_cosine(
        candidate_id=req.candidate_id,
        resume_ciphertext=req.resume_ciphertext,
        job_ciphertext=req.job_ciphertext,
        candidate_skills=req.candidate_skills,
        job_skills=req.job_skills,
        tenant_id=req.tenant_id
    )
    return {"status": "success", "fhe_match": result}
