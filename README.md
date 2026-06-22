# J.A.R.V.I.S.S. — AI Voice Agent

> **J**ust **A** **R**ather **V**ery **I**ntelligent (**S**panish) **S**ystem

An AI-powered voice assistant inspired by Iron Man's J.A.R.V.I.S. This application combines speech recognition, Google Gemini AI, text-to-speech, and browser automation into a single conversational agent that can talk to you, answer questions, and perform actions on your computer.

---

## ✨ Features

### 🎙️ Voice & Chat Interface
- **Push-to-talk** — Hold the microphone button (or press the **Space bar**) and speak naturally
- **Text chat** — Type messages directly in the input field and press Enter
- **Bilingual** — Speaks English and Spanish; auto-detects which language you're using
- **Custom TTS voice** — Choose from your system's available voices in the dropdown selector

### 🧠 AI Conversation (Google Gemini)
- Powered by **Google Gemini** (`gemini-2.0-flash` or `gemini-3.5-flash`)
- J.A.R.V.I.S. persona — witty, articulate, slightly formal, addresses you as "Sir" or "Ma'am"
- Natural conversational flow with concise responses

### 🤖 Agent Actions
J.A.R.V.I.S. can perform actions on your computer when you ask. Just say:

| Action | Example Command | What It Does |
|--------|----------------|--------------|
| **Open YouTube** | *"Open YouTube and search for jazz music"* | Opens YouTube in a new tab, optionally with a search query |
| **Open URL** | *"Go to github.com"* | Opens any URL in a new tab |
| **Search Google** | *"Search Google for the weather tomorrow"* | Opens Google search results |
| **Open Site** | *"Open my Gmail"* | Opens popular sites: Gmail, Maps, Drive, Docs, Calendar, Reddit, GitHub, Amazon, Netflix, Spotify, and more |
| **Add Calendar Event** | *"Add a calendar event for Friday at 2pm called 'Project Review'"* | Opens Google Calendar with a pre-filled event creation form |
| **Type Text** | *"Type 'hello world' into the search bar"* | Types text into whatever input field is currently focused on the page |

### 🎨 Futuristic UI
- Iron Man HUD-inspired design with cyan glow effects
- Animated arc reactor visualizer
- Particle network background
- Rotating orbital rings
- Status indicators (STANDBY, LISTENING, THINKING, SPEAKING)

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML, CSS, JavaScript |
| **Backend** | Python + FastAPI |
| **AI** | Google Gemini API (`google-genai` SDK) |
| **Speech-to-Text** | Web Speech API (browser-native) |
| **Text-to-Speech** | Web Speech Synthesis API (browser-native) |
| **Server** | Uvicorn |

---

## 📋 Prerequisites

- **Python 3.10+** installed on your system
- **A Google Gemini API key** (free tier available)
- **Chrome or Edge** browser (for best speech recognition support)
- **Git** (to clone the repository)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/LakshaySoin/CS61BL.git
cd CS61BL
```

### 2. Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Get API key"**
3. Create a new API key (free tier gives you plenty of requests)
4. Copy the key

### 3. Configure the API key

Open the `.env` file in the project root and add your key:

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash
PORT=8080
```

> **Note:** The `.env` file is already pre-configured. Just replace the placeholder with your actual key.

### 4. Install dependencies

```bash
pip install -r backend/requirements.txt
```

This installs: `fastapi`, `uvicorn`, `google-genai`, `python-dotenv`

### 5. Start the server

```bash
python3 backend/main.py
```

Or use the launcher script:

```bash
bash start.sh
```

### 6. Open the app

Open **Chrome** or **Edge** and navigate to:

```
http://localhost:8080
```

---

## 🎮 How to Use

### Voice Commands
1. **Press and hold** the microphone button (or hold the **Space bar**)
2. **Speak** your question or command
3. **Release** the button
4. J.A.R.V.I.S. will respond verbally and in the chat

### Text Chat
1. **Type** your message in the text input field
2. Press **Enter** or click **Send**
3. J.A.R.V.I.S. will respond in the chat and speak the reply

### Language Selection
- Click **🌐 Auto** for automatic language detection
- Click **🇬🇧 EN** to force English responses
- Click **🇪🇸 ES** to force Spanish responses

### Voice Selection
- Use the **voice dropdown** at the bottom right to choose which TTS voice J.A.R.V.I.S. uses
- Voices are grouped by language
- The default system voice is selected automatically

### Agent Actions
Just ask naturally! Examples:

> *"Open YouTube and search for lofi hip hop"*
> *"Add a calendar event for tomorrow at 3pm called 'Team Standup'"*
> *"Search Google for the latest news on AI"*
> *"Open my Google Drive"*
> *"Go to github.com"*

---

## 📁 Project Structure

```
JARVISS/
├── .env                    # Environment variables (API key, model, port)
├── start.sh                # Launcher script
├── README.md               # This file
├── backend/
│   ├── .env                # Backend-specific env (API key)
│   ├── .env.example        # Template for .env
│   ├── main.py             # FastAPI server + Gemini integration + agent logic
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── index.html          # Main HTML page
    ├── style.css           # All styling (HUD theme)
    ├── app.js              # All JavaScript (voice, chat, agent actions)
    └── favicon.svg         # Browser tab icon
```

---

## ⚙️ Configuration

### Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Your Google Gemini API key |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model to use (e.g., `gemini-2.0-flash`, `gemini-3.5-flash`) |
| `PORT` | `8080` | Port for the web server |

### Changing the AI Model

Edit `.env` and set a different model:

```env
GEMINI_MODEL=gemini-3.5-flash
```

Available models depend on your API key's access level. Check [Google AI documentation](https://ai.google.dev/gemini-api/docs/models) for the latest list.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **"INITIALIZING" stuck on screen** | Hard refresh the page (`Cmd+Shift+R` or `Ctrl+F5`) |
| **Speech recognition not working** | Use Chrome or Edge — Firefox and Safari have limited support |
| **"AI Configured: False"** | Check that your `GEMINI_API_KEY` is set correctly in `.env` |
| **429 / quota errors** | You've hit the free tier limit. Wait a minute or enable billing in Google Cloud Console |
| **503 / high demand** | The model is temporarily overloaded. Try again in a few seconds |
| **Port 8080 already in use** | Kill the existing process: `lsof -ti:8080 \| xargs kill -9` |

---

## 🧪 Development

### Running in development mode

The server auto-reloads when you make changes:

```bash
uvicorn backend.main:app --reload --port 8080
```

### Adding new agent actions

1. **Backend** (`backend/main.py`):
   - Add the action to the system prompts (`AGENT_SYSTEM_PROMPT_EN`, etc.)
   - No code changes needed — the action parser handles any action type dynamically

2. **Frontend** (`frontend/app.js`):
   - Add a new `case` in the `executeActions` switch statement
   - Create a handler function (e.g., `executeMyAction(params)`)
   - The handler receives `params` from the AI's JSON block

---

## 📄 License

This project is for educational and personal use. The J.A.R.V.I.S. name and concept are the property of Marvel Comics / Disney.

---

## 🙏 Acknowledgments

- Inspired by **Tony Stark's J.A.R.V.I.S.** from the Marvel Cinematic Universe
- Powered by **Google Gemini API**
- Built with **FastAPI** and vanilla web technologies
