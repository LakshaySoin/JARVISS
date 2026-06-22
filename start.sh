#!/bin/bash
# ═══════════════════════════════════════════════
#  J.A.R.V.I.S. — AI Voice Assistant Launcher
# ═══════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     Starting J.A.R.V.I.S. System        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check for .env file
if [ ! -f ".env" ]; then
    echo "[!] No .env file found. Creating from template..."
    cp backend/.env.example .env
    echo "[!] Please edit .env and add your GEMINI_API_KEY"
fi

# Check Python availability
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is required but not found."
    exit 1
fi

# Use virtual environment if it exists
if [ -d "venv" ]; then
    echo "[*] Using virtual environment..."
    source venv/bin/activate
    PIP_CMD="pip"
    PYTHON_CMD="python"
else
    PIP_CMD="pip3"
    PYTHON_CMD="python3"
fi

# Install dependencies if needed
echo "[*] Checking dependencies..."
$PIP_CMD install -q fastapi uvicorn google-genai python-dotenv 2>/dev/null

echo ""
echo "[✓] Starting server..."
echo "[✓] Open http://localhost:8080 in Chrome or Edge"
echo "[✓] Press and hold the microphone button to speak"
echo "[✓] Press Space bar as a keyboard shortcut"
echo ""
echo "  ┌─────────────────────────────┐"
echo "  │  Language Support:          │"
echo "  │  EN - Auto-detect English   │"
echo "  │  ES - Auto-detect Spanish   │"
echo "  │  🌐 Auto - Best for mixed   │"
echo "  └─────────────────────────────┘"
echo ""

# Start the server
$PYTHON_CMD backend/main.py
