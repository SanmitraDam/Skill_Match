import shutil
import os

src = r"c:\Users\ASUS\Downloads\suggestion-v3.md"
dst = r"c:\Users\ASUS\Downloads\Skill_Match\suggestion-v3.md"

if os.path.exists(src):
    shutil.copyfile(src, dst)
    print("Copied suggestion-v3.md successfully!")
else:
    print(f"Source file not found at: {src}")
