"""
SkillMatch DNA Version 25.0: Multi-Agent Reinforcement Learning (MARL) Squad API Router.
Pillar 2 of suggestion-v24.md:
- POST /marl-squad/negotiate
- POST /marl-squad/qmix/factorize
- GET  /marl-squad/swarm-metrics
"""

from fastapi import APIRouter, HTTPException
from app.services.marl_squad_orchestrator_service import (
    marl_squad_orchestrator_service,
    MAPPONegotiateRequest,
    QMIXFactorizeRequest
)

router = APIRouter(prefix="/marl-squad", tags=["MARL Squad Orchestration & QMIX (v25.0)"])


@router.post("/negotiate")
async def negotiate_mappo(req: MAPPONegotiateRequest):
    try:
        return marl_squad_orchestrator_service.negotiate_mappo(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/qmix/factorize")
async def factorize_qmix(req: QMIXFactorizeRequest):
    try:
        return marl_squad_orchestrator_service.factorize_qmix_squad_value(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/swarm-metrics")
async def get_swarm_metrics():
    try:
        return marl_squad_orchestrator_service.get_swarm_metrics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
