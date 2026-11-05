"""Smoke test for the v27.0 readiness/social/profile endpoints (no server process needed)."""
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi.testclient import TestClient

from app.main import app
from app.models.database import engine
from app.models.models import Base

Base.metadata.create_all(bind=engine)

client = TestClient(app)


def probe(method, url, **kwargs):
    response = getattr(client, method)(url, **kwargs)
    print(f"{method.upper()} {url} -> {response.status_code}")
    return response


failures = []

feed = probe("get", "/readiness/social/feed?limit=6")
if feed.status_code == 200:
    data = feed.json()
    print("  posts:", len(data["posts"]), "| source:", data["source"])
    print("  first:", json.dumps({k: data["posts"][0][k] for k in ("id", "postType", "verificationBadge", "timeAgo", "ccrsScore")}, ensure_ascii=False))
    if len(data["posts"]) < 4:
        failures.append("feed returned fewer than the 4 seed posts")
else:
    failures.append(f"feed failed: {feed.text[:400]}")

profile = probe("get", "/readiness/profiles/usr_8841")
if profile.status_code == 200:
    data = profile.json()
    print("  name:", data["candidate_name"], "| badge:", data["verification_badge"], "| ccrs:", data["ccrs_score"])
    print("  breakdown:", data["ccrs_breakdown"], "| views:", data["profile_views_count"])
    print("  social:", data["social_profiles"])
    for key in ("candidate_name", "candidate_role", "verification_badge", "ccrs_breakdown", "anc_performance", "social_profiles", "voice_snippet_url"):
        if key not in data:
            failures.append(f"profile payload missing {key}")
else:
    failures.append(f"profile failed: {profile.text[:400]}")

view = probe(
    "post",
    "/readiness/profiles/usr_8841/view",
    json={"viewer_name": "Priya Nair", "viewer_company": "OpenAI", "viewer_role": "Lead Recruiter", "is_recruiter": True},
)
if view.status_code == 200:
    data = view.json()
    print("  viewer:", data["viewerName"], "| company:", data["viewerCompany"], "| alignment:", data["vectorAlignmentPct"], "|", data["timeAgo"])
    if not 86.0 <= float(data["vectorAlignmentPct"]) <= 100.0:
        failures.append("alignment outside the 86-100 calibration band")
else:
    failures.append(f"view failed: {view.text[:400]}")

views = probe("get", "/readiness/profiles/usr_8841/views?limit=5")
if views.status_code == 200:
    data = views.json()
    print("  views:", len(data["views"]), "| total:", data["total"])
    for record in data["views"]:
        print("   -", record["viewerName"], "|", record["viewerCompany"], "|", record["vectorAlignmentPct"])
    if not any(record["viewerName"] == "Priya Nair" for record in data["views"]):
        failures.append("recorded view was not readable back from an opaque candidate id")
    if len(data["views"]) < 4:
        failures.append("viewer log did not include the seeded recruiters")
else:
    failures.append(f"views failed: {views.text[:400]}")

badge = probe("get", "/readiness/profiles/usr_8841/verification")
if badge.status_code == 200:
    data = badge.json()
    print("  badge:", data["verification_badge"], "| status:", data["verification_status"], "| liveness:", data["liveness_verified"])
else:
    failures.append(f"verification failed: {badge.text[:400]}")

updated = probe(
    "put",
    "/readiness/profiles/usr_8841",
    json={"headline": "Staff LLM Infrastructure Engineer", "bio": "Builds crypto-attested inference stacks.", "location": "Berlin, DE", "s_match_score": 96.5},
)
if updated.status_code == 200:
    data = updated.json()
    print("  updated headline:", data["headline"], "| breakdown:", data["ccrs_breakdown"], "| ccrs:", data["ccrs_score"])
    if data["ccrs_breakdown"]["s_match"] != 96.5:
        failures.append("profile update did not persist s_match_score")
    reloaded = probe("get", "/readiness/profiles/usr_8841")
    if reloaded.json()["headline"] != "Staff LLM Infrastructure Engineer":
        failures.append("updated headline did not persist")
else:
    failures.append(f"profile update failed: {updated.text[:400]}")

analytics = probe("get", "/readiness/profiles/usr_8841/analytics")
if analytics.status_code == 200:
    data = analytics.json()
    print("  impressions:", data["total_profile_impressions"], "| companies:", data["unique_recruiter_companies"])
    print("  reach accuracy:", data["reach_accuracy_score"], "| recruiter share:", data["recruiter_view_share_pct"])
    print("  weekly:", [(w["label"], w["impressions"]) for w in data["weekly_impressions"]])
    print("  vectors:", data["top_search_vectors"])
    if len(data["weekly_impressions"]) != 6:
        failures.append("weekly series should have 6 buckets")
    if not 80.0 <= float(data["reach_accuracy_score"]) <= 100.0:
        failures.append("reach accuracy outside expected band")
else:
    failures.append(f"analytics failed: {analytics.text[:400]}")

published = probe(
    "post",
    "/readiness/social/posts",
    json={"user_id": "usr_8841", "post_type": "QUIZ_MASTERY", "title": "Cleared adaptive CAT battery with 97.4% accuracy", "skill_tags": ["Pyodide", "CAT"], "ccrs_score": 94.2},
)
if published.status_code == 200:
    data = published.json()
    print("  published:", data["title"], "| badge:", data["verificationBadge"], "| hash:", data["proofHash"][:14])
else:
    failures.append(f"publish failed: {published.text[:400]}")

prefixed = probe("get", "/api/v1/readiness/social/feed?limit=2")
if prefixed.status_code != 200:
    failures.append(f"/api/v1 mount failed: {prefixed.text[:400]}")

print("\nRESULT:", "PASS" if not failures else "FAIL " + " | ".join(failures))
sys.exit(1 if failures else 0)
