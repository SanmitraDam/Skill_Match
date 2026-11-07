"""
SkillMatch DNA v15.0 — Multi-Stage Interview Readiness & Topic-Wise Spatial Flashcard API Router.
"""

from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import List, Optional
from pydantic import BaseModel
from app.services.flashcard_service import (
    flashcard_service,
    FlashcardGenerateRequest,
    CardReviewRequest,
    PipelineAdvanceRequest,
    TopicFlashcardDeck,
)

router = APIRouter(prefix="/flashcards", tags=["Topic-Wise Flashcards & Readiness Pipeline (v15.0)"])


@router.post("/generate", response_model=TopicFlashcardDeck)
async def generate_flashcards(req: FlashcardGenerateRequest):
    try:
        return flashcard_service.generate_deck(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review")
async def review_card(req: CardReviewRequest):
    try:
        return flashcard_service.review_card_sm2(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cram")
async def get_cram_deck(deck_id: str = Query(None, description="Deck ID"), max_cards: int = Query(15, ge=1, le=50)):
    try:
        return flashcard_service.get_cram_deck(deck_id=deck_id, max_cards=max_cards)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pipeline-status")
async def get_pipeline_status(candidate_id: str = Query("cand_noosphere_001", description="Candidate ID")):
    try:
        return flashcard_service.evaluate_readiness_pipeline(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/advance-stage")
async def advance_stage(req: PipelineAdvanceRequest):
    return flashcard_service.advance_stage(req)


class PDFSectionGenerateRequest(BaseModel):
    document_title: str = "Uploaded Technical Manual.pdf"
    raw_text: Optional[str] = None
    target_role: Optional[str] = "Computer Science & Engineering"


@router.post("/upload-pdf")
async def upload_pdf_flashcards(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form("Computer Science & Engineering")
):
    """
    SkillMatch DNA v27.0: Upload technical PDF, parse multi-page text via PyMuPDF,
    extract heading hierarchy, and synthesize 4-6 cards per chapter section.
    """
    try:
        content = await file.read()
        res = flashcard_service.parse_and_generate_document_flashcards(
            filename=file.filename or "Uploaded_Document.pdf",
            content_bytes=content
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf-section-generate")
async def generate_pdf_sectional_flashcards(req: PDFSectionGenerateRequest):
    """
    SkillMatch DNA v27.0: Section-wise PDF heading segmentation and QA flashcard synthesis.
    Synthesizes structured chapters and cards with initial Ebbinghaus decay parameters.
    """
    try:
        res = flashcard_service.parse_and_generate_document_flashcards(
            filename=req.document_title,
            raw_text=req.raw_text
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
