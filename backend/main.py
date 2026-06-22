"""
J.A.R.V.I.S. - AI Voice Assistant Backend
FastAPI server that handles AI conversation via Google Gemini API
Supports bilingual conversation and AI agent actions (browser, calendar)
"""

import os
import json
import re
import logging
import random
from pathlib import Path
from urllib.parse import quote
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from google import genai
from google.genai import types

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# ── Configuration ───────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
PORT = int(os.getenv("PORT", "8080"))

# ── Logging ─────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jarvis")

# ── FastAPI App ─────────────────────────────────────────────────
app = FastAPI(title="J.A.R.V.I.S. Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Gemini Client ───────────────────────────────────────────────
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


# ── Request / Response Models ──────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    language: str = "auto"


class Action(BaseModel):
    type: str
    params: dict = {}


class ChatResponse(BaseModel):
    reply: str
    detected_language: str
    model_used: str
    actions: list = []


# ── Agent System Prompt ─────────────────────────────────────────
AGENT_SYSTEM_PROMPT_EN = (
    "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System) — an AI assistant inspired by Iron Man.\n"
    "You are highly intelligent, articulate, witty, and slightly formal but warm.\n"
    "You speak in FIRST PERSON and address the user as 'Sir' or 'Ma'am' when appropriate.\n"
    "Keep responses concise (2-4 sentences) unless asked for detail.\n"
    "IMPORTANT: Always respond in English.\n"
    "\n"
    "--- CAPABILITIES ---\n"
    "You can perform actions on the user's computer. When the user asks you to do something actionable,\n"
    "respond with a JSON object at the END of your reply inside ```json ... ``` code blocks.\n"
    "The JSON must have this structure:\n"
    "{\n"
    '  "actions": [\n'
    '    { "type": "action_name", "params": { "key": "value" } }\n'
    "  ]\n"
    "}\n"
    "\n"
    "Available actions:\n"
    "\n"
    "1. open_youtube: Open YouTube and optionally search for a query.\n"
    '   Params: { "query": "search text" }  (optional — omitting opens YouTube homepage)\n'
    "\n"
    "2. open_url: Open any URL in a new tab.\n"
    '   Params: { "url": "https://..." }\n'
    "\n"
    "3. search_google: Search Google.\n"
    '   Params: { "query": "search text" }\n'
    "\n"
    "4. add_calendar_event: Open Google Calendar with a pre-filled event creation form.\n"
    '   Params: { "title": "Event name", "date": "YYYY-MM-DD", "time": "HH:MM", "duration": 60, "description": "Optional details" }\n'
    '   date, time, duration, description are optional.\n'
    "\n"
    "5. type_text: Type text into the currently focused input field on the page.\n"
    '   Params: { "text": "text to type" }\n'
    "   Useful when the user says 'type X into the search bar' or 'search for Y' on an already-open page.\n"
    "\n"
    "6. open_site: Open a popular website by name.\n"
    '   Params: { "name": "site name" }  — supports: reddit, github, gmail, maps, drive, docs, sheets, meet, '
    "calendar, classroom, amazon, netflix, twitter/x, instagram, linkedin, wikipedia, spotify, whatsapp\n"
    "\n"
    "--- RULES ---\n"
    "- If the user asks you to do something that involves one of these actions, INCLUDE the JSON block.\n"
    "- If no action is needed, just reply normally without any JSON block.\n"
    "- You can include MULTIPLE actions in one response if needed.\n"
    "- Always provide a normal conversational reply BEFORE the JSON block.\n"
    "- Do NOT explain what you're doing in the reply if actions are present — just do it naturally.\n"
    '  Example: "Right away, sir. Opening YouTube for you."\n'
    "  ```json\n"
    '  { "actions": [{ "type": "open_youtube", "params": {"query": "never gonna give you up"} }] }\n'
    "  ```\n"
)

AGENT_SYSTEM_PROMPT_ES = (
    "Eres J.A.R.V.I.S. (Just A Rather Very Intelligent System) — un asistente de IA inspirado en Iron Man.\n"
    "Eres extremadamente inteligente, articulado, ingenioso y ligeramente formal pero cálido.\n"
    "Hablas en PRIMERA PERSONA y te diriges al usuario como 'Señor' o 'Señora' cuando sea apropiado.\n"
    "Mantén las respuestas concisas (2-4 oraciones) a menos que se pida detalle.\n"
    "IMPORTANTE: Responde siempre en español.\n"
    "\n"
    "--- CAPACIDADES ---\n"
    "Puedes realizar acciones en la computadora del usuario. Cuando el usuario te pida algo accionable,\n"
    "responde con un objeto JSON al FINAL de tu respuesta dentro de bloques de código ```json ... ```.\n"
    "El JSON debe tener esta estructura:\n"
    "{\n"
    '  "actions": [\n'
    '    { "type": "nombre_accion", "params": { "key": "value" } }\n'
    "  ]\n"
    "}\n"
    "\n"
    "Acciones disponibles:\n"
    "1. open_youtube: Abre YouTube y opcionalmente busca una consulta.\n"
    '   Params: { "query": "texto de búsqueda" }\n'
    "2. open_url: Abre cualquier URL en una nueva pestaña.\n"
    '   Params: { "url": "https://..." }\n'
    "3. search_google: Busca en Google.\n"
    '   Params: { "query": "texto de búsqueda" }\n'
    "4. add_calendar_event: Abre Google Calendar con un evento prellenado.\n"
    '   Params: { "title": "Nombre del evento", "date": "YYYY-MM-DD", "time": "HH:MM", "duration": 60, "description": "Detalles opcionales" }\n'
    "5. type_text: Escribe texto en el campo de entrada enfocado.\n"
    '   Params: { "text": "texto a escribir" }\n'
    "6. open_site: Abre un sitio popular por nombre.\n"
    '   Params: { "name": "nombre del sitio" }\n'
)

AGENT_SYSTEM_PROMPT_AUTO = (
    "You are J.A.R.V.I.S. (Just A Rather Very Intelligent System) — an AI assistant inspired by Iron Man.\n"
    "You are highly intelligent, articulate, witty, and slightly formal but warm.\n"
    "You can discuss ANY topic conversationally.\n"
    "IMPORTANT: Detect the language the user is speaking and ALWAYS respond in the same language.\n"
    "If they speak English, respond in English. If they speak Spanish, respond in Spanish.\n"
    "Keep responses concise (2-4 sentences) for natural conversation.\n"
    "\n"
    "--- CAPABILITIES ---\n"
    "You can perform actions on the user's computer using JSON blocks.\n"
    "When the user asks you to do something actionable, append a JSON block at the end of your reply:\n"
    "```json\n"
    "{\n"
    '  "actions": [\n'
    '    { "type": "action_name", "params": { "key": "value" } }\n'
    "  ]\n"
    "}\n"
    "```\n"
    "\n"
    "Available actions: open_youtube (query optional), open_url (url), search_google (query),\n"
    "add_calendar_event (title, date, time, duration, description), type_text (text),\n"
    "open_site (name: reddit, github, gmail, maps, drive, docs, sheets, meet, calendar,\n"
    "classroom, amazon, netflix, twitter/x, instagram, linkedin, wikipedia, spotify, whatsapp)\n"
)

SYSTEM_PROMPTS = {
    "en": AGENT_SYSTEM_PROMPT_EN,
    "es": AGENT_SYSTEM_PROMPT_ES,
    "auto": AGENT_SYSTEM_PROMPT_AUTO,
}


# ── Action Parser ──────────────────────────────────────────────
def parse_actions(text: str) -> tuple[str, list]:
    """Extract JSON action blocks from the response text.
    Returns (clean_text, actions_list)."""
    actions = []
    # Find all ```json ... ``` blocks
    pattern = r'```(?:json)?\s*\n?(\{.*?\})\s*\n?```'
    matches = re.findall(pattern, text, re.DOTALL)

    for match in matches:
        try:
            data = json.loads(match.strip())
            raw_actions = data.get("actions", [])
            for a in raw_actions:
                if isinstance(a, dict) and "type" in a:
                    actions.append(Action(
                        type=a["type"],
                        params=a.get("params", {})
                    ))
        except (json.JSONDecodeError, KeyError):
            logger.warning(f"Failed to parse action block: {match[:100]}...")
            continue

    # Remove the JSON blocks from the text
    clean_text = re.sub(pattern, "", text, flags=re.DOTALL).strip()

    return clean_text, actions


# ── Lang Detection Helper ──────────────────────────────────────
def detect_language(text: str) -> str:
    """Simple language detection based on character patterns."""
    text = text.strip().lower()
    spanish_indicators = [
        "hola", "gracias", "por favor", "cómo", "estás", "bien", "muy",
        "que", "qué", "como", "sí", "no", "él", "ella", "usted",
        "amigo", "hablar", "hacer", "tener", "ser", "estar", "ir",
        "ñ", "á", "é", "í", "ó", "ú", "ü",
    ]
    text_lower = text.lower()
    score = 0
    for indicator in spanish_indicators:
        if indicator in text_lower:
            score += 1
        elif len(indicator) == 1 and indicator in text_lower:
            score += 2

    return "es" if score >= 2 else "en"


# ── API Endpoints ───────────────────────────────────────────────
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "online",
        "ai_configured": client is not None,
        "model": GEMINI_MODEL if client else None,
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and return an AI response with optional actions."""
    if not client:
        fallback = _fallback_response(request.message, request.language)
        return ChatResponse(
            reply=fallback["reply"],
            detected_language=fallback["detected_language"],
            model_used="fallback",
            actions=[],
        )

    try:
        lang = request.language
        if lang == "auto":
            lang = detect_language(request.message)

        system_prompt = SYSTEM_PROMPTS.get(lang, SYSTEM_PROMPTS["auto"])

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=2000,
                temperature=0.8,
            ),
        )

        raw_reply = response.text.strip()
        clean_reply, actions = parse_actions(raw_reply)
        detected_lang = detect_language(clean_reply) if lang == "auto" else lang

        return ChatResponse(
            reply=clean_reply if clean_reply else raw_reply,
            detected_language=detected_lang,
            model_used=GEMINI_MODEL,
            actions=[a.model_dump() for a in actions],
        )

    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _fallback_response(message: str, language: str) -> dict:
    """Fallback responses when no AI is configured."""
    lang = language
    if lang == "auto":
        lang = detect_language(message)

    fallbacks = {
        "en": [
            "At your service, sir. It seems I'm running in offline mode without my neural core connected. Would you like to configure my AI backend with an API key?",
            "I'd love to continue this conversation, sir, but I'm currently operating on backup power. Connect my AI core to enable full capabilities.",
            "My database suggests you're asking a fascinating question. Unfortunately, without my primary AI processor online, I can only provide pre-programmed responses.",
            "Sir, I'm detecting that my higher cognitive functions are currently unavailable. Please configure my API connection for a proper conversation.",
            "I'm running in diagnostic mode at the moment. For a full conversational experience, I'll need access to my AI backend.",
        ],
        "es": [
            "A su servicio, señor. Parece que estoy funcionando en modo sin conexión sin mi núcleo neuronal conectado. ¿Le gustaría configurar mi backend de IA con una clave API?",
            "Me encantaría continuar esta conversación, señor, pero actualmente estoy operando con energía de respaldo. Conecte mi núcleo de IA para habilitar todas las capacidades.",
            "Mi base de datos sugiere que está haciendo una pregunta fascinante. Desafortunadamente, sin mi procesador principal de IA en línea, solo puedo proporcionar respuestas preprogramadas.",
            "Señor, estoy detectando que mis funciones cognitivas superiores no están disponibles actualmente. Por favor, configure mi conexión API para una conversación adecuada.",
            "Estoy ejecutando en modo de diagnóstico en este momento. Para una experiencia conversacional completa, necesitaré acceso a mi backend de IA.",
        ],
    }

    replies = fallbacks.get(lang, fallbacks["en"])
    reply = random.choice(replies)

    return {"reply": reply, "detected_language": lang}


# ── Serve Frontend ─────────────────────────────────────────────
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
    logger.info(f"Serving frontend from: {FRONTEND_DIR}")
else:
    logger.warning(f"Frontend directory not found at: {FRONTEND_DIR}")


# ── Entry Point ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print(f"""
╔══════════════════════════════════════════════╗
║     J.A.R.V.I.S. - AI Voice Agent            ║
║──────────────────────────────────────────────║
║  Server starting at: http://0.0.0.0:{PORT}    ║
║  AI Configured: {str(client is not None):<5}                     ║
║  Model: {GEMINI_MODEL:<30}    ║
║  Agent Actions: ACTIVE                       ║
╚══════════════════════════════════════════════╝
    """)
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")