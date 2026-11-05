"""
Interplanetary Distributed Talent Mesh API Router — SkillMatch DNA v22.0
Pillar 1: Delta-CRDT Synchronization, DTN Bundling & Edge Node Status
"""
from fastapi import APIRouter
from typing import Any, Dict, List
from app.services.interplanetary_mesh_service import (
    interplanetary_mesh_service,
    DeltaCRDTOperation,
    DeltaCRDTState,
    DTNPacketBundle,
    MeshNodeStatus,
    ConvergenceMetric
)

router = APIRouter(prefix="/mesh", tags=["Interplanetary Distributed Talent Mesh"])


@router.post("/crdt/sync-delta", response_model=DeltaCRDTState)
def sync_delta_crdt_operation(op: DeltaCRDTOperation):
    """Merges a state-based delta CRDT operation concurrently across edge nodes."""
    return interplanetary_mesh_service.sync_delta_crdt(op)


@router.post("/dtn/bundle-packet", response_model=DTNPacketBundle)
def bundle_dtn_assessment_packet(payload: Dict[str, Any]):
    """Bundles encrypted assessment sessions into lightweight verifiable DTN packets."""
    source_edge_node = payload.get("source_edge_node", "node-geo-apac")
    target_cluster = payload.get("target_cluster", "cluster-global-consensus")
    session_id = payload.get("session_id", "sess-default-mesh")
    data = payload.get("payload_data", {})
    return interplanetary_mesh_service.bundle_dtn_packet(source_edge_node, target_cluster, session_id, data)


@router.get("/nodes/status", response_model=List[MeshNodeStatus])
def get_mesh_nodes_status():
    """Returns active geo-distributed edge pops, satellite relays, and terrestrial hubs."""
    return interplanetary_mesh_service.get_mesh_nodes_status()


@router.get("/convergence-metric/{session_id}", response_model=ConvergenceMetric)
@router.get("/convergence-metric", response_model=ConvergenceMetric)
def get_mesh_convergence_metric(session_id: str = "sess-global-consensus"):
    """Returns deterministic consensus convergence latency metrics across global nodes."""
    return interplanetary_mesh_service.get_convergence_metric(session_id)
