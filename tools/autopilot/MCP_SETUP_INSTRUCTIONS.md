# VS Code Agent MCP Tool Registration

## Step 1: Open VS Code Agent
Open the Agent Chat in VS Code.

## Step 2: Go to Tools
Navigate to the Tools section in Agent Chat.

## Step 3: Add New Tool
Click "Add new tool" and configure:

**Tool Name:** `autopilot.feature`

**Method:** `POST`

**URL:** `http://localhost:7790/workflows/feature_autopilot`

**JSON Schema:**
```json
{
  "type": "object",
  "properties": {
    "repo_path": { 
      "type": "string",
      "description": "Absolute path to the repository"
    },
    "branch": { 
      "type": "string",
      "description": "Name of the new branch to create"
    },
    "goal": { 
      "type": "string",
      "description": "Description of what the autopilot should accomplish"
    },
    "apply_db": { 
      "type": "boolean",
      "description": "Whether to create database migrations"
    },
    "push": { 
      "type": "boolean",
      "description": "Whether to push the branch to remote"
    },
    "open_pr": { 
      "type": "boolean",
      "description": "Whether to open a pull request"
    },
    "retries": { 
      "type": "integer",
      "description": "Number of retries for failed operations"
    }
  },
  "required": ["repo_path", "branch", "goal"]
}
```

## Step 4: Test the Tool
Once configured, you can use it in Agent Chat like this:

```
Run tool: autopilot.feature
JSON:
{
  "repo_path": "/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main",
  "branch": "feature-xyz",
  "goal": "Implement XYZ feature with proper error handling",
  "apply_db": false,
  "push": false,
  "open_pr": false,
  "retries": 1
}
```

## Usage Notes
- Make sure the autopilot server is running (`./run.sh`) before using the tool
- The server runs on `http://localhost:7790`
- Check server health with: `curl http://localhost:7790/health`
