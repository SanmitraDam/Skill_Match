"""Syncs the SkillMatch question bank to Cloudinary.

PHYSICAL REALITY: 33.6 billion stored Q&A rows would need ~30+ TB â€” no
cloud storage can hold that. So this syncs two things that DO fit:

  1. THE GENERATOR KIT (~100 KB): seeds + virtual-space manifest + builder.
     Any machine can download this and regenerate the full 33.6B space.
  2. THE CURATED DB (448k rows, ~500 MB) compressed into <90 MB gzip shards
     (Cloudinary raw-file limit is 100 MB on most plans).

Usage:
  python scripts/sync_bank_to_cloudinary.py            # full sync
  python scripts/sync_bank_to_cloudinary.py --dry-run  # pack only, no upload
"""
import os
import sys
import json
import gzip
import shutil
import time
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BACKEND_DIR, "data", "cloudinary_sync")
DB_PATH = os.path.join(BACKEND_DIR, "data", "question_bank.db")
SHARD_BYTES = 90 * 1024 * 1024
CLOUD_FOLDER = "skillmatch/question_bank"


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


def upload(uploader, path: str, public_id: str) -> dict:
    result = uploader.upload_large(
        path, public_id=public_id, resource_type="raw", overwrite=True
    )
    return {
        "public_id": result.get("public_id", public_id),
        "url": result.get("secure_url", ""),
        "bytes": result.get("bytes", os.path.getsize(path)),
    }


def pack_generator_kit(out_dir):
    from app.services import question_bank as qbmod
    from app.services.question_bank import question_bank_service as qb

    kit = []
    manifest = {
        "name": "skillmatch_question_bank",
        "virtual_space": {
            "total_questions": qb.virtual_total,
            "dimensions": {
                "concept_anchors": len(qb._load_anchors()),
                "question_styles": len(qbmod.QUESTION_STYLES),
                "market_scenarios": len(qbmod.SCENARIOS),
                "experience_levels": len(qbmod.EXPERIENCE_LEVELS),
                "framings": len(qbmod.FRAMINGS),
                "emphases": len(qbmod.EMPHASES),
                "probes": len(qbmod.PROBES),
                "company_contexts": len(qbmod.CONTEXTS),
            },
            "render": "deterministic from integer index [0, total)",
        },
        "curated_db": {"shards": []},
    }

    for fname, dest in [
        ("scripts/question_bank_seeds.py", "kit/question_bank_seeds.py"),
        ("scripts/build_question_bank.py", "kit/build_question_bank.py"),
        ("scripts/materialize_virtual_bank.py", "kit/materialize_virtual_bank.py"),
    ]:
        dst = os.path.join(out_dir, os.path.basename(dest))
        if os.path.exists(fname):
            shutil.copyfile(fname, dst)
            kit.append((dst, f"{CLOUD_FOLDER}/{dest}"))
            print(f"  kit: {dest}")

    manifest_path = os.path.join(out_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    kit.append((manifest_path, f"{CLOUD_FOLDER}/manifest.json"))
    print(f"  kit: manifest.json (virtual_space={qb.virtual_total:,})")
    return kit, manifest


def pack_db_shards(out_dir, manifest):
    shards = []
    if not os.path.exists(DB_PATH):
        print("  curated DB not found - skipping shards")
        return shards
    tmp_gz = os.path.join(out_dir, "db.gz.tmp")
    with open(DB_PATH, "rb") as fin, gzip.GzipFile(tmp_gz, "wb", compresslevel=6) as gz:
        shutil.copyfileobj(fin, gz, length=8 * 1024 * 1024)
    total = os.path.getsize(tmp_gz)
    n_shards = max(1, (total + SHARD_BYTES - 1) // SHARD_BYTES)
    print(f"  curated DB: {total/1e6:.1f} MB gzipped -> {n_shards} shard(s)")
    with open(tmp_gz, "rb") as f:
        for i in range(n_shards):
            data = f.read(SHARD_BYTES)
            shard_name = f"question_bank.db.gz.part{i:03d}"
            shard_path = os.path.join(out_dir, shard_name)
            with open(shard_path, "wb") as out:
                out.write(data)
            shards.append((shard_path, f"{CLOUD_FOLDER}/shards/{shard_name}"))
            manifest["curated_db"]["shards"].append(shard_name)
    os.remove(tmp_gz)
    return shards


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    os.makedirs(OUT_DIR, exist_ok=True)
    print("Packing generator kit...")
    kit, manifest = pack_generator_kit(OUT_DIR)
    print("Packing curated DB shards...")
    shards = pack_db_shards(OUT_DIR, manifest)
    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    all_files = kit + shards
    print(f"\nTotal upload payload: {len(all_files)} file(s)")

    if args.dry_run:
        print("DRY RUN - nothing uploaded. Files ready in", OUT_DIR)
        for p, pid in all_files:
            print(f"  {pid}  ({os.path.getsize(p)/1e6:.2f} MB)")
        return

    uploader = get_uploader()
    if uploader is None:
        print("\nCLOUDINARY NOT CONFIGURED - set CLOUDINARY_CLOUD_NAME / API_KEY /")
        print("API_SECRET in .env. Packed files remain in", OUT_DIR)
        return

    results = []
    for path, public_id in all_files:
        t0 = time.time()
        print(f"Uploading {public_id} ...", end=" ", flush=True)
        try:
            r = upload(uploader, path, public_id)
            results.append(r)
            print(f"OK ({os.path.getsize(path)/1e6:.1f} MB, {time.time()-t0:.0f}s)")
        except Exception as e:
            print(f"FAILED: {e}")
    print(f"\nSync complete: {len(results)}/{len(all_files)} uploaded to Cloudinary")


if __name__ == "__main__":
    main()



