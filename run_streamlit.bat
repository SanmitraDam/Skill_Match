@echo off
title AI-HireSense Streamlit Runner
echo ========================================================
echo Starting AI-HireSense Career DNA Platform on Streamlit...
echo ========================================================
if exist .venv\Scripts\python.exe (
    .venv\Scripts\python.exe -m streamlit run streamlit_app.py
) else (
    python -m streamlit run streamlit_app.py
)
pause

