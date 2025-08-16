# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual Memory Search

  **Description**: Search your screenshot history using natural language queries for both text content AND visual elements.

  Requirements:

  - Accept folder of screenshots

  - Extract both OCR text AND visual descriptions

  - Handle queries like "error message about auth" OR "screenshot with blue button"

  - Return top 5 matches with confidence scores

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

## Instructions to Build

- First review the project description & requirements

- Generate an architectural approach to develop this

- Require a React front end & a Fast API python backend

- Use latest Claude Sonnet OR Opus to do OCR Text extraction from screenshots AND Visual Decriptions

- Ensure that the output of the llm response is in JSON format.

- Add my Anthropic API key that is needed for above in settings.json (test with settings.local.json)

- Anthropic API key should be added to settings.local.json (not committed to repository)

- Make the UI modern, sleek and intuitive to use.

- Suggest UI/UX improvements

- Add an evaluation rubric for the extraction

- Assess the output based on the evaluation rubric and provide confidence scores and reasoning for it.

- Show the results of the evaluation on the UI

- Make the UX for consuming the eval results very intuitive, modern and stylish. So evals can be understood and appropriate action can be taken.

- Actions could be improve the application, make changes to the 'prompt' that extracts the text and visual descriptions

- Show the images in a carousel, a UI component that displays a series of images or other content in a slideshow-like format, allowing users to navigate through them using buttons or swipe gestures. It's a way to present multiple images or content items within a limited space, often used for photo galleries

- Make the UI/UX in Netflix style but for images

- When we hover over a image, flip it to show the visual description & extracted text in a clean Card type UI.

- Show the eval for each extracted field beside it without cluttering the UI.
