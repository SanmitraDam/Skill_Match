"""
SkillMatch DNA — Localhost Deployment Supervisor (v27.0)
Launches:
  1. FastAPI AI Engine & Backend (Port 8000)
  2. Next.js 3D Interactive Spatial Frontend (Port 3000)
"""

import os
import sys
import time
import subprocess
import signal
import urllib.request
import urllib.error

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_paths():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if os.path.exists(os.path.join(script_dir, "backend", "app")):
        base_dir = script_dir
    elif os.path.exists(os.path.join(script_dir, "..", "app")):
        base_dir = os.path.dirname(os.path.dirname(script_dir))
    else:
        base_dir = os.path.dirname(script_dir)
    
    next_dir = os.path.join(base_dir, "frontend", "dna-web")
    
    if sys.platform == "win32":
        venv_py = os.path.join(base_dir, ".venv", "Scripts", "python.exe")
    else:
        venv_py = os.path.join(base_dir, ".venv", "bin", "python")
        
    py_exec = venv_py if os.path.exists(venv_py) else sys.executable
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    
    return base_dir, next_dir, py_exec, npm_cmd

def kill_proc_tree(proc):
    if not proc or proc.poll() is not None:
        return
    try:
        if sys.platform == "win32":
            subprocess.call(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            proc.terminate()
            proc.wait(timeout=3)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

def wait_for_health(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck"})
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(1)
    return False

def main():
    base_dir, next_dir, py_exec, npm_cmd = get_paths()

    print("=" * 68)
    print("      SKILLMATCH DNA — LOCALHOST DEPLOYMENT SUPERVISOR")
    print("=" * 68)
    print(f"  • Root directory : {base_dir}")
    print(f"  • Python runtime : {py_exec}")
    print(f"  • Frontend app   : {next_dir}")
    print("=" * 68)

    print("\n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [
        py_exec, "-m", "uvicorn",
        "--app-dir", os.path.join(base_dir, "backend"),
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=base_dir,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )

    print("[2/2] Starting Next.js Web App on http://localhost:3000 ...")
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=next_dir,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )

    print("\nWaiting for FastAPI backend to become ready...")
    ready = wait_for_health("http://127.0.0.1:8000/health", timeout=60)
    if ready:
        print("Backend is healthy and responding!")
    else:
        print("Backend process started (initial model loading may take a few seconds).")

    print("Waiting for Next.js frontend to become ready...")
    fe_ready = wait_for_health("http://127.0.0.1:3000", timeout=60)
    if fe_ready:
        print("Frontend is healthy and responding!")
    else:
        print("Frontend process started.")

    print("\n" + "=" * 68)
    print("  LOCAL DEPLOYMENT READY! ACCESS YOUR SERVICES AT:")
    print("=" * 68)
    print("  Next.js 3D Web UI:         http://localhost:3000")
    print("  FastAPI AI Backend:        http://localhost:8000")
    print("  Interactive Swagger Docs:  http://localhost:8000/docs")
    print("  Health Telemetry:          http://localhost:8000/health")
    print("  Streamlit Portal (opt):    run_streamlit.bat (http://localhost:8501)")
    print("=" * 68)
    print("Press Ctrl+C to stop all services.\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("FastAPI backend exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Next.js frontend exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping all SkillMatch services...")
    finally:
        kill_proc_tree(backend_proc)
        kill_proc_tree(frontend_proc)
        print("All SkillMatch services stopped cleanly.")

if __name__ == "__main__":
    main()
