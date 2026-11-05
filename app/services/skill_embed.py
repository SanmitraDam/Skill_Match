"""Embeddings with cached model + cached vectors; graceful w/o deps."""
from __future__ import annotations
from functools import lru_cache
from .skill_taxonomy import CONFIG

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None  # type: ignore

import numpy as np

_model = None

def get_model():
    global _model
    if _model is None:
        if SentenceTransformer is None:
            _model = False
        else:
            try:
                _model = SentenceTransformer(CONFIG.embedding_model)
            except Exception:
                _model = False
    return _model if _model is not False else None

@lru_cache(maxsize=2048)
def embed_cached(text: str):
    m = get_model()
    if m is None:
        return None
    try:
        v = np.asarray(m.encode([text])[0], dtype=float)
        n = float(np.linalg.norm(v))
        if n > 0:
            v = v / n
        return tuple(v.tolist())
    except Exception:
        return None

def cosine(a, b) -> float:
    va = np.asarray(a, dtype=float)
    vb = np.asarray(b, dtype=float)
    d = float(np.linalg.norm(va) * np.linalg.norm(vb))
    if d <= 0:
        return 0.0
    return float(np.dot(va, vb) / d)
