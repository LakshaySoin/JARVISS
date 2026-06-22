/* ═══════════════════════════════════════════════
   J.A.R.V.I.S. — Voice App Logic
   ═══════════════════════════════════════════════ */

const STATE = { IDLE: 'idle', LISTENING: 'listening', THINKING: 'thinking', SPEAKING: 'speaking' };
let currentState = STATE.IDLE;
let selectedLanguage = 'auto';
let selectedVoiceURI = null;

const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const centerStatus = document.getElementById('centerStatus');
const centerLang = document.getElementById('centerLang');
const langBadge = document.getElementById('langBadge');
const pttButton = document.getElementById('pttButton');
const controlLabel = document.getElementById('controlLabel');
const conversationArea = document.getElementById('conversationArea');
const typingIndicator = document.getElementById('typingIndicator');
const vizBars = document.getElementById('vizBars');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const voiceSelect = document.getElementById('voiceSelect');

// ── Visualizer Bars ──────────────────────────────────────────
const NUM_BARS = 60;
for (let i = 0; i < NUM_BARS; i++) {
  const bar = document.createElement('div');
  bar.className = 'viz-bar';
  const angle = (i / NUM_BARS) * 360;
  bar.style.transform = 'translate(-50%, 0) rotate(' + angle + 'deg) translateY(-50%)';
  bar.style.transformOrigin = 'bottom center';
  vizBars.appendChild(bar);
}
const bars = vizBars.querySelectorAll('.viz-bar');

// ── State ────────────────────────────────────────────────────
function setState(state) {
  currentState = state;
  statusDot.className = 'status-dot ' + state;
  switch (state) {
    case STATE.IDLE:
      statusLabel.textContent = 'STANDBY';
      centerStatus.textContent = 'STANDBY';
      pttButton.className = 'ptt-button';
      controlLabel.textContent = 'HOLD TO SPEAK';
      animateBarsIdle();
      break;
    case STATE.LISTENING:
      statusLabel.textContent = 'LISTENING';
      centerStatus.textContent = 'LISTENING';
      pttButton.className = 'ptt-button recording';
      controlLabel.textContent = 'SPEAK NOW';
      animateBarsListening();
      break;
    case STATE.THINKING:
      statusLabel.textContent = 'PROCESSING';
      centerStatus.textContent = 'THINKING';
      pttButton.className = 'ptt-button';
      controlLabel.textContent = 'AWAITING RESPONSE';
      animateBarsThinking();
      break;
    case STATE.SPEAKING:
      statusLabel.textContent = 'SPEAKING';
      centerStatus.textContent = 'SPEAKING';
      pttButton.className = 'ptt-button';
      controlLabel.textContent = 'JARVIS TALKING';
      animateBarsSpeaking();
      break;
  }
}

// ── Bar Animations ───────────────────────────────────────────
let animFrame = null;
function animateBarsIdle() {
  if (animFrame) cancelAnimationFrame(animFrame);
  let phase = 0;
  function frame() {
    phase += 0.02;
    bars.forEach(function(bar, i) {
      var h = 4 + Math.sin(phase + i * 0.3) * 3;
      bar.style.height = h + 'px';
      bar.style.opacity = 0.3 + Math.sin(phase + i * 0.3) * 0.15;
      bar.classList.remove('active');
    });
    animFrame = requestAnimationFrame(frame);
  }
  frame();
}

function animateBarsListening() {
  if (animFrame) cancelAnimationFrame(animFrame);
  let phase = 0;
  function frame() {
    phase += 0.08;
    bars.forEach(function(bar, i) {
      var v = Math.sin(phase + i * 0.5);
      var h = 6 + Math.abs(v) * 25;
      bar.style.height = h + 'px';
      bar.style.opacity = 0.5 + Math.abs(v) * 0.5;
      if (Math.abs(v) > 0.6) bar.classList.add('active');
      else bar.classList.remove('active');
    });
    animFrame = requestAnimationFrame(frame);
  }
  frame();
}

function animateBarsThinking() {
  if (animFrame) cancelAnimationFrame(animFrame);
  let phase = 0;
  function frame() {
    phase += 0.04;
    bars.forEach(function(bar, i) {
      var v = Math.sin(phase + i * 0.4 + Math.sin(phase * 0.5) * 1.5);
      var h = 5 + Math.abs(v) * 12;
      bar.style.height = h + 'px';
      bar.style.opacity = 0.3 + Math.abs(v) * 0.4;
      bar.classList.remove('active');
    });
    animFrame = requestAnimationFrame(frame);
  }
  frame();
}

function animateBarsSpeaking() {
  if (animFrame) cancelAnimationFrame(animFrame);
  let phase = 0;
  function frame() {
    phase += 0.06;
    bars.forEach(function(bar, i) {
      var v = Math.sin(phase + i * 0.35);
      var mod = Math.sin(phase * 0.7) * 0.5 + 0.5;
      var h = 5 + Math.abs(v) * 20 * (0.5 + mod * 0.5);
      bar.style.height = h + 'px';
      bar.style.opacity = 0.4 + Math.abs(v) * 0.6;
      if (Math.abs(v) > 0.5) bar.classList.add('active');
      else bar.classList.remove('active');
    });
    animFrame = requestAnimationFrame(frame);
  }
  frame();
}

// ── Particles ────────────────────────────────────────────────
function initParticles() {
  var canvas = document.getElementById('particle-canvas');
  var ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  var particles = [];
  var count = 80;
  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
      a: Math.random() * 0.5 + 0.1
    });
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, ' + p.a + ')';
      ctx.fill();
    });
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + (0.08 * (1 - dist / 140)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}
initParticles();

// ── Language Toggle ──────────────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.lang-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    selectedLanguage = btn.dataset.lang;
    var display = selectedLanguage === 'auto' ? 'AUTO' : selectedLanguage.toUpperCase();
    langBadge.textContent = '\uD83C\uDF10 ' + display;
    centerLang.textContent = '[ ' + display + ' ]';
  });
});

// ── Speech Recognition ───────────────────────────────────────
var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
var recognition = null;
var isRecognitionSupported = !!SpeechRecognition;

if (isRecognitionSupported) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = function() { setState(STATE.LISTENING); };

  recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;
    console.log('[STT] "' + transcript + '" (' + (confidence * 100).toFixed(0) + '%)');
    addMessage('user', transcript, 'YOU');
    setState(STATE.THINKING);
    sendToBackend(transcript);
  };

  recognition.onerror = function(event) {
    console.error('[STT Error]', event.error);
    if (event.error === 'no-speech') { setState(STATE.IDLE); return; }
    setState(STATE.IDLE);
    addMessage('jarvis', "I didn't quite catch that, sir. Could you try again? (" + event.error + ")", 'J.A.R.V.I.S');
  };

  recognition.onend = function() {
    if (currentState === STATE.LISTENING) setState(STATE.IDLE);
  };
}

// ── PTT Button ───────────────────────────────────────────────
var isPressing = false;
pttButton.addEventListener('mousedown', startListening);
pttButton.addEventListener('mouseup', stopListening);
pttButton.addEventListener('mouseleave', function() { if (isPressing) stopListening(); });
pttButton.addEventListener('touchstart', function(e) { e.preventDefault(); startListening(); });
pttButton.addEventListener('touchend', function(e) { e.preventDefault(); stopListening(); });

document.addEventListener('keydown', function(e) {
  if (e.code === 'Space' && !e.repeat && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault();
    if (!isPressing) startListening();
  }
});
document.addEventListener('keyup', function(e) {
  if (e.code === 'Space' && isPressing) { e.preventDefault(); stopListening(); }
});

function startListening() {
  if (!isRecognitionSupported) {
    addMessage('jarvis', 'Your browser does not support speech recognition. Please use Chrome or Edge.', 'J.A.R.V.I.S');
    return;
  }
  if (currentState === STATE.SPEAKING) window.speechSynthesis.cancel();
  if (currentState === STATE.THINKING || currentState === STATE.LISTENING) return;
  isPressing = true;
  try {
    if (selectedLanguage === 'en') recognition.lang = 'en-US';
    else if (selectedLanguage === 'es') recognition.lang = 'es-ES';
    else recognition.lang = 'en-US';
    recognition.start();
  } catch (e) { console.error(e); setState(STATE.IDLE); }
}

function stopListening() {
  isPressing = false;
  if (recognition && currentState === STATE.LISTENING) {
    try { recognition.stop(); } catch (e) {}
  }
}

// ── Messages ─────────────────────────────────────────────────
function addMessage(role, text, label) {
  var div = document.createElement('div');
  div.className = 'message ' + role;
  div.innerHTML = '<div class="msg-label">' + label + '</div><div class="msg-text">' + text + '</div>';
  conversationArea.appendChild(div);
  conversationArea.scrollTop = conversationArea.scrollHeight;
}

// ── Backend API ──────────────────────────────────────────────
async function sendToBackend(text) {
  typingIndicator.classList.add('active');
  try {
    var response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language: selectedLanguage })
    });
    if (!response.ok) {
      var err = await response.json();
      throw new Error(err.detail || 'Backend error');
    }
    var data = await response.json();
    typingIndicator.classList.remove('active');
    addMessage('jarvis', data.reply, 'J.A.R.V.I.S');
    var langDisplay = data.detected_language === 'en' ? 'ENGLISH' : 'ESPA\u00d1OL';
    centerLang.textContent = '[ ' + langDisplay + ' ]';
    speakText(data.reply, data.detected_language);
    // Execute any actions returned by the AI agent
    if (data.actions && data.actions.length > 0) {
      executeActions(data.actions);
    }
  } catch (error) {
    console.error('[API Error]', error);
    typingIndicator.classList.remove('active');
    addMessage('jarvis', 'Connection issue: ' + error.message, 'J.A.R.V.I.S');
    setState(STATE.IDLE);
  }
}

// ── Action Executor (AI Agent) ─────────────────────────────────
function executeActions(actions) {
  for (var i = 0; i < actions.length; i++) {
    var action = actions[i];
    console.log('[Agent] Executing action:', action.type, action.params);
    switch (action.type) {
      case 'open_url':
        executeOpenUrl(action.params);
        break;
      case 'open_youtube':
        executeOpenYoutube(action.params);
        break;
      case 'search_google':
        executeSearchGoogle(action.params);
        break;
      case 'open_site':
        executeOpenSite(action.params);
        break;
      case 'add_calendar_event':
        executeCalendarEvent(action.params);
        break;
      case 'type_text':
        executeTypeText(action.params);
        break;
      default:
        console.warn('[Agent] Unknown action type:', action.type);
    }
  }
}

function executeOpenUrl(params) {
  var url = params.url;
  if (!url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  window.open(url, '_blank');
  addMessage('jarvis', 'Opening ' + url + ', sir.', 'J.A.R.V.I.S (Agent)');
}

function executeOpenYoutube(params) {
  var query = params.query;
  var url;
  if (query) {
    url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
  } else {
    url = 'https://www.youtube.com';
  }
  window.open(url, '_blank');
  if (query) {
    addMessage('jarvis', 'Opening YouTube and searching for "' + query + '", sir.', 'J.A.R.V.I.S (Agent)');
  } else {
    addMessage('jarvis', 'Opening YouTube, sir.', 'J.A.R.V.I.S (Agent)');
  }
}

function executeSearchGoogle(params) {
  var query = params.query;
  if (!query) return;
  var url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
  window.open(url, '_blank');
}

function executeOpenSite(params) {
  var name = params.name ? params.name.toLowerCase().trim() : '';
  var urlMap = {
    'reddit': 'https://www.reddit.com',
    'github': 'https://github.com',
    'gmail': 'https://mail.google.com',
    'maps': 'https://maps.google.com',
    'drive': 'https://drive.google.com',
    'docs': 'https://docs.google.com',
    'sheets': 'https://sheets.google.com',
    'meet': 'https://meet.google.com',
    'calendar': 'https://calendar.google.com',
    'classroom': 'https://classroom.google.com',
    'amazon': 'https://www.amazon.com',
    'netflix': 'https://www.netflix.com',
    'twitter': 'https://twitter.com',
    'x': 'https://twitter.com',
    'instagram': 'https://www.instagram.com',
    'linkedin': 'https://www.linkedin.com',
    'wikipedia': 'https://www.wikipedia.org',
    'spotify': 'https://open.spotify.com',
    'whatsapp': 'https://web.whatsapp.com',
  };
  var url = urlMap[name] || 'https://www.google.com/search?q=' + encodeURIComponent(name);
  window.open(url, '_blank');
}

function executeCalendarEvent(params) {
  var title = params.title || 'Event';
  var date = params.date || '';
  var time = params.time || '';
  var duration = params.duration || 60;
  var description = params.description || '';

  // Build Google Calendar event creation URL
  // Format: https://calendar.google.com/calendar/render?action=TEMPLATE&text=TITLE&dates=START/END&details=DESC
  var startDate = '';
  if (date) {
    var startStr = date.replace(/-/g, '');
    if (time) {
      startStr += 'T' + time.replace(/:/g, '') + '00';
    } else {
      startStr += 'T090000'; // default 9 AM
    }
    // Calculate end time
    var startMoment = new Date(date + 'T' + (time || '09:00'));
    var endMoment = new Date(startMoment.getTime() + duration * 60000);
    var endStr = endMoment.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    startDate = startStr + '/' + endStr;
  }

  var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(title) +
    (startDate ? '&dates=' + startDate : '') +
    (description ? '&details=' + encodeURIComponent(description) : '');

  window.open(url, '_blank');
}

function executeTypeText(params) {
  var text = params.text;
  if (!text) return;
  // Try to find the active/focused input element and type into it
  var activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
    // Type the text character by character into the field
    var start = activeEl.selectionStart || 0;
    var end = activeEl.selectionEnd || 0;
    var currentVal = activeEl.value || activeEl.textContent || '';
    var newVal = currentVal.substring(0, start) + text + currentVal.substring(end);
    if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
      activeEl.value = newVal;
    } else {
      activeEl.textContent = newVal;
    }
    // Move cursor to end of inserted text
    var newPos = start + text.length;
    activeEl.setSelectionRange(newPos, newPos);
    activeEl.focus();
    // Dispatch input event
    var inputEvent = new Event('input', { bubbles: true });
    activeEl.dispatchEvent(inputEvent);
    addMessage('jarvis', 'Typing "' + text + '" into the field, sir.', 'J.A.R.V.I.S (Agent)');
  } else {
    // Fallback: show a message with the text to type
    addMessage('jarvis', 'I would type "' + text + '", but no input field is focused. Please click on a text field first, sir.', 'J.A.R.V.I.S (Agent)');
  }
}

// ── Chat Input (Text Chat) ────────────────────────────────────
chatSendBtn.addEventListener('click', function() {
  sendChatMessage();
});

chatInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendChatMessage();
  }
});

function sendChatMessage() {
  var text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  addMessage('user', text, 'YOU');
  setState(STATE.THINKING);
  sendToBackend(text);
}

// ── Voice Selector ────────────────────────────────────────────
function populateVoiceList() {
  var voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  if (voices.length === 0) {
    var opt = document.createElement('option');
    opt.textContent = '-- No voices available --';
    opt.disabled = true;
    voiceSelect.appendChild(opt);
    return;
  }
  // Group voices by language
  var grouped = {};
  for (var i = 0; i < voices.length; i++) {
    var v = voices[i];
    var lang = v.lang || 'unknown';
    if (!grouped[lang]) grouped[lang] = [];
    grouped[lang].push(v);
  }
  var sortedLangs = Object.keys(grouped).sort();
  for (var l = 0; l < sortedLangs.length; l++) {
    var langKey = sortedLangs[l];
    var groupLabel = langKey.toUpperCase();
    if (langKey.startsWith('en')) groupLabel = '\ud83c\uddec\ud83c\udde7 English (' + langKey + ')';
    else if (langKey.startsWith('es')) groupLabel = '\ud83c\uddea\ud83c\uddf8 Spanish (' + langKey + ')';
    var optgroup = document.createElement('optgroup');
    optgroup.label = groupLabel;
    for (var j = 0; j < grouped[langKey].length; j++) {
      var v = grouped[langKey][j];
      var opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = v.name + (v.default ? ' [Default]' : '');
      if (v.default) {
        opt.selected = true;
        selectedVoiceURI = v.voiceURI;
      }
      optgroup.appendChild(opt);
    }
    voiceSelect.appendChild(optgroup);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

voiceSelect.addEventListener('change', function() {
  selectedVoiceURI = voiceSelect.value;
  console.log('[Voice] Selected:', selectedVoiceURI);
});

// ── TTS (Text-to-Speech) ─────────────────────────────────────
function speakText(text, lang) {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = (lang === 'es') ? 'es-ES' : 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 0.9;
  utterance.volume = 1.0;

  // Use the user-selected voice if it matches the target language
  if (selectedVoiceURI) {
    var voices = window.speechSynthesis.getVoices();
    var targetLang = lang === 'es' ? 'es' : 'en';
    // If the selected voice matches the language, use it; otherwise fallback
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].voiceURI === selectedVoiceURI && voices[i].lang.startsWith(targetLang)) {
        utterance.voice = voices[i];
        break;
      }
    }
    // If we didn't find a match by URI, search for any voice with that URI
    if (!utterance.voice) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceURI === selectedVoiceURI) {
          utterance.voice = voices[i];
          break;
        }
      }
    }
  }

  // Fallback: auto-select best voice for language
  if (!utterance.voice) {
    var voices = window.speechSynthesis.getVoices();
    var targetLang = lang === 'es' ? 'es' : 'en';
    var preferred = [];
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (v.lang.startsWith(targetLang) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Neural') || v.name.includes('Samantha') || v.name.includes('Daniel'))) {
        preferred.push(v);
      }
    }
    var fallback = [];
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang.startsWith(targetLang)) fallback.push(voices[i]);
    }
    if (preferred.length > 0) utterance.voice = preferred[0];
    else if (fallback.length > 0) utterance.voice = fallback[0];
  }

  utterance.onstart = function() { setState(STATE.SPEAKING); };
  utterance.onend = function() { setState(STATE.IDLE); };
  utterance.onerror = function(e) { console.error('[TTS Error]', e); setState(STATE.IDLE); };
  window.speechSynthesis.speak(utterance);
}

// ── Init ──────────────────────────────────────────────────────
setState(STATE.IDLE);
centerLang.textContent = '[ AUTO ]';
centerStatus.textContent = 'READY';

console.log(
  '%c\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n' +
  '\u2551       J.A.R.V.I.S.  v2.0            \u2551\n' +
  '\u2551  Speech: ' + (isRecognitionSupported ? 'READY' : 'NOT SUPPORTED') + '           \u2551\n' +
  '\u2551  Languages: EN + ES                 \u2551\n' +
  '\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d',
  'color: #00f0ff; font-family: monospace;'
);

setTimeout(function() { centerStatus.textContent = 'READY'; }, 1000);