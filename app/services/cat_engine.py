import json
import math
import random
import httpx
from typing import List, Optional, Tuple, Dict, Any
from app.core.config import settings
from app.schemas.quiz import MCQQuestion, QuizFinalResult
from app.core.logger import get_logger

logger = get_logger("cat_engine")

class CATEngine:
    """
    The Computerized Adaptive Testing (CAT) Engine.
    Implements Item Response Theory (IRT) using a 2-Parameter Logistic (2PL) model
    to dynamically calibrate candidate ability (theta) and adjust question difficulty.
    """
    def __init__(self):
        # 2-Parameter Logistic (2PL) IRT Model defaults
        self.default_discrimination_a = 1.2  # Typical discrimination parameter
        self.min_theta = -3.0
        self.max_theta = 3.0

    def difficulty_to_b(self, difficulty: int) -> float:
        """Maps discrete difficulty 1..5 to continuous IRT difficulty parameter b in [-2.5, +2.5]."""
        # 1 -> -2.5, 2 -> -1.25, 3 -> 0.0, 4 -> +1.25, 5 -> +2.5
        return (difficulty - 3) * 1.25

    def theta_to_difficulty(self, theta: float) -> int:
        """Maps continuous latent ability theta to discrete difficulty 1..5."""
        diff = round(3.0 + (theta / 1.25))
        return min(5, max(1, diff))

    def probability_correct_2pl(self, theta: float, b: float, a: float = 1.2) -> float:
        """
        Computes the probability of a correct response using the 2PL IRT formula.

        Args:
            theta (float): Latent ability of the candidate.
            b (float): Difficulty parameter of the item.
            a (float): Discrimination parameter of the item. Defaults to 1.2.

        Returns:
            float: Probability of a correct response [0.0, 1.0].
        """
        exponent = -a * (theta - b)
        # Clamping to avoid overflow
        exponent = max(-20.0, min(20.0, exponent))
        return 1.0 / (1.0 + math.exp(exponent))

    def update_ability_irt_2pl(self, current_theta: float, difficulty: int, is_correct: bool, a: float = 1.2) -> Tuple[float, int]:
        """
        Updates latent ability theta using 2PL IRT Fisher Information step:
        theta_{k+1} = theta_k + (a * (A_k - P(theta))) / (I(theta) + lambda)
        """
        b = self.difficulty_to_b(difficulty)
        ak = 1.0 if is_correct else 0.0
        p_expected = self.probability_correct_2pl(current_theta, b, a)

        # Fisher Information for 2PL: I(theta) = a^2 * P * (1 - P)
        information = (a ** 2) * p_expected * (1.0 - p_expected)
        damping = 0.35  # Regularization damping factor to avoid overshooting
        step = (a * (ak - p_expected)) / (information + damping)

        new_theta = current_theta + step
        new_theta = max(self.min_theta, min(self.max_theta, new_theta))
        new_diff = self.theta_to_difficulty(new_theta)

        return round(new_theta, 3), new_diff

    def update_ability_2pl(self, current_theta: float, item_discrimination: float, item_difficulty: float, correct: bool) -> Tuple[float, int]:
        ak = 1.0 if correct else 0.0
        a = item_discrimination
        b = item_difficulty
        p_expected = self.probability_correct_2pl(current_theta, b, a)
        information = (a ** 2) * p_expected * (1.0 - p_expected)
        damping = 0.35
        step = (a * (ak - p_expected)) / (information + damping)
        new_theta = current_theta + step
        new_theta = max(self.min_theta, min(self.max_theta, new_theta))
        new_diff = self.theta_to_difficulty(new_theta)
        return round(new_theta, 3), new_diff

    # Backwards compatibility alias
    def update_difficulty(self, current_difficulty: int, is_correct: bool) -> int:
        current_theta = self.difficulty_to_b(current_difficulty)
        _, new_diff = self.update_ability_irt_2pl(current_theta, current_difficulty, is_correct)
        return new_diff

    async def generate_question(self, skill: str, difficulty: int, theta: float = 0.0) -> MCQQuestion:
        """
        Synthesizes a targeted MCQ or coding challenge via LLM (Groq/Ollama) or deterministic fallback.

        Args:
            skill (str): The technical skill to target.
            difficulty (int): Target difficulty level (1-5).
            theta (float): Current latent ability of the candidate. Defaults to 0.0.

        Returns:
            MCQQuestion: A structured question object containing text, options, and metadata.
        """
        b = self.difficulty_to_b(difficulty)
        a = round(random.uniform(1.1, 1.4), 2)

        is_coding_skill = skill.lower() in {
            "python", "javascript", "typescript", "go", "sql", "postgresql", "fastapi", "react", "pytorch"
        }
        is_code_challenge = is_coding_skill and (difficulty >= 3) and (random.random() > 0.4)

        if is_code_challenge:
            prompt = (
                f"You are a technical interviewer. Create a code comprehension challenge about '{skill}' "
                f"at difficulty level {difficulty} (1=Beginner, 5=Staff/Expert). "
                f"Include a realistic, concise code snippet (5-10 lines) with a subtle bug or tricky output. "
                f"Return ONLY a JSON object with: "
                f"'question' (the prompt describing what to find or expected output), "
                f"'code_snippet' (the 5-10 line code block), "
                f"'options' (list of exactly 4 strings), "
                f"'correct_option_index' (0-3), "
                f"'difficulty' ({difficulty}), and "
                f"'skill_targeted' ('{skill}')."
            )
        else:
            prompt = (
                f"Generate a highly technical multiple-choice question about '{skill}' "
                f"at difficulty level {difficulty} (1=Beginner, 5=Staff/Expert). "
                f"Return ONLY a JSON object with: "
                f"'question', 'options' (list of exactly 4 strings), 'correct_option_index' (0-3), "
                f"'difficulty' ({difficulty}), 'skill_targeted' ('{skill}')."
            )

        # 1. Try Groq (Preferred)
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
                        timeout=10.0
                    )
                    response.raise_for_status()
                    content = response.json()["choices"][0]["message"]["content"]
                    data = json.loads(content)
                    return MCQQuestion(
                        question=data["question"],
                        options=data["options"],
                        correct_option_index=int(data["correct_option_index"]),
                        difficulty=difficulty,
                        skill_targeted=skill,
                        code_snippet=data.get("code_snippet"),
                        question_type="code_challenge" if data.get("code_snippet") else "mcq",
                        theta_ability=theta,
                        item_difficulty_b=b,
                        item_discrimination_a=a
                    )
            except Exception as e:
                logger.exception(f"Groq question generation failed: {e}")

        # 2. Try Ollama local
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json"
                    },
                    timeout=15.0
                )
                response.raise_for_status()
                data = json.loads(response.json()["response"])
                return MCQQuestion(
                    question=data["question"],
                    options=data["options"],
                    correct_option_index=int(data["correct_option_index"]),
                    difficulty=difficulty,
                    skill_targeted=skill,
                    code_snippet=data.get("code_snippet"),
                    question_type="code_challenge" if data.get("code_snippet") else "mcq",
                    theta_ability=theta,
                    item_difficulty_b=b,
                    item_discrimination_a=a
                )
        except Exception:
            logger.warning("Ollama question generation failed, using deterministic fallback.")

        # 3. Deterministic Fallback Question
        mock_snippet = None
        if is_code_challenge:
            mock_snippet = f"def optimize_{skill.replace(' ', '_')}():\n    cache = {{}}\n    # Complex logic\n    return cache"

        return MCQQuestion(
            question=f"Which of the following describes the optimal design pattern or production consideration for {skill}?",
            options=[
                f"Decouple state and leverage asynchronous connection pools for {skill}.",
                f"Store all runtime state directly in global memory variables.",
                f"Execute blocking synchronous calls on the main thread.",
                f"Bypass connection timeouts to avoid request failure."
            ],
            correct_option_index=0,
            difficulty=difficulty,
            skill_targeted=skill,
            code_snippet=mock_snippet,
            question_type="code_challenge" if mock_snippet else "mcq",
            theta_ability=theta,
            item_difficulty_b=b,
            item_discrimination_a=a
        )

    def calculate_final_score(self, total_questions: int, correct_answers: int, peak_difficulty: int, final_theta: float = 0.0) -> float:
        """
        Calculates a calibrated score incorporating IRT latent ability theta
        and peak difficulty reached.
        """
        if total_questions == 0:
            return 0.0

        base_accuracy = (correct_answers / total_questions) * 100.0
        # IRT ability bonus: theta in [-3, +3] mapped to [0.8, 1.2]
        theta_factor = 1.0 + (final_theta / 15.0)
        difficulty_multiplier = 0.5 + (peak_difficulty / 10.0)

        calibrated = base_accuracy * difficulty_multiplier * theta_factor * 1.15
        return float(min(100.0, max(0.0, round(calibrated, 1))))

cat_engine = CATEngine()
