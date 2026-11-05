"""Add pgvector extension and HNSW index for candidate skills

Revision ID: 001_pgvector_hnsw
Revises: 
Create Date: 2026-09-17 21:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_pgvector_hnsw'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 1. Enable pgvector extension if using PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # 2. Create candidate_skill_vectors table with 384-d vector column
        op.execute("""
            CREATE TABLE IF NOT EXISTS candidate_skill_vectors (
                id SERIAL PRIMARY KEY,
                resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
                skill_name VARCHAR(100) NOT NULL,
                skill_vector vector(384) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Create HNSW index for Cosine Distance with production parameters:
        # m = 16 (bidirectional links per node)
        # ef_construction = 64 (candidate list size during index build)
        op.execute("""
            CREATE INDEX IF NOT EXISTS idx_candidate_skills_hnsw 
            ON candidate_skill_vectors 
            USING hnsw (skill_vector vector_cosine_ops) 
            WITH (m = 16, ef_construction = 64);
        """)

        # 4. Set default ef_search parameter for high-recall sub-millisecond queries
        op.execute("ALTER DATABASE current_database() SET hnsw.ef_search = 40;")

def downgrade():
    bind = op.get_bind()
    if bind.dialect.name == 'postgresql':
        op.execute("DROP INDEX IF EXISTS idx_candidate_skills_hnsw;")
        op.execute("DROP TABLE IF EXISTS candidate_skill_vectors;")
