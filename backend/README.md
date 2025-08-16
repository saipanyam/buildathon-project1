# Visual Memory Search Yantra - Backend

FastAPI backend for the Visual Memory Search application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure API Key:
Create a `settings.local.json` file in the backend directory:
```json
{
  "ANTHROPIC_API_KEY": "your-anthropic-api-key-here"
}
```
**Important:** Never commit your API key to the repository!

4. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/upload-screenshots` - Upload screenshots for processing
- `GET /api/search` - Search through processed screenshots
- `GET /api/prompts` - Get available prompt versions
- `POST /api/update-prompt` - Update the active prompt

## Testing

Run tests with:
```bash
pytest
```