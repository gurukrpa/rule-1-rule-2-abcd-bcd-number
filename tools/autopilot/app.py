import subprocess, os, textwrap
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

# Optional: import LangGraph for advanced flows
try:
    from langgraph.graph import START, StateGraph
except ImportError:
    print("LangGraph not available, but that's okay for basic functionality")

app = FastAPI()

def sh(cmd, cwd=None):
    print(">>", cmd)
    r = subprocess.run(cmd, cwd=cwd, shell=True, text=True, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"FAILED: {cmd}\n{r.stdout}\n{r.stderr}")
    return r.stdout

class Job(BaseModel):
    repo_path: str
    branch: str
    goal: str
    apply_db: bool = False
    push: bool = False
    open_pr: bool = False
    retries: int = 0

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/workflows/feature_autopilot")
def feature_autopilot(job: Job):
    # 1) Checkout/create branch
    sh(f'git checkout -b {job.branch}', cwd=job.repo_path)

    # 2) Here is where Claude (via VS Code Agent) will edit code per 'goal'
    # Autopilot just runs tests and optional DB steps after Claude finishes edits

    # 3) Run tests (optional - only if test script exists)
    try:
        # Check if npm test script exists first
        package_json_path = os.path.join(job.repo_path, "package.json")
        if os.path.exists(package_json_path):
            import json
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            if package_data.get('scripts', {}).get('test'):
                sh("npm test -- --watch=false", cwd=job.repo_path)
            else:
                print("No test script found in package.json, skipping tests")
        else:
            print("No package.json found, skipping tests")
    except Exception as e:
        if job.retries > 0:
            try:
                sh("npm test -- --watch=false", cwd=job.repo_path)
            except:
                print(f"Tests failed even after retry: {e}")
        else:
            print(f"Tests failed: {e}")

    # 4) Optional: create DB migration (example for Supabase)
    if job.apply_db:
        sql = f"-- SQL migration for goal: {job.goal}\n"
        mig_file = os.path.join(job.repo_path, "db", "migrations", "autopilot.sql")
        os.makedirs(os.path.dirname(mig_file), exist_ok=True)
        with open(mig_file, "w") as f:
            f.write(sql)
        sh("git add db/migrations/autopilot.sql", cwd=job.repo_path)
        sh('git commit -m "chore(db): add autopilot migration"', cwd=job.repo_path)

    # 5) Push + PR
    if job.push:
        sh("git push -u origin HEAD", cwd=job.repo_path)
        if job.open_pr:
            title = f"feat: {job.goal[:60]}"
            body = textwrap.dedent(f"Autopilot changes\n\nGoal:\n{job.goal}")
            sh(f'gh pr create --title "{title}" --body "{body}" --fill', cwd=job.repo_path)

    return {"ok": True, "branch": job.branch}
