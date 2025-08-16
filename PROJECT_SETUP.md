# Visual Memory Search - Setup Guide

## Overview

Visual Memory Search is an AI-powered application that allows you to search through your screenshot history using natural language queries. It can find content based on both text (OCR) and visual elements.

## Features

- **OCR Text Extraction**: Automatically extracts all text from screenshots
- **Visual Description**: AI-powered analysis of UI elements, colors, and layouts  
- **Smart Search**: Natural language queries that understand both text and visual context
- **Confidence Scoring**: Returns top 5 matches with confidence scores
- **Batch Processing**: Process entire folders of screenshots at once
- **Drag & Drop Upload**: Easy screenshot upload interface

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Claude 3.5 Sonnet for OCR and visual analysis
- **Search**: Sentence transformers with cosine similarity

## Installation

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/saipanyam/buildathon-project1.git
   cd buildathon-project1
   ```

2. **Run the application**
   ```bash
   ./start.sh
   ```

   This will:
   - Install all dependencies
   - Start the backend server on http://localhost:8000
   - Start the frontend on http://localhost:5173

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. The API key is already configured in `settings.local.json`

5. Start the backend:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Upload Screenshots**:
   - Drag and drop images onto the upload area
   - Or click to browse and select files
   - Or enter a folder path to process all images in that folder

2. **Search**:
   - Enter natural language queries like:
     - "error message about authentication"
     - "screenshot with blue button"
     - "dashboard showing graphs"
     - "terminal with git commands"

3. **View Results**:
   - Top 5 matches displayed with confidence scores
   - Shows both OCR text and visual descriptions
   - Indicates match type (text, visual, or combined)

## API Endpoints

- `POST /upload-screenshots` - Upload multiple screenshots
- `POST /search` - Search through processed screenshots
- `POST /process-folder` - Process all images in a folder
- `GET /status` - Get system status
- `GET /docs` - Interactive API documentation

## Configuration

The Anthropic API key is configured in `backend/settings.local.json`. 

To use your own API key:
1. Get an API key from https://console.anthropic.com/
2. Update `backend/settings.local.json`:
   ```json
   {
     "ANTHROPIC_API_KEY": "your-api-key-here"
   }
   ```

## UI/UX Improvements

The application features:
- **Modern glassmorphic design** with gradient backgrounds
- **Smooth animations** and transitions
- **Responsive layout** that works on all screen sizes
- **Intuitive drag-and-drop** interface
- **Real-time search feedback** with loading states
- **Clear visual hierarchy** with proper spacing and typography
- **Accessibility features** including keyboard navigation

## Performance Optimizations

- Async processing of screenshots
- Vector embeddings cached for fast search
- Batch upload support
- Lazy loading of results
- Debounced search input

## Troubleshooting

1. **Backend not starting**: Ensure Python 3.8+ is installed and virtual environment is activated
2. **Frontend build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. **API connection issues**: Check that backend is running on port 8000
4. **Search not working**: Ensure screenshots have been processed (check /status endpoint)

## Future Enhancements

- Image preview in search results
- Export search results
- Advanced filtering options
- Support for more file formats
- Duplicate detection
- Search history