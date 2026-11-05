"""Materializes any slice of the 33.6 BILLION virtual Q&A space into
shard SQLite databases, optionally uploading each shard to Cloudinary.

The virtual space is rendered deterministically from an integer index, so
"storing 30 billion+" means: run this script over index ranges until you
have materialized as many physical rows as your storage allows. Each run
produces immutable, uniquely-named shards (idx_start-idx_end.db.gz) that
can live in Cloudinary forever and be re-downloaded/rebuilt anywhere.

Examples:
  # Emit the first 1,000,000 pairs into shards of 250k, upload to Cloudinary
  python scripts/materialize_virtual_bank.py --start 0 --count 1000000 --shard-rows 250000 --upload

  # Local only (no upload), 5 million pairs
  python scripts/materialize_virtual_bank.py --count 5000000

  # A far slice of the space
  python scripts/materialize_virtual_bank.py --start 20000000000 --count 1000000
"""
import os
import sys
import json
import gzip
import time
import shutil
import sqlite3
import argparse

KIT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(KIT_DIR))
if KIT_DIR not in sys.path:
    sys.path.insert(0, KIT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

OUT_DIR = os.path.join(KIT_DIR, "virtual_shards")
CLOUD_FOLDER = "skillmatch/question_bank/virtual_shards"


def get_uploader():
    from dotenv import load_dotenv
    load_dotenv()
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    if not cloud_name or cloud_name.startswith("your_"):
        return None
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=os.getenv("CLOUDINARY_API_KEY", ""),
        api_secret=os.getenv("CLOUDINARY_API_SECRET", ""),
        secure=True,
    )
    return cloudinary.uploader


def materialize_shard(start: int, count: int, shard_path: str, qb) -> int:
    """Renders virtual indices [start, start+count) into a SQLite shard."""
    tmp = shard_path.replace(".gz", "")
    if os.path.exists(tmp):
        os.remove(tmp)
    conn = sqlite3.connect(tmp)
    conn.executescript(
        """
        CREATE TABLE qa (
            qa_id INTEGER PRIMARY KEY,
            virtual_index INTEGER UNIQUE NOT NULL,
            skill TEXT NOT NULL,
            concept TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            experience_level TEXT NOT NULL
        );
        CREATE INDEX idx_vs_skill ON qa(skill);
        CREATE INDEX idx_vs_vi ON qa(virtual_index);
        """
    )
    batch = []
    inserted = 0
    for i in range(start, start + count):
        item = qb.render_virtual(i)
        batch.append((
            i, item.get("skill", ""), item.get("concept", ""),
            item.get("question", ""), item.get("answer", ""),
            item.get("experience_level", ""),
        ))
        if len(batch) >= 10_000:
            conn.executemany(
                "INSERT INTO qa (virtual_index, skill, concept, question, answer, experience_level) "
                "VALUES (?,?,?,?,?,?)", batch)
            inserted += len(batch)
            batch.clear()
    if batch:
        conn.executemany(
            "INSERT INTO qa (virtual_index, skill, concept, question, answer, experience_level) "
            "VALUES (?,?,?,?,?,?)", batch)
        inserted += len(batch)
    conn.commit()
    conn.close()
    with open(tmp, "rb") as fin, gzip.GzipFile(shard_path, "wb", compresslevel=6) as gz:
        shutil.copyfileobj(fin, gz, length=8 * 1024 * 1024)
    os.remove(tmp)
    return inserted


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=0, help="first virtual index")
    parser.add_argument("--count", type=int, default=1_000_000, help="total pairs to materialize")
    parser.add_argument("--shard-rows", type=int, default=250_000, help="rows per shard db")
    parser.add_argument("--upload", action="store_true", help="upload finished shards to Cloudinary")
    args = parser.parse_args()

    from app.services.question_bank import question_bank_service as qb
    total = qb.virtual_total
    start = max(0, args.start)
    count = min(args.count, total - start)
    if count <= 0:
        print(f"Index {start} outside virtual space [0, {total:,})")
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    uploader = get_uploader() if args.upload else None
    if args.upload and uploader is None:
        print("Cloudinary not configured - materializing locally only.")

    done = 0
    t0 = time.time()
    while done < count:
        n = min(args.shard_rows, count - done)
        lo, hi = start + done, start + done + n
        shard_name = f"virtual_{lo:012d}_{hi:012d}.db.gz"
        shard_path = os.path.join(OUT_DIR, shard_name)
        rows = materialize_shard(lo, n, shard_path, qb)
        size_mb = os.path.getsize(shard_path) / 1e6
        rate = done / max(1e-9, time.time() - t0)
        print(f"  shard {shard_name}: {rows:,} rows, {size_mb:.1f} MB "
              f"({rate:,.0f} rows/s)")
        if uploader is not None:
            try:
                uploader.upload_large(
                    shard_path,
                    public_id=f"{CLOUD_FOLDER}/{shard_name}",
                    resource_type="raw", overwrite=True,
                )
                print(f"    -> uploaded to Cloudinary: {CLOUD_FOLDER}/{shard_name}")
            except Exception as e:
                print(f"    -> upload FAILED: {e}")
        done += rows

    print(f"\nDONE: {done:,} of 33,600,000,000 virtual pairs materialized "
          f"into {OUT_DIR} in {time.time()-t0:.0f}s")
    print("Run again with --start <next index> to continue filling the space.")


if __name__ == "__main__":
    main()
