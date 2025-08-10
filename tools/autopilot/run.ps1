$P = Split-Path -Parent $MyInvocation.MyCommand.Path
. "$P\.venv\Scripts\Activate.ps1"
uvicorn app:app --reload --port 7790
