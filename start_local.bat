@echo off
title SkillMatch Localhost Runner
echo ========================================================
echo Starting SkillMatch AI Platform on Localhost...
echo ========================================================
if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe run_local.py
) else (
    python run_local.py
)
pause
