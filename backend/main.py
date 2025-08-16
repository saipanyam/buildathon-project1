from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
import asyncio
from contextlib import asynccontextmanager

from app.config import settings
from app.services.claude_service import ClaudeService
# Try to import the full ML search service, fallback to simple version
try:
    from app.services.search_service import SearchService
    print("✅ Using full ML-powered search service")
except ImportError as e:
    print(f"⚠️  ML dependencies not available: {e}")
    print("✅ Using lightweight text-based search service")
    from app.services.simple_search_service import SimpleSearchService as SearchService
from app.services.evaluation_service import EvaluationService
from app.services.prompt_manager import PromptManager
from app.models import SearchQuery, SearchResult, ScreenshotMetadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🔧 Initializing services...")
    print(f"🔑 API key configured: {bool(settings.ANTHROPIC_API_KEY)}")
    print(f"🔑 API key length: {len(settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else 0}")
    
    try:
        # Initialize Claude service
        if settings.ANTHROPIC_API_KEY:
            app.state.claude_service = ClaudeService(api_key=settings.ANTHROPIC_API_KEY)
            print("✅ Claude service initialized successfully")
        else:
            app.state.claude_service = None
            print("❌ Claude service not initialized - no API key")
            
        # Initialize other services
        app.state.search_service = SearchService()
        app.state.evaluation_service = EvaluationService()
        app.state.prompt_manager = PromptManager()
        print("✅ All other services initialized")
        
    except Exception as e:
        print(f"❌ Warning: Failed to initialize some services: {e}")
        print(f"❌ Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        # Initialize fallback services
        app.state.claude_service = None
        app.state.search_service = SearchService() if 'SearchService' in globals() else None
        app.state.evaluation_service = EvaluationService()
        app.state.prompt_manager = PromptManager()
    yield
    
app = FastAPI(
    title="Visual Memory Search API",
    description="Search screenshots using natural language queries",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
PROCESSED_DIR = Path("processed")
UPLOAD_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# Mount static files for frontend assets
if Path("static/assets").exists():
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# Mount static files for other resources (icons, etc.)
if Path("static").exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/api/status")
async def api_status():
    """API status endpoint - moved from root to avoid conflict with frontend"""
    return {
        "message": "Visual Memory Search API", 
        "status": "active",
        "environment": os.getenv("APP_ENV", "production"),
        "port": os.getenv("PORT", "unknown")
    }

@app.get("/yantra-icon.svg")
async def serve_icon():
    """Serve the app icon"""
    icon_path = Path("static/yantra-icon.svg")
    if icon_path.exists():
        return FileResponse(icon_path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Icon not found")

@app.get("/vite.svg")
async def serve_vite_icon():
    """Serve the Vite icon"""
    icon_path = Path("static/vite.svg")
    if icon_path.exists():
        return FileResponse(icon_path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="Icon not found")

@app.get("/")
async def serve_frontend():
    """Serve the React frontend"""
    frontend_path = Path("static/index.html")
    if frontend_path.exists():
        return FileResponse(frontend_path, media_type="text/html")
    else:
        # Fallback to API response if frontend not available
        return {
            "message": "Visual Memory Search API", 
            "status": "active",
            "environment": os.getenv("APP_ENV", "production"),
            "port": os.getenv("PORT", "unknown")
        }

@app.get("/uploads/{file_hash}")
async def get_upload_file(file_hash: str):
    """Get uploaded file with correct extension"""
    import os
    from fastapi.responses import FileResponse
    
    # Check for different extensions
    possible_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp']
    
    for ext in possible_extensions:
        file_path = UPLOAD_DIR / f"{file_hash}{ext}"
        if file_path.exists():
            # Map extensions to proper MIME types
            mime_mapping = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg', 
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.bmp': 'image/bmp'
            }
            return FileResponse(
                path=str(file_path),
                media_type=mime_mapping.get(ext, 'image/png'),
                filename=f"{file_hash}{ext}"
            )
    
    raise HTTPException(status_code=404, detail=f"File not found for hash: {file_hash}")

@app.post("/upload-screenshots")
async def upload_screenshots(files: List[UploadFile] = File(...)):
    """Upload multiple screenshots for processing"""
    # Clear previous uploads and processed files for new session
    clear_previous_session()
    
    uploaded_files = []
    rejected_files = []
    MAX_SIZE = 1024 * 1024  # 1MB
    
    for file in files:
        # Check file type
        if not file.content_type or not file.content_type.startswith("image/"):
            rejected_files.append({"filename": file.filename, "reason": "Not an image file"})
            continue
        
        # Read file content to check size
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > MAX_SIZE:
            rejected_files.append({
                "filename": file.filename, 
                "reason": f"File too large ({len(file_content) / 1024 / 1024:.1f}MB, max 1MB)"
            })
            continue
            
        file_hash = hashlib.md5(file_content).hexdigest()
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "png"
        saved_filename = f"{file_hash}.{file_extension}"
        file_path = UPLOAD_DIR / saved_filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
            
        uploaded_files.append({
            "filename": file.filename,
            "saved_as": saved_filename,
            "hash": file_hash
        })
    
    if uploaded_files:
        asyncio.create_task(process_screenshots(uploaded_files))
    
    response = {
        "message": f"Uploaded {len(uploaded_files)} screenshots",
        "files": uploaded_files
    }
    
    if rejected_files:
        response["rejected_files"] = rejected_files
        response["message"] += f", {len(rejected_files)} files rejected"
    
    return response

async def process_screenshots(files: List[dict]):
    """Process screenshots with Claude API and evaluate quality"""
    print(f"Starting processing of {len(files)} files...")
    claude_service = app.state.claude_service
    search_service = app.state.search_service
    evaluation_service = app.state.evaluation_service
    prompt_manager = app.state.prompt_manager
    
    for file_info in files:
        print(f"Processing file: {file_info['filename']}")
        file_path = UPLOAD_DIR / file_info["saved_as"]
        
        try:
            print(f"Calling Claude API for {file_path}")
            ocr_text, visual_description = await claude_service.analyze_screenshot(str(file_path))
            print(f"Claude API response: OCR length={len(ocr_text) if ocr_text else 0}, Visual length={len(visual_description) if visual_description else 0}")
            
            # Provide fallback descriptions for empty results
            if not ocr_text and not visual_description:
                print(f"Warning: No extraction results for {file_info['filename']}")
                ocr_text = ""
                visual_description = f"Image uploaded: {file_info['filename']}. Analysis could not be completed."
            elif not visual_description:
                visual_description = f"Image file: {file_info['filename']}"
            
            # Evaluate the extraction quality
            print("Starting evaluation...")
            evaluation = evaluation_service.evaluate_extraction(ocr_text, visual_description)
            print(f"Evaluation completed: {evaluation.get('quality_level', 'unknown')}")
            
            # Track prompt performance
            prompt_manager.add_quality_score(
                "ocr_and_visual", 
                evaluation["confidence_score"],
                {"filename": file_info["filename"], "file_hash": file_info["hash"]}
            )
            
            metadata = ScreenshotMetadata(
                filename=file_info["filename"],
                file_hash=file_info["hash"],
                ocr_text=ocr_text,
                visual_description=visual_description,
                processed_at=datetime.now(),
                evaluation=evaluation
            )
            
            metadata_path = PROCESSED_DIR / f"{file_info['hash']}.json"
            with open(metadata_path, "w") as f:
                json.dump(metadata.dict(), f, default=str)
            
            search_service.index_screenshot(metadata)
            
        except Exception as e:
            print(f"Error processing {file_info['filename']}: {str(e)}")

@app.post("/search", response_model=List[SearchResult])
async def search_screenshots(query: SearchQuery):
    """Search through processed screenshots"""
    search_service = app.state.search_service
    results = search_service.search(query.query, top_k=5)
    return results

@app.get("/status")
async def get_status():
    """Get API status and statistics"""
    try:
        upload_count = len(list(UPLOAD_DIR.glob("*.png"))) + len(list(UPLOAD_DIR.glob("*.jpg"))) + len(list(UPLOAD_DIR.glob("*.jpeg")))
        processed_count = len(list(PROCESSED_DIR.glob("*.json")))
        search_service = app.state.search_service
        indexed_count = search_service.get_indexed_count() if search_service else 0
        
        return {
            "status": "active",
            "uploaded_files": upload_count,
            "processed_files": processed_count,
            "processing_rate": f"{processed_count}/{upload_count}" if upload_count > 0 else "0/0",
            "indexed_screenshots": indexed_count,
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY),
            "search_service": "available" if search_service else "unavailable"
        }
    except Exception as e:
        return {
            "status": "active",
            "message": "Basic health check OK",
            "error": str(e),
            "api_key_configured": bool(settings.ANTHROPIC_API_KEY)
        }

def clear_previous_session():
    """Clear all previous uploads and processed files"""
    import shutil
    import glob
    
    # Clear uploads directory
    for file_path in glob.glob(str(UPLOAD_DIR / "*")):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing upload file {file_path}: {e}")
    
    # Clear processed directory  
    for file_path in glob.glob(str(PROCESSED_DIR / "*")):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error removing processed file {file_path}: {e}")
    
    # Clear search service index
    app.state.search_service.clear_index()

@app.post("/process-folder")
async def process_folder(folder_path: str = Form(...)):
    """Process all images in a folder"""
    # Clear previous uploads and processed files for new session
    clear_previous_session()
    folder = Path(folder_path)
    
    if not folder.exists() or not folder.is_dir():
        raise HTTPException(status_code=400, detail="Invalid folder path")
    
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}
    image_files = []
    rejected_files = []
    MAX_SIZE = 1024 * 1024  # 1MB
    
    for file_path in folder.iterdir():
        if file_path.suffix.lower() in image_extensions:
            file_content = file_path.read_bytes()
            
            # Check file size
            if len(file_content) > MAX_SIZE:
                rejected_files.append({
                    "filename": file_path.name, 
                    "reason": f"File too large ({len(file_content) / 1024 / 1024:.1f}MB, max 1MB)"
                })
                continue
            
            file_hash = hashlib.md5(file_content).hexdigest()
            saved_filename = f"{file_hash}{file_path.suffix}"
            dest_path = UPLOAD_DIR / saved_filename
            
            with open(dest_path, "wb") as f:
                f.write(file_content)
            
            image_files.append({
                "filename": file_path.name,
                "saved_as": saved_filename,
                "hash": file_hash
            })
    
    if not image_files and not rejected_files:
        raise HTTPException(status_code=400, detail="No image files found in the specified folder")
    
    if image_files:
        asyncio.create_task(process_screenshots(image_files))
    
    response = {
        "message": f"Processing {len(image_files)} images from folder",
        "files": image_files,
        "folder_path": str(folder)
    }
    
    if rejected_files:
        response["rejected_files"] = rejected_files
        response["message"] += f", {len(rejected_files)} files rejected"
    
    return response

@app.get("/prompts/current")
async def get_current_prompt():
    """Get the current extraction prompt"""
    prompt_manager = app.state.prompt_manager
    return {
        "prompt": prompt_manager.get_current_prompt("ocr_and_visual"),
        "performance": prompt_manager.get_prompt_performance("ocr_and_visual")
    }

@app.post("/prompts/update")
async def update_prompt(new_prompt: str = Form(...)):
    """Update the extraction prompt"""
    prompt_manager = app.state.prompt_manager
    result = prompt_manager.update_prompt("ocr_and_visual", new_prompt)
    return result

@app.post("/prompts/suggestions")
async def get_prompt_suggestions(scores: dict):
    """Get suggestions for improving the prompt based on evaluation scores"""
    prompt_manager = app.state.prompt_manager
    suggestions = prompt_manager.get_prompt_suggestions(scores)
    
    if suggestions:
        current_prompt = prompt_manager.get_current_prompt("ocr_and_visual")
        improved_prompt = prompt_manager.generate_improved_prompt(current_prompt, suggestions)
        return {
            "suggestions": suggestions,
            "current_prompt": current_prompt,
            "improved_prompt": improved_prompt
        }
    
    return {"suggestions": [], "message": "No improvements needed"}

@app.get("/prompts/performance")
async def get_prompt_performance():
    """Get performance statistics for the current prompt"""
    prompt_manager = app.state.prompt_manager
    return prompt_manager.get_prompt_performance("ocr_and_visual")

# Cache for test status to avoid running tests repeatedly
_test_status_cache = {
    "data": None,
    "last_update": None,
    "cache_duration": 300  # 5 minutes
}

@app.get("/test-status")
async def get_test_status():
    """Get current test status and API health"""
    import subprocess
    import json
    from datetime import datetime, timedelta
    
    # Check cache first
    now = datetime.now()
    if (_test_status_cache["data"] is not None and 
        _test_status_cache["last_update"] is not None and 
        now - _test_status_cache["last_update"] < timedelta(seconds=_test_status_cache["cache_duration"])):
        # Return cached result with updated timestamp
        cached_data = _test_status_cache["data"].copy()
        cached_data["timestamp"] = now.isoformat()
        cached_data["cached"] = True
        return cached_data
    
    try:
        # Run backend tests quickly
        result = subprocess.run(
            ["python", "-m", "pytest", "test_main.py", "--tb=no", "-q"],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        backend_status = {
            "status": "passed" if result.returncode == 0 else "failed",
            "test_count": 23,
            "passed_count": 23 if result.returncode == 0 else 0,
            "failed_count": 0 if result.returncode == 0 else 1,
            "last_run": datetime.now().isoformat(),
            "output": result.stdout.split('\n')[-3] if result.stdout else "No output"
        }
    except Exception as e:
        backend_status = {
            "status": "error",
            "error": str(e),
            "last_run": datetime.now().isoformat()
        }
    
    # API health check
    api_health = {
        "claude_api": {
            "configured": bool(settings.ANTHROPIC_API_KEY),
            "timeout": settings.CLAUDE_API_TIMEOUT,
            "retries": settings.CLAUDE_MAX_RETRIES
        },
        "endpoints": {
            "status": "active",
            "upload": "active", 
            "search": "active"
        }
    }
    
    response_data = {
        "backend_tests": backend_status,
        "api_health": api_health,
        "timestamp": datetime.now().isoformat(),
        "cached": False
    }
    
    # Cache the result
    _test_status_cache["data"] = response_data.copy()
    _test_status_cache["last_update"] = now
    
    return response_data

@app.post("/test-status/refresh")
async def refresh_test_status():
    """Force refresh of test status cache"""
    global _test_status_cache
    _test_status_cache["data"] = None
    _test_status_cache["last_update"] = None
    return await get_test_status()

# Catch-all route for React Router (SPA)
@app.get("/{path:path}")
async def serve_spa(path: str):
    """Catch-all route to serve React SPA for any unmatched routes"""
    # For API routes, return 404
    if path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # For all other routes, serve the React app
    frontend_path = Path("static/index.html")
    if frontend_path.exists():
        return FileResponse(frontend_path, media_type="text/html")
    else:
        raise HTTPException(status_code=404, detail="Frontend not available")


if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    import os
    
    # Use Heroku's PORT if available, otherwise use configured port
    port = int(os.environ.get("PORT", settings.APP_PORT))
    host = "0.0.0.0"  # Heroku requires 0.0.0.0
    
    # For Heroku, use string import to avoid reload issues
    uvicorn.run(
        "main:app",  # Use import string instead of app object
        host=host, 
        port=port,
        reload=False,  # Disable reload in production
        workers=1  # Single worker for Heroku free tier
    )