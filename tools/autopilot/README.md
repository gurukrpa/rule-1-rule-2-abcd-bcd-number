# Autopilot + LangGraph Server

This is a FastAPI server that provides workflow automation capabilities with optional LangGraph integration.

## Setup

1. Create virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On Mac/Linux
   # or
   .\.venv\Scripts\Activate.ps1  # On Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   # Mac/Linux
   ./run.sh
   
   # Windows
   .\run.ps1
   
   # Or manually
   uvicorn app:app --reload --port 7790
   ```

## Endpoints

- `GET /health` - Health check endpoint
- `POST /workflows/feature_autopilot` - Main automation workflow

## MCP Tool Configuration

To use with VS Code Agent, register this as an MCP HTTP tool:

**Name:** autopilot.feature
**Method:** POST
**URL:** http://localhost:7790/workflows/feature_autopilot

**Schema:**
```json
{
  "type": "object",
  "properties": {
    "repo_path": { "type": "string" },
    "branch": { "type": "string" },
    "goal": { "type": "string" },
    "apply_db": { "type": "boolean" },
    "push": { "type": "boolean" },
    "open_pr": { "type": "boolean" },
    "retries": { "type": "integer" }
  },
  "required": ["repo_path", "branch", "goal"]
}
```
