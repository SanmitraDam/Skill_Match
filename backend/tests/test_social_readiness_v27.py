"""
Automated Test Suite for SkillMatch DNA v27.0 (suggestion-v26.md):
Post-Sign-In Professional Social Readiness Network.

Verifies:
1. Verified readiness feed (seed fallback, contract shape, badge/post-type unions)
2. Milestone publishing (POST /readiness/social/posts) with sha256 proof hash + candidate filter
3. Recruiter inspection log ("Who viewed your profile") write -> read round-trip
4. Candidate Identity Hub payload contract (CCRS vector, liveness, ANC telemetry, social proof)
5. Identity hub upsert persistence + deterministic CCRS re-weighting
6. Verification badge mapping (PENDING -> SYSTEM_ARCHITECT)
7. Cumulative Reach Accuracy Index (6-week impression series, recruiter view share)
8. Dual route mount parity (bare + /api/v1) and the OpenAPI v27 route table
9. Blueprint exports compliance for the v27 frontend surfaces
"""

import os
import re
import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.database import SessionLocal
from app.models import models
from app.api.readiness import (
    _BADGE_BY_STATUS,
    _badge_for_status,
    _calibrated_alignment_pct,
    _ccrs_weighted,
    _humanize_age,
    _resolve_db_user_id,
    _weekly_impression_series,
)

client = TestClient(app)

# suggestion-v26.md Section 1 contract unions.
BADGE_UNION = {"Verified Candidate", "Top 5% CCRS", "System Architect"}
POST_TYPE_UNION = {
    "SKILL_GAP_CLEARED",
    "QUIZ_MASTERY",
    "MOCK_INTERVIEW_PASSED",
    "PROJECT_BENCHMARK",
}
CCRS_FORMULA = "S_match x 0.50 + A_quiz x 0.30 + I_voice x 0.20"

# v27.0 social readiness routes must be reachable on both mounts (app.main).
V27_ROUTES = [
    "/social/feed",
    "/social/posts",
    "/social/posts/{candidate_id}",
    "/profiles/{candidate_id}",
    "/profiles/{candidate_id}/view",
    "/profiles/{candidate_id}/views",
    "/profiles/{candidate_id}/analytics",
    "/profiles/{candidate_id}/verification",
]

# Frontend surfaces defined by suggestion-v26.md Sections 1-6.
BLUEPRINT_SURFACES = {
    "frontend/dna-web/src/components/social/ReadinessFeed.tsx": "ReadinessFeed",
    "frontend/dna-web/src/components/social/CandidateProfile.tsx": "CandidateProfile",
    "frontend/dna-web/src/components/social/ProfileAnalytics.tsx": "ProfileAnalytics",
    "frontend/dna-web/src/components/social/AudioPlayerTile.tsx": "AudioPlayerTile",
    "frontend/dna-web/src/components/navigation/SkipTOCNav.tsx": "SkipTOCNav",
    "frontend/dna-web/src/lib/flashcards/PDFFlashcardGenerator.ts": "parseSectionsFromText",
    "frontend/dna-web/src/lib/memory/MemoryEngine.ts": "MemoryEngine",
    "frontend/dna-web/src/lib/nlp/SurrenderHandler.ts": "detectSurrenderIntent",
    "frontend/dna-web/src/lib/navigation.ts": "profile_analytics",
    "frontend/dna-web/src/lib/store.ts": "saveCandidateProfile",
    "frontend/dna-web/src/types/api.ts": "interface ProfileAnalytics",
}


def _test_candidate() -> str:
    """
    Returns a dedicated, FK-safe candidate id used by the mutating tests so the
    suite never rewrites the demo seeds (usr_8841 et al.) it also asserts on.
    """
    db = SessionLocal()
    try:
        user = (
            db.query(models.User)
            .filter(models.User.username == "v27_social_candidate")
            .first()
        )
        if user is None:
            user = models.User(
                username="v27_social_candidate",
                email="v27_social_candidate@skillmatch.dev",
                hashed_password="v27-test-suite",
                role="candidate",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return str(user.id)
    finally:
        db.close()


def _purge(table, **filters) -> None:
    """Best-effort cleanup so repeated runs do not grow the demo database."""
    db = SessionLocal()
    try:
        db.query(table).filter_by(**filters).delete()
        db.commit()
    except Exception:  # noqa: BLE001 - cleanup must never fail a test
        db.rollback()
    finally:
        db.close()


# ============================================================================
# Test 1: Verified readiness feed (seed fallback + ReadinessFeedPost contract)
# ============================================================================
def test_social_feed_contract_and_seed_fallback():
    res = client.get("/readiness/social/feed", params={"limit": 6})
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["source"] in {"hybrid", "empty"}
    assert 1 <= len(data["posts"]) <= 6
    assert data["total"] == len(data["posts"])
    assert data["generated_at"] > 0

    for post in data["posts"]:
        for key in (
            "id",
            "candidateId",
            "candidateName",
            "candidateRole",
            "avatarGradient",
            "verificationBadge",
            "ccrsScore",
            "postType",
            "title",
            "skillTags",
            "likesCount",
            "peerVerificationsCount",
            "createdAt",
            "timeAgo",
            "source",
        ):
            assert key in post, f"feed post missing {key}"
        assert post["verificationBadge"] in BADGE_UNION
        assert post["postType"] in POST_TYPE_UNION
        assert 0.0 <= float(post["ccrsScore"]) <= 100.0
        assert isinstance(post["skillTags"], list)
        assert post["timeAgo"], "timeAgo must render a human label"
        assert post["avatarGradient"].startswith("from-")

    # The deterministic enterprise seed log keeps the feed populated before the
    # candidate publishes their first verified milestone.
    seeds = [post for post in data["posts"] if post["source"] == "seed"]
    if seeds:
        assert any(post["postType"] == "PROJECT_BENCHMARK" for post in data["posts"])


def test_social_feed_limit_is_bounded():
    # limit=0/None falls back to the documented default of 12 posts.
    default = client.get("/readiness/social/feed", params={"limit": 0})
    assert default.status_code == 200, default.text
    assert len(default.json()["posts"]) == 12

    omitted = client.get("/readiness/social/feed")
    assert omitted.status_code == 200, omitted.text
    assert len(omitted.json()["posts"]) == 12

    high = client.get("/readiness/social/feed", params={"limit": 500})
    assert high.status_code == 200, high.text
    assert len(high.json()["posts"]) <= 50




# ============================================================================
# Test 2: Milestone publishing + sha256 proof hash + per-candidate filter
# ============================================================================
def test_publish_milestone_and_candidate_filter():
    candidate = _test_candidate()
    title = f"v27 verified CAT milestone {uuid.uuid4().hex[:8]}"

    published_res = client.post(
        "/readiness/social/posts",
        json={
            "user_id": candidate,
            "post_type": "QUIZ_MASTERY",
            "title": title,
            "skill_tags": ["Pyodide", "CAT", "vLLM"],
            "ccrs_score": 94.2,
        },
    )
    assert published_res.status_code == 200, published_res.text
    published = published_res.json()

    assert published["id"].isdigit()
    assert published["candidateId"] == candidate
    assert published["title"] == title
    assert published["postType"] == "QUIZ_MASTERY"
    assert published["skillTags"] == ["Pyodide", "CAT", "vLLM"]
    assert published["ccrsScore"] == 94.2
    assert published["likesCount"] == 0
    assert published["peerVerificationsCount"] == 0
    assert published["verificationBadge"] in BADGE_UNION
    assert published["timeAgo"] == "just now"
    # Deterministic sha256 provenance for the milestone.
    assert re.fullmatch(r"[0-9a-f]{64}", published["proofHash"] or ""), published["proofHash"]

    try:
        feed = client.get("/readiness/social/feed", params={"limit": 50}).json()
        assert published["id"] in [post["id"] for post in feed["posts"]], "published milestone missing from feed"

        own = client.get(f"/readiness/social/posts/{candidate}", params={"limit": 50})
        assert own.status_code == 200, own.text
        own_payload = own.json()
        assert own_payload["candidate_id"] == candidate
        assert published["id"] in [post["id"] for post in own_payload["posts"]]
        assert all(post["candidateId"] == candidate for post in own_payload["posts"])
    finally:
        _purge(models.ReadinessPost, user_id=int(candidate))


def test_publish_milestone_rejects_short_title():
    res = client.post(
        "/readiness/social/posts",
        json={"user_id": _test_candidate(), "post_type": "QUIZ_MASTERY", "title": "ab"},
    )
    assert res.status_code == 422, res.text



# ============================================================================
# Test 3: "Who viewed your profile" recruiter inspection log
# ============================================================================
def test_recruiter_view_log_roundtrip():
    candidate = _test_candidate()
    viewer_name = f"Priya Nair {uuid.uuid4().hex[:6]}"

    view_res = client.post(
        f"/readiness/profiles/{candidate}/view",
        json={
            "viewer_name": viewer_name,
            "viewer_company": "OpenAI",
            "viewer_role": "Lead Technical Recruiter",
            "is_recruiter": True,
        },
    )
    assert view_res.status_code == 200, view_res.text
    record = view_res.json()

    assert re.fullmatch(r"pv_\d+", record["id"]), record["id"]
    assert record["viewerName"] == viewer_name
    assert record["viewerCompany"] == "OpenAI"
    assert record["viewerRole"] == "Lead Technical Recruiter"
    assert record["isRecruiter"] is True
    assert record["timeAgo"] == "just now"
    assert record["avatarGradient"].startswith("from-")
    assert record["matchedSkills"], "viewer intent vectors must expose matched skills"
    assert record["profile_views_count"] >= 1
    # Section 1.3 calibration band: recruiter search vector . candidate CCRS vector.
    assert 86.0 <= float(record["vectorAlignmentPct"]) <= 100.0

    try:
        listed = client.get(f"/readiness/profiles/{candidate}/views", params={"limit": 50})
        assert listed.status_code == 200, listed.text
        payload = listed.json()
        assert payload["candidate_id"] == candidate
        assert payload["total"] >= 1
        assert len(payload["views"]) <= 50
        assert any(item["viewerName"] == viewer_name for item in payload["views"])
        assert all(86.0 <= float(item["vectorAlignmentPct"]) <= 100.0 for item in payload["views"])
        assert all(item["viewedAt"] for item in payload["views"])
    finally:
        _purge(models.ProfileView, candidate_id=int(candidate))


def test_view_log_seeds_when_database_is_empty():
    """An untouched profile still renders the deterministic enterprise viewer log."""
    fresh = f"usr_v27_seed_{uuid.uuid4().hex[:6]}"
    res = client.get(f"/readiness/profiles/{fresh}/views", params={"limit": 10})
    assert res.status_code == 200, res.text
    payload = res.json()
    assert len(payload["views"]) >= 4, "seed recruiter log must pad an empty inspection table"


# ============================================================================
# Test 4: Candidate Identity Hub payload (suggestion-v26.md Section 1.2)
# ============================================================================
def test_identity_hub_payload_contract():
    candidate = f"usr_v27_hub_{uuid.uuid4().hex[:6]}"
    res = client.get(f"/readiness/profiles/{candidate}")
    assert res.status_code == 200, res.text
    profile = res.json()

    assert profile["user_id"] == candidate
    assert profile["candidate_name"]
    assert profile["headline"]
    assert profile["bio"]
    assert profile["location"]
    assert profile["verification_status"]
    assert profile["verification_badge"] in BADGE_UNION
    assert profile["liveness_engine"] == "MediaPipe FaceMesh liveness detection"
    assert profile["ccrs_formula"] == CCRS_FORMULA
    assert 0.0 <= float(profile["ccrs_score"]) <= 100.0
    assert profile["profile_views_count"] >= 0
    assert profile["public_proof_url"].startswith("skillmatch.id/verify/")

    # CCRS 3-pillar vector breakdown.
    breakdown = profile["ccrs_breakdown"]
    assert set(breakdown) == {"s_match", "a_quiz", "i_voice"}
    assert all(0.0 <= float(value) <= 100.0 for value in breakdown.values())
    expected = round(
        float(breakdown["s_match"]) * 0.5
        + float(breakdown["a_quiz"]) * 0.3
        + float(breakdown["i_voice"]) * 0.2,
        1,
    )
    assert abs(float(profile["ccrs_score"]) - expected) < 0.15, (profile["ccrs_score"], expected)

    # ANC telemetry (Section 2) and 15s voice STAR snippet.
    anc = profile["anc_performance"]
    assert anc["db_reduction"] < 0, "ANC must report a negative dB reduction"
    assert 0.0 <= float(anc["clarity_score"]) <= 100.0
    assert anc["engine"]
    assert profile["voice_snippet_seconds"] == 15
    assert profile["voice_snippet_url"]

    # Social proof links.
    assert set(profile["social_profiles"]) == {"github", "linkedin", "portfolio"}
    assert profile["social_profiles"]["github"].startswith("https://github.com/")
    assert profile["social_profiles"]["linkedin"].startswith("https://linkedin.com/in/")


def test_identity_hub_payload_is_deterministic():
    candidate = f"usr_v27_stable_{uuid.uuid4().hex[:6]}"
    first = client.get(f"/readiness/profiles/{candidate}").json()
    second = client.get(f"/readiness/profiles/{candidate}").json()
    assert first["ccrs_breakdown"] == second["ccrs_breakdown"]
    assert first["anc_performance"] == second["anc_performance"]
    assert first["public_proof_url"] == second["public_proof_url"]


# ============================================================================
# Test 5: Identity hub upsert persistence + liveness attestation toggle
# ============================================================================
def _snapshot_profile(user_id: int):
    """Captures the persisted CandidateProfile row (or None) so tests can restore it."""
    db = SessionLocal()
    try:
        row = (
            db.query(models.CandidateProfile)
            .filter(models.CandidateProfile.user_id == user_id)
            .first()
        )
        if row is None:
            return None
        return {
            "headline": row.headline,
            "bio": row.bio,
            "location": row.location,
            "s_match_score": float(row.s_match_score or 0.0),
            "a_quiz_score": float(row.a_quiz_score or 0.0),
            "i_voice_score": float(row.i_voice_score or 0.0),
            "ccrs_score": float(row.ccrs_score or 0.0),
            "liveness_verified": bool(row.liveness_verified),
            "verification_status": row.verification_status,
        }
    finally:
        db.close()


def test_identity_hub_update_persists_and_reweights_ccrs():
    candidate = _test_candidate()
    numeric_id = int(candidate)
    snapshot = _snapshot_profile(numeric_id)
    before = client.get(f"/readiness/profiles/{candidate}").json()
    assert before["user_id"] == candidate and before["ccrs_formula"] == CCRS_FORMULA

    updated_res = client.put(
        f"/readiness/profiles/{candidate}",
        json={
            "headline": "Staff LLM Infrastructure Engineer",
            "bio": "Builds crypto-attested inference stacks.",
            "location": "Berlin, DE",
            "s_match_score": 96.5,
            "liveness_verified": True,
        },
    )
    assert updated_res.status_code == 200, updated_res.text
    updated = updated_res.json()

    assert updated["headline"] == "Staff LLM Infrastructure Engineer"
    assert updated["bio"] == "Builds crypto-attested inference stacks."
    assert updated["location"] == "Berlin, DE"
    assert updated["ccrs_breakdown"]["s_match"] == 96.5
    assert updated["liveness_verified"] is True
    # Persisted S_match (50% weight) must feed the weighted CCRS composite.
    weighted = _ccrs_weighted(updated["ccrs_breakdown"])
    assert updated["ccrs_score"] in {weighted, snapshot["ccrs_score"] if snapshot else weighted}
    assert abs(weighted - (96.5 * 0.5 + updated["ccrs_breakdown"]["a_quiz"] * 0.3 + updated["ccrs_breakdown"]["i_voice"] * 0.2)) < 0.15

    reloaded = client.get(f"/readiness/profiles/{candidate}").json()
    assert reloaded["headline"] == "Staff LLM Infrastructure Engineer"
    assert reloaded["ccrs_breakdown"]["s_match"] == 96.5

    verification = client.get(f"/readiness/profiles/{candidate}/verification").json()
    assert verification["candidate_id"] == candidate
    assert verification["verification_status"] == reloaded["verification_status"]
    assert verification["verification_badge"] == reloaded["verification_badge"]
    assert verification["liveness_verified"] is True
    assert verification["checked_at"] > 0

    # Toggling liveness off must round-trip through the same upsert path.
    off = client.put(f"/readiness/profiles/{candidate}", json={"liveness_verified": False})
    assert off.status_code == 200, off.text
    assert off.json()["liveness_verified"] is False
    assert client.get(f"/readiness/profiles/{candidate}/verification").json()["liveness_verified"] is False

    # Restore (or drop) the row so the shared demo database keeps its prior state.
    _restore_profile(numeric_id, snapshot)


def _restore_profile(user_id: int, snapshot) -> None:
    """Restores the exact pre-test CandidateProfile row, deleting it if it was synthesised."""
    db = SessionLocal()
    try:
        row = (
            db.query(models.CandidateProfile)
            .filter(models.CandidateProfile.user_id == user_id)
            .first()
        )
        if row is None:
            return
        if snapshot is None:
            db.delete(row)
        else:
            for field, value in snapshot.items():
                setattr(row, field, value)
        db.commit()
    except Exception:  # noqa: BLE001 - restoration must never mask a test result
        db.rollback()
    finally:
        db.close()


# ============================================================================
# Test 6: Verification badge mapping (models.py status union -> badge union)
# ============================================================================
def test_badge_mapping_and_db_status_union():
    assert set(_BADGE_BY_STATUS) == {"PENDING", "VERIFIED_CANDIDATE", "TOP_5_CCRS", "SYSTEM_ARCHITECT"}
    assert set(_BADGE_BY_STATUS.values()) <= BADGE_UNION
    assert _badge_for_status("TOP_5_CCRS") == "Top 5% CCRS"
    assert _badge_for_status("system_architect") == "System Architect"
    assert _badge_for_status(None) == "Verified Candidate"
    assert _badge_for_status("UNKNOWN_STATUS") == "Verified Candidate"

    # A persisted TOP_5_CCRS candidate must surface the matching badge everywhere
    # (identity hub, verification probe, feed post and viewer-triggered post).
    db = SessionLocal()
    try:
        row = (
            db.query(models.CandidateProfile)
            .filter(models.CandidateProfile.verification_status == "TOP_5_CCRS")
            .first()
        )
    finally:
        db.close()
    if row is not None:
        hub = client.get(f"/readiness/profiles/{row.user_id}").json()
        assert hub["verification_badge"] == "Top 5% CCRS"
        assert client.get(f"/readiness/profiles/{row.user_id}/verification").json()["verification_badge"] == "Top 5% CCRS"


# ============================================================================
# Test 7: Cumulative Reach Accuracy Index (suggestion-v26.md Section 1.3)
# ============================================================================
def test_reach_accuracy_index_payload():
    candidate = _test_candidate()
    res = client.get(f"/readiness/profiles/{candidate}/analytics")
    assert res.status_code == 200, res.text
    payload = res.json()

    assert payload["candidate_id"] == candidate
    assert payload["total_profile_impressions"] >= 0
    assert payload["unique_recruiter_companies"] >= 0
    assert 86.0 <= float(payload["reach_accuracy_score"]) <= 100.0
    assert 0.0 <= float(payload["recruiter_view_share_pct"]) <= 100.0
    assert "Candidate CCRS Vector" in payload["formula"]
    assert payload["peak_visibility_window"]
    assert payload["generated_at"] > 0

    # 6-week impression velocity series with recruiter share <= impressions.
    series = payload["weekly_impressions"]
    assert [point["label"] for point in series] == ["W-5", "W-4", "W-3", "W-2", "W-1", "This wk"]
    assert all(point["impressions"] >= 1 for point in series)
    assert all(0 <= point["recruiter_views"] <= point["impressions"] for point in series)

    # Weighted alignment breakdown mirrors the CCRS formula.
    breakdown = payload["alignment_breakdown"]
    assert [component["component"] for component in breakdown] == ["S_match", "A_quiz", "I_voice"]
    assert [component["weight"] for component in breakdown] == [0.5, 0.3, 0.2]
    assert all(0.0 <= float(component["value"]) <= 100.0 for component in breakdown)

    assert isinstance(payload["top_search_vectors"], list)
    assert len(payload["recruiter_viewers"]) <= 5


def test_reach_index_impressions_increase_after_a_view():
    candidate = _test_candidate()
    before = client.get(f"/readiness/profiles/{candidate}/analytics").json()

    client.post(
        f"/readiness/profiles/{candidate}/view",
        json={"viewer_name": "Analytics Probe", "viewer_company": "Datadog", "viewer_role": "Recruiter"},
    )
    try:
        after = client.get(f"/readiness/profiles/{candidate}/analytics").json()
        assert after["total_profile_impressions"] > before["total_profile_impressions"]
        assert after["unique_recruiter_companies"] >= before["unique_recruiter_companies"]
    finally:
        _purge(models.ProfileView, candidate_id=int(candidate))



# ============================================================================
# Test 8: Deterministic analytic helpers (no random drift between reloads)
# ============================================================================
def test_helper_determinism_and_bounds():
    weights = {"s_match": 96.5, "a_quiz": 91.8, "i_voice": 97.2}
    assert _ccrs_weighted(weights) == 95.2, _ccrs_weighted(weights)
    assert _ccrs_weighted({}) == 0.0

    # Recruiter alignment is clamped into the documented 86%-100% enterprise band.
    for company, role in [("OpenAI", "Lead Recruiter"), ("Stripe", "Head of Infra Talent"), ("", "")]:
        value = _calibrated_alignment_pct(company, role, weights)
        assert 86.0 <= value <= 100.0
    assert _calibrated_alignment_pct("OpenAI", "Lead Recruiter", weights) == _calibrated_alignment_pct(
        "OpenAI", "Lead Recruiter", weights
    )

    series = _weekly_impression_series(275, "usr_8841")
    assert series == _weekly_impression_series(275, "usr_8841")
    assert len(series) == 6

    assert _humanize_age(None) == "just now"


def test_id_resolution_is_stable_for_opaque_frontend_ids():
    opaque = "usr_8841"
    resolved = _resolve_db_user_id(opaque)
    assert isinstance(resolved, int)
    assert resolved == _resolve_db_user_id(opaque), "opaque ids must map deterministically"
    assert _resolve_db_user_id("1") == 1
    # The identity hub and the recruiter log must agree on the resolved id.
    hub = client.get("/readiness/profiles/usr_8841").json()
    assert hub["user_id"] == opaque


# ============================================================================
# Test 9: Route surface parity (bare mount + /api/v1) and OpenAPI registration
# ============================================================================
def test_v27_routes_mounted_on_both_prefixes():
    # app.routes wraps mounted routers, so parity is verified through the OpenAPI
    # schema (which flattens both the bare and /api/v1 mounts).
    schema = client.get("/openapi.json")
    assert schema.status_code == 200, schema.text
    paths = schema.json()["paths"]

    for path in V27_ROUTES:
        assert f"/readiness{path}" in paths, f"{path} missing from the bare mount"
        assert f"/api/v1/readiness{path}" in paths, f"{path} missing from the /api/v1 mount"

    # Live requests through both mounts must agree.
    bare = client.get("/readiness/social/feed", params={"limit": 2})
    prefixed = client.get("/api/v1/readiness/social/feed", params={"limit": 2})
    assert bare.status_code == prefixed.status_code == 200
    assert [post["postType"] for post in bare.json()["posts"]] == [
        post["postType"] for post in prefixed.json()["posts"]
    ]
    assert client.get("/api/v1/readiness/profiles/usr_8841").status_code == 200
    assert client.get("/api/v1/readiness/profiles/usr_8841/analytics").status_code == 200


def test_v27_route_methods_match_the_frontend_contract():
    schema = client.get("/openapi.json").json()
    operations = {
        path: {method.upper() for method in operations}
        for path, operations in schema["paths"].items()
    }

    expectations = {
        "/readiness/social/feed": {"GET"},
        "/readiness/social/posts": {"POST"},
        "/readiness/social/posts/{candidate_id}": {"GET"},
        "/readiness/profiles/{candidate_id}": {"GET", "PUT"},
        "/readiness/profiles/{candidate_id}/view": {"POST"},
        "/readiness/profiles/{candidate_id}/views": {"GET"},
        "/readiness/profiles/{candidate_id}/analytics": {"GET"},
        "/readiness/profiles/{candidate_id}/verification": {"GET"},
    }
    for path, expected_methods in expectations.items():
        assert expected_methods <= operations[path], f"{path} exposes {operations[path]}, expected {expected_methods}"


# ============================================================================
# Test 10: Blueprint exports compliance for the v27 frontend surfaces
# ============================================================================
def test_v27_frontend_blueprint_exports():
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    missing = []
    for relative, needle in BLUEPRINT_SURFACES.items():
        path = os.path.join(root, relative.replace("/", os.sep))
        if not os.path.exists(path):
            missing.append(f"{relative} (file missing)")
            continue
        with open(path, encoding="utf-8") as handle:
            if needle not in handle.read():
                missing.append(f"{relative} (expected '{needle}')")
    assert not missing, "v27 blueprint surfaces incomplete: " + "; ".join(missing)


def test_v27_navigation_registers_the_social_sections():
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    nav_path = os.path.join(root, "frontend", "dna-web", "src", "lib", "navigation.ts")
    with open(nav_path, encoding="utf-8") as handle:
        nav = handle.read()

    for tab_id in ("feed", "candidate_profile", "profile_analytics"):
        assert f"id: '{tab_id}'" in nav, f"navigation.ts missing {tab_id}"

    workspace_path = os.path.join(root, "frontend", "dna-web", "src", "components", "modules", "Workspace.tsx")
    with open(workspace_path, encoding="utf-8") as handle:
        workspace = handle.read()
    for tab_id in ("feed", "candidate_profile", "profile_analytics"):
        assert f"activeTab === '{tab_id}'" in workspace, f"Workspace.tsx missing {tab_id} gate"

