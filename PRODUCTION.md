# 🚀 SkillMatch DNA: Production Deployment Guide

This guide outlines the steps to move the SkillMatch DNA platform from a local prototype to a production-ready SaaS environment.

## 🏗️ Architecture Overview
The platform is built with a **Decoupled AI Stack**:
- **Frontend**: Next.js 15 / Three.js / R3F (Deployed to Vercel/Netlify)
- **Backend**: FastAPI / SQLAlchemy / Pydantic (Deployed to AWS/GCP/DigitalOcean)
- **AI Engine**: Groq (LLM) $\to$ Whisper (STT) $\to$ Edge-TTS (TTS) $\to$ Sentence-Transformers (Embeddings)
- **Data**: PostgreSQL (Relational) + Pinecone/Milvus (Vector) + S3 (Blob Storage)

---

## 🛠️ Deployment Steps

### 1. Database Migration (SQLite $\to$ PostgreSQL)
To support multi-tenancy and concurrent users:
1. Install PostgreSQL on your server.
2. Update `.env` with `DATABASE_URL=postgresql://user:password@host:port/dbname`.
3. Run migrations using Alembic:
   ```bash
   pip install alembic psycopg2-binary
   alembic upgrade head
   ```

### 2. AI Infrastructure Setup
- **Groq API**: Get a key from `console.groq.com` for near-instant LLM responses.
- **Voice Engine**: If deploying to a server, ensure `ffmpeg` is installed for audio processing.
- **Vector Scaling**: 
  - Update `app/services/vector_store.py` to use `PineconeVectorStore`.
  - Initialize a Pinecone index with **384 dimensions** (matches `all-MiniLM-L6-v2`).

### 3. Blob Storage (S3 Migration)
Replace local file saving with AWS S3 or Google Cloud Storage:
1. Update `STORAGE_TYPE=s3` in `.env`.
2. Configure `S3_BUCKET_NAME` and AWS credentials.
3. The `StorageService` abstraction in `app/services/storage_service.py` will handle the switch automatically.

### 4. Frontend Deployment
1. Set `NEXT_PUBLIC_API_BASE_URL` to your production FastAPI endpoint.
2. Deploy to Vercel.
3. Ensure CORS settings in `app/main.py` are restricted to your production domain (instead of `allow_origins=["*"]`).

---

## 🔒 Security Checklist
- [ ] **Secret Rotation**: Replace all default keys in `.env` with strong random strings.
- [ ] **SSL/TLS**: Ensure the API is served over HTTPS (using Nginx or Caddy).
- [ ] **Rate Limiting**: Implement `slowapi` or Nginx rate limiting to prevent AI API abuse.
- [ ] **Input Validation**: All PDF uploads are validated for extension and size in `app/api/skills.py`.

## 📈 Performance Tuning
- **Post-Processing**: For the 3D DNA Helix, users with low-end GPUs can toggle `performanceMode` in the Zustand store to disable Bloom and Anti-aliasing.
- **Async Tasks**: For heavy resume parsing, move `parse_resume` to a background worker using **Celery** + **Redis**.
