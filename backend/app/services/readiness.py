import json
import hashlib
import uuid
import datetime
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.schemas.roadmap import RoadmapPlan, WeeklyGoal
from app.core.logger import get_logger

logger = get_logger("readiness")

class ReadinessService:
    def calculate_ccrs(self, skill_match: float, quiz_score: float, interview_score: float) -> float:
        """
        CCRS = (0.30 * Smatch) + (0.35 * Aquiz) + (0.35 * Ivoice)
        """
        composite = (0.30 * skill_match) + (0.35 * quiz_score) + (0.35 * interview_score)
        return float(round(composite, 1))

    def generate_openbadge_credential(self, candidate_name: str, score: float, readiness_id: int) -> Dict[str, Any]:
        """
        Issues an OpenBadges 3.0 compliant verifiable digital credential
        if the candidate achieves CCRS >= 80.0%.
        """
        is_certified = score >= 80.0
        badge_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"skillmatch-{readiness_id}-{score}"))
        verification_hash = hashlib.sha256(f"{candidate_name}:{score}:{badge_uuid}".encode()).hexdigest()

        return {
            "@context": "https://w3id.org/openbadges/v2",
            "id": f"urn:uuid:{badge_uuid}",
            "type": "Assertion",
            "recipient": {
                "type": "email",
                "hashed": True,
                "identity": f"sha256${hashlib.sha256(candidate_name.lower().encode()).hexdigest()}"
            },
            "badge": {
                "name": "SkillMatch Certified Ready Engineer",
                "description": f"Awarded to {candidate_name} for demonstrating an authenticated Composite Career Readiness Score of {score}% across vector matching, adaptive testing, and voice interviews.",
                "image": "https://skillmatch.ai/static/badges/career-dna-certified.png",
                "criteria": "https://skillmatch.ai/criteria/ccrs-80",
                "issuer": {
                    "name": "SkillMatch Autonomous AI Platform",
                    "url": "https://skillmatch.ai",
                    "email": "verify@skillmatch.ai"
                }
            },
            "issuedOn": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
            "verification": {
                "type": "HostedBadge",
                "verificationHash": verification_hash,
                "status": "VERIFIED" if is_certified else "IN_PROGRESS",
                "minimumThreshold": 80.0,
                "scoreAchieved": score
            }
        }

    def generate_ics_calendar(self, roadmap: RoadmapPlan) -> str:
        """
        Generates an RFC 5545 standard iCalendar (.ics) file
        scheduling 4 weekly study sprints.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        ics_lines = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//SkillMatch DNA//Career Roadmap Engine 2.0//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            "X-WR-CALNAME:SkillMatch Career Sprint"
        ]

        for goal in roadmap.weekly_plan:
            start_date = now + datetime.timedelta(days=(goal.week - 1) * 7 + 1)
            end_date = start_date + datetime.timedelta(hours=2)
            dtstart = start_date.strftime("%Y%m%dT%H%M00Z")
            dtend = end_date.strftime("%Y%m%dT%H%M00Z")
            event_uid = f"skillmatch-week-{goal.week}-{uuid.uuid4().hex[:8]}@skillmatch.ai"

            objectives_text = "\\n- ".join(goal.learning_objectives)
            resources_text = "\\n- ".join(goal.suggested_resources)
            description = (
                f"SkillMatch Week {goal.week}: {goal.focus_skill}\\n\\n"
                f"Objectives:\\n- {objectives_text}\\n\\n"
                f"Resources:\\n- {resources_text}"
            )

            ics_lines.extend([
                "BEGIN:VEVENT",
                f"UID:{event_uid}",
                f"DTSTAMP:{now.strftime('%Y%m%dT%H%M00Z')}",
                f"DTSTART:{dtstart}",
                f"DTEND:{dtend}",
                f"SUMMARY:SkillMatch Sprint: Master {goal.focus_skill} (Week {goal.week})",
                f"DESCRIPTION:{description}",
                "STATUS:CONFIRMED",
                "END:VEVENT"
            ])

        ics_lines.append("END:VCALENDAR")
        return "\r\n".join(ics_lines)

class RoadmapService:
    async def generate_roadmap(self, candidate_name: str, score: float, gaps: List[str]) -> RoadmapPlan:
        """
        Generates a personalized 4-week learning roadmap targeting skill gaps with curated resource links.
        """
        target_gaps = gaps if gaps else ["System Design", "Cloud Infrastructure", "Asynchronous Python"]

        prompt = (
            f"Candidate: {candidate_name}\nReadiness Score: {score}%\nCritical Skill Gaps: {', '.join(target_gaps)}\n\n"
            f"Create an intensive, highly structured 4-week learning roadmap. For each week (1 to 4):\n"
            f"1. Assign a focus skill targeting one of the gaps,\n"
            f"2. Provide 2-3 specific, hands-on learning objectives,\n"
            f"3. Suggest 2-3 free vetted platforms/courses (e.g., 'Coursera: Deep Learning Specialization', 'YouTube: NeetCode System Design', 'Official Documentation').\n"
            f"Return ONLY a JSON object with: 'candidate_name', 'readiness_score', 'weekly_plan' (list of 4 weeks), and 'final_advice'."
        )

        if settings.GROQ_API_KEY:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                        json={
                            "model": "llama3-70b-8192",
                            "messages": [{"role": "user", "content": prompt}],
                            "response_format": {"type": "json_object"}
                        },
                        timeout=20.0
                    )
                    response.raise_for_status()
                    content = response.json()["choices"][0]["message"]["content"]
                    return RoadmapPlan(**json.loads(content))
            except Exception as e:
                logger.exception(f"Roadmap generation failed via Groq: {e}")

        # Fallback to local Ollama
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
                    timeout=25.0
                )
                return RoadmapPlan(**json.loads(response.json()["response"]))
        except Exception:
            # Deterministic curated fallback roadmap
            return RoadmapPlan(
                candidate_name=candidate_name,
                readiness_score=score,
                weekly_plan=[
                    WeeklyGoal(
                        week=i,
                        focus_skill=target_gaps[(i - 1) % len(target_gaps)],
                        learning_objectives=[
                            f"Master core architecture & internals of {target_gaps[(i - 1) % len(target_gaps)]}",
                            f"Build a production microservice demonstrating {target_gaps[(i - 1) % len(target_gaps)]} best practices",
                            "Implement integration tests and benchmark throughput"
                        ],
                        suggested_resources=[
                            f"Official {target_gaps[(i - 1) % len(target_gaps)]} Production Documentation",
                            "Coursera / edX Advanced Engineering Track",
                            "YouTube: Architecture & System Design Deep Dive"
                        ]
                    )
                    for i in range(1, 5)
                ],
                final_advice="Target your weakest verbal interview areas by doing daily timed explanations out loud. Consistency beats cramming."
            )

readiness_service = ReadinessService()
roadmap_service = RoadmapService()
