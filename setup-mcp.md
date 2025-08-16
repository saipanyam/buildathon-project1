# GitHub MCP Server Setup

This project includes the GitHub MCP (Model Context Protocol) server for enhanced GitHub integration.

## Setup Instructions

1. **Generate a GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with appropriate scopes (repo, read:org, etc.)

2. **Configure the MCP Server:**
   - Copy your GitHub token
   - Set it as an environment variable:
     ```bash
     export GITHUB_PERSONAL_ACCESS_TOKEN="your-token-here"
     ```
   - Or update it directly in `mcp-config.json`

3. **Run the MCP Server:**
   ```bash
   npx @modelcontextprotocol/server-github
   ```

## Usage with Claude Desktop

To use this with Claude Desktop, add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Available Features

The GitHub MCP server provides:
- Repository management
- Issue and PR creation/management
- Code search across repositories
- Workflow automation
- GitHub API access

## Testing the Connection

Run the MCP inspector to test:
```bash
npx @modelcontextprotocol/inspector
```