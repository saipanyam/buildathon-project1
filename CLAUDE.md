# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Buildathon project repository for rapidly prototyping innovative AI solutions. The repository is currently in its initial state.

## Repository Structure

The repository is newly initialized with:
- README.md - Project description
- .gitignore - Standard git ignore file

## Development Setup

As this is a new repository, the technology stack and build commands will need to be established based on the chosen implementation approach. When setting up the project:

1. Determine the primary programming language and framework
2. Create appropriate configuration files (package.json, requirements.txt, etc.)
3. Update this file with the relevant build, test, and run commands

## Git Workflow

- Main branch: `main`
- The repository uses standard git workflow

## MCP Server Integration

This project includes the GitHub MCP server for enhanced GitHub operations. The server is configured in `mcp-config.json` and provides:
- Direct GitHub API access
- Repository and issue management
- PR creation and review capabilities

To use the GitHub MCP server, ensure the `GITHUB_PERSONAL_ACCESS_TOKEN` environment variable is set.