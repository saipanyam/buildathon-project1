# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Memory Search

  **Description**: Search your screenshot history using natural language queries for both text content AND visual elements.

  Requirements:

  • Accept folder of screenshots

  • Extract both OCR text AND visual descriptions

  • Handle queries like "error message about auth" OR "screenshot with blue button"
  
  • Return top 5 matches with confidence scores

## Repository Structure

- README.md - Project description
- CLAUDE.md - Claude Code guidance

## Git Workflow

- Main branch: `main`
- Standard git workflow

## MCP Server Integration

This project has GitHub MCP server integration enabled. The GitHub MCP server provides:
- Repository management
- Issue and PR operations
- GitHub API access

Environment requirements:
- `GITHUB_PERSONAL_ACCESS_TOKEN` - Set in bash_profile