# Visual Memory Search - AI Screenshot Explorer

## 🚀 **Application Status - Ready for Testing!**

### ✅ **Backend Server** 
- **URL**: http://localhost:8000
- **Status**: Active and running
- **API Key**: Configured ✅
- **Features**: All endpoints operational
- **Documentation**: http://localhost:8000/docs

### ✅ **Frontend Server**
- **URL**: http://localhost:5173  
- **Status**: Active and running
- **UI**: Modern interface ready
- **Features**: All components loaded

## 🎯 **Project Overview**

Visual Memory Search is an AI-powered application that allows you to search through your screenshot history using natural language queries. It can find content based on both text (OCR) and visual elements with a stunning modern interface.

### **Core Requirements Met:**
- ✅ Accept folder of screenshots
- ✅ Extract both OCR text AND visual descriptions  
- ✅ Handle queries like "error message about auth" OR "screenshot with blue button"
- ✅ Return top 5 matches with confidence scores

## ✨ **Enhanced Features Implemented:**

### 🎯 **All New Requirements:**

#### ✅ **JSON Response Format**
- Updated Claude service to request and parse JSON responses
- Fallback to original text parsing for compatibility
- Improved prompt for structured data extraction

#### ✅ **Modern UI with Image Carousel**
- **ImageCarousel Component**: Horizontal scrolling with pagination
- **Smooth navigation**: Left/right arrows with seamless transitions
- **Responsive design**: 1-4 columns depending on screen size
- **Page indicators**: Dot navigation for easy page jumping

#### ✅ **Hover Flip Cards**
- **3D flip animations** on hover using CSS transforms
- **Front side**: Displays screenshot with rank badge, quality indicator, match type
- **Back side**: Shows detailed OCR text, visual description, and evaluation scores
- **Smooth transitions** with elegant glow effects

#### ✅ **Clean Evaluation Display**
- **Per-field scoring** displayed on flip cards without clutter
- **Quality indicators** with color-coded badges (Excellent → Very Poor)
- **Progress bars** for individual criteria scores
- **Confidence percentages** for each evaluation component

#### ✅ **Advanced Prompt Management**
- **Editable prompts** with version tracking
- **Performance analytics** showing score trends
- **Intelligent suggestions** based on evaluation feedback
- **Auto-generated improvements** for low-scoring criteria
- **Real-time prompt testing** and rollback capabilities

### 🚀 **Enhanced Features:**

#### **Modern Design Elements:**
- Dark gradient backgrounds with glassmorphic effects
- Smooth hover animations and transitions
- Card-based layout with elegant spacing
- Custom scrollbars matching the theme
- Glow effects on hover interactions

#### **Comprehensive Quality Assessment:**
- 6-criteria evaluation rubric with weighted scoring
- Detailed reasoning for each score
- Actionable improvement suggestions
- Performance tracking over time
- Quality trend analysis

#### **Modern UX Patterns:**
- Carousel navigation with keyboard support
- Progressive disclosure for detailed information
- Loading states and error handling
- Responsive design for all screen sizes
- Accessibility-friendly interactions

## 📊 **Technical Architecture:**

### **Backend Enhancements:**
- **JSON-first API responses** with text fallback
- **Static file serving** for screenshot images
- **Prompt management system** with versioning
- **Performance tracking** for continuous improvement
- **RESTful endpoints** for all new features

### **Frontend Architecture:**
- **Component composition** for reusable UI elements
- **3D CSS transforms** for flip card animations
- **TypeScript interfaces** for type safety
- **Responsive grid layouts** for optimal viewing
- **State management** for interactive features

## 🔧 **Quick Start**

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation & Setup

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
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎯 **How to Test:**

1. **Open the application**: Navigate to http://localhost:5173
2. **Upload screenshots**: Use the drag-and-drop area or browse files
3. **Search**: Enter natural language queries like "error message" or "blue button"
4. **Explore results**: Hover over cards to see flip animations
5. **Manage prompts**: Click "Improve Prompts" to access advanced settings

## 📊 **What to Expect:**

- **Modern interface** with dark gradients and smooth animations
- **Comprehensive evaluation** of extraction quality with scores
- **Interactive flip cards** showing detailed information on hover
- **Intelligent suggestions** for improving extraction prompts
- **Real-time feedback** on processing and search results

## 🎨 **UI/UX Features:**

### **Modern Interface:**
- **Image Carousel**: Horizontal scrolling with smooth pagination
- **Flip Cards**: 3D hover animations revealing detailed information
- **Quality Indicators**: Color-coded badges showing extraction quality
- **Dark Theme**: Elegant gradients with glassmorphic effects
- **Responsive Design**: Optimized for all screen sizes

### **Advanced Evaluation System:**
- **6-Criteria Scoring**: Text completeness, accuracy, visual coverage, layout, colors, searchability
- **Performance Tracking**: Monitor prompt effectiveness over time
- **Improvement Suggestions**: AI-powered recommendations for better results
- **Quality Trends**: Visual analytics showing extraction quality patterns

## 🔧 **API Endpoints**

- `GET /` - API status
- `POST /upload-screenshots` - Upload multiple screenshots
- `POST /search` - Search through processed screenshots
- `POST /process-folder` - Process all images in a folder
- `GET /prompts/current` - Get current extraction prompt
- `POST /prompts/update` - Update extraction prompt
- `POST /prompts/suggestions` - Get improvement suggestions
- `GET /status` - System status and metrics
- `GET /docs` - Interactive API documentation

## 🏗️ **Architecture**

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **AI**: Claude 3.5 Sonnet for OCR and visual analysis
- **Search**: Vector embeddings with semantic similarity
- **Storage**: Local filesystem + SQLite for metadata

## 🎯 **Evaluation Rubric**

The system evaluates extraction quality across 6 criteria:

1. **Text Completeness (25%)** - How completely OCR captures visible text
2. **Text Accuracy (20%)** - Accuracy without errors or gibberish
3. **Visual Element Coverage (20%)** - Quality of UI component descriptions
4. **Layout Description (15%)** - Spatial relationships and structure
5. **Color & Style Recognition (10%)** - Accuracy of visual style identification
6. **Searchability (10%)** - How well extraction enables effective searching

## 🔒 **Configuration**

The Anthropic API key is configured in `backend/settings.local.json`:
```json
{
  "ANTHROPIC_API_KEY": "your-api-key-here"
}
```

## 🚀 **Performance**

- **Async processing** of screenshots
- **Vector embeddings** cached for fast search
- **Batch upload** support
- **Real-time evaluation** feedback
- **Prompt performance** tracking

---

The application is now fully operational with all the requested features implemented! 🎉

You can start testing by uploading some screenshots and experiencing the modern interface in action with the comprehensive evaluation system and advanced prompt management capabilities.