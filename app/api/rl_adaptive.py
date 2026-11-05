"""
SkillMatch DNA Version 25.0: Deep Reinforcement Learning Adaptive Engine API Router.
Pillar 1 of suggestion-v24.md:
- POST /rl-adaptive/cat/step
- POST /rl-adaptive/roadmap/optimize
- GET  /rl-adaptive/policy-status
"""

from fastapi import APIRouter, HTTPException
from app.services.rl_adaptive_engine_service import (
    rl_adaptive_engine_service,
    PPOStepRequest,
    DDQNRoadmapOptimizeRequest
)

router = APIRouter(prefix="/rl-adaptive", tags=["Deep RL Adaptive Engine (v25.0)"])


@router.post("/cat/step")
async def step_ppo_cat(req: PPOStepRequest):
    try:
        return rl_adaptive_engine_service.step_ppo_cat_policy(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/roadmap/optimize")
async def optimize_roadmap(req: DDQNRoadmapOptimizeRequest):
    try:
        return rl_adaptive_engine_service.optimize_ddqn_roadmap(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/policy-status")
async def get_policy_status():
    try:
        return rl_adaptive_engine_service.get_policy_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
