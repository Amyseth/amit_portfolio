const initCodeNCraftAgent = () => {
  // Inject the chat widget HTML structure into the body
  const chatWidgetHTML = `
    <div id="codencraft-chat-widget">
      <!-- Chat Window -->
      <div id="chat-window">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar"><i class="fa-solid fa-robot"></i></div>
            <div>
              <h3>CodeNCraft Assistant</h3>
              <span id="chat-sub-status">Online</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="voice-call-btn" id="voice-call-btn" title="Start Voice Call" style="background: none; border: none; color: #a0aec0; cursor: pointer; font-size: 1.1rem; transition: color 0.2s;"><i class="fa-solid fa-phone"></i></button>
            <button class="close-chat-btn" id="close-chat-btn" style="background: none; border: none; color: #a0aec0; cursor: pointer; font-size: 1.1rem; transition: color 0.2s;"><i class="fa-solid fa-times"></i></button>
          </div>
        </div>
        <div class="chat-body" id="chat-body">
          <div class="chat-message ai">
            Hi! I am Amit's AI Assistant. Are you looking to build a custom SaaS product or website for your business?
          </div>
        </div>

        <!-- Voice Call Overlay -->
        <div id="voice-call-overlay" style="display: none; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 20px; background: rgba(13, 17, 28, 0.98); position: absolute; top: 66px; bottom: 0; left: 0; right: 0; z-index: 10;">
          <div class="voice-visualizer-container" style="margin-bottom: 25px; position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
            <div id="voice-status-ring" class="voice-ring"></div>
            <div id="voice-avatar" class="voice-avatar-large">
              <i class="fa-solid fa-microphone-slash text-slate-500"></i>
            </div>
          </div>
          <div id="voice-status-text" style="color: #a0aec0; font-size: 0.75rem; text-transform: uppercase; tracking-wider; margin-bottom: 15px; font-weight: 600; letter-spacing: 0.1em;">Call Closed</div>
          <div id="voice-transcript" style="color: #e2e8f0; font-size: 0.85rem; text-align: center; max-height: 80px; overflow-y: auto; padding: 0 10px; line-height: 1.4; font-style: italic; margin-bottom: 30px; width: 100%;">
            Click the phone icon to start a voice call.
          </div>
          <button id="end-voice-btn" class="end-call-btn" style="width: 50px; height: 50px; border-radius: 50%; background: #e53e3e; border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; box-shadow: 0 5px 15px rgba(229, 62, 62, 0.4); transition: transform 0.2s;"><i class="fa-solid fa-phone-slash"></i></button>
        </div>

        <div class="chat-footer">
          <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
          <button id="chat-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
      
      <!-- Toggle Button -->
      <button id="chat-toggle-btn" aria-label="Open Chat">
        <i class="fa-solid fa-message"></i>
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatWidgetHTML);

  // Selectors
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const closeBtn = document.getElementById("close-chat-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send-btn");

  const voiceCallBtn = document.getElementById("voice-call-btn");
  const voiceCallOverlay = document.getElementById("voice-call-overlay");
  const voiceStatusRing = document.getElementById("voice-status-ring");
  const voiceAvatar = document.getElementById("voice-avatar");
  const voiceStatusText = document.getElementById("voice-status-text");
  const voiceTranscript = document.getElementById("voice-transcript");
  const endVoiceBtn = document.getElementById("end-voice-btn");

  // API URL - Update this when deployed
  const TEXT_API_URL = "https://sales-agent-backend-bryr.onrender.com/chat";
  
  // Chat History Array
  let chatHistory = [];

  // Voice States
  let audioContext = null;
  let ws = null;
  let recognition = null;
  let activeSources = [];
  let nextPlayTime = 0;
  let isFinishedStreaming = false;
  let callActive = false;
  let currentAiTranscript = "";

  // Base64 helper
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Toggle chat window
  const toggleChat = () => {
    chatWindow.classList.toggle("active");
    if (chatWindow.classList.contains("active")) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
      chatInput.focus();
    } else {
      toggleBtn.innerHTML = '<i class="fa-solid fa-message"></i>';
      if (callActive) endVoiceCall();
    }
  };

  toggleBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("active");
    toggleBtn.innerHTML = '<i class="fa-solid fa-message"></i>';
    if (callActive) endVoiceCall();
  });

  // Append a text message to the UI
  const appendMessage = (role, text) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // Show typing indicator
  const showTyping = () => {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message ai typing-indicator-container";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // Remove typing indicator
  const hideTyping = () => {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  };

  // Handle sending text message
  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });

    showTyping();

    try {
      const response = await fetch(TEXT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: chatHistory }),
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      const aiResponse = data.response;

      hideTyping();
      appendMessage("ai", aiResponse);
      chatHistory.push({ role: "model", content: aiResponse });
    } catch (error) {
      console.error("Chat error:", error);
      hideTyping();
      appendMessage("ai", "Sorry, my server is currently offline for maintenance. Please email aseth230@gmail.com directly!");
      chatHistory.pop();
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // ==========================================
  // VOICE AGENT WIDGET LOGIC
  // ==========================================

  const startVoiceCall = () => {
    if (callActive) return;
    
    callActive = true;
    isFinishedStreaming = false;
    currentAiTranscript = "";
    voiceTranscript.textContent = "Connecting to voice server...";
    voiceCallOverlay.style.display = "flex";
    voiceCallBtn.style.color = "#22c55e"; // Green color when active
    updateVoiceStatus("connecting");

    // Initialize AudioContext
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    } catch (e) {
      voiceTranscript.textContent = "Error: Web Audio API not supported.";
      updateVoiceStatus("idle");
      callActive = false;
      return;
    }

    // Connect to WebSocket Server (port 8000)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:8000/ws/voice-call`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Voice WS connected");
      ws.send(JSON.stringify({ type: "start" }));
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "ai-transcript-chunk":
          updateVoiceStatus("speaking");
          stopSpeechRecognition();
          currentAiTranscript += data.text;
          voiceTranscript.textContent = currentAiTranscript;
          break;

        case "audio-chunk":
          updateVoiceStatus("speaking");
          await playAudioChunk(data.audio);
          break;

        case "audio-end":
          isFinishedStreaming = true;
          currentAiTranscript = "";
          if (activeSources.length === 0) {
            updateVoiceStatus("listening");
            startSpeechRecognition();
          }
          break;

        case "interrupted":
          stopAllAudio();
          currentAiTranscript = "";
          updateVoiceStatus("listening");
          startSpeechRecognition();
          break;

        case "error":
          console.error("Server voice error:", data.message);
          voiceTranscript.textContent = "Error: " + data.message;
          endVoiceCall();
          break;
      }
    };

    ws.onerror = (e) => {
      console.error("Voice WS error:", e);
      voiceTranscript.textContent = "WebSocket connection failed. Run backend server on port 8000.";
      endVoiceCall();
    };

    ws.onclose = () => {
      console.log("Voice WS closed");
      endVoiceCall();
    };

    startSpeechRecognition();
  };

  const endVoiceCall = () => {
    if (!callActive) return;
    callActive = false;
    voiceCallOverlay.style.display = "none";
    voiceCallBtn.style.color = "#a0aec0";
    updateVoiceStatus("idle");
    stopAllAudio();
    stopSpeechRecognition();

    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      ws = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  };

  const updateVoiceStatus = (status) => {
    voiceStatusRing.className = "voice-ring";
    
    if (status === "connecting") {
      voiceStatusText.textContent = "Connecting";
      voiceStatusRing.classList.add("ring-connecting");
      voiceAvatar.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="color: #818cf8; font-size: 2rem;"></i>';
    } else if (status === "listening") {
      voiceStatusText.textContent = "Listening";
      voiceStatusRing.classList.add("ring-listening");
      voiceAvatar.innerHTML = '<i class="fa-solid fa-microphone" style="color: #34d399; font-size: 2rem;"></i>';
    } else if (status === "thinking") {
      voiceStatusText.textContent = "Thinking";
      voiceStatusRing.classList.add("ring-thinking");
      voiceAvatar.innerHTML = '<i class="fa-solid fa-ellipsis" style="color: #fbbf24; font-size: 2rem;" class="animate-bounce"></i>';
    } else if (status === "speaking") {
      voiceStatusText.textContent = "Speaking";
      voiceStatusRing.classList.add("ring-speaking");
      voiceAvatar.innerHTML = '<i class="fa-solid fa-volume-high" style="color: #38bdf8; font-size: 2rem;"></i>';
    } else {
      voiceStatusText.textContent = "Call Closed";
      voiceAvatar.innerHTML = '<i class="fa-solid fa-microphone-slash" style="color: #64748b; font-size: 2rem;"></i>';
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceTranscript.textContent = "Voice input is not supported in this browser. Please use Chrome/Edge.";
      return;
    }

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const segment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += segment;
          } else {
            interimTranscript += segment;
          }
        }

        // Interruption
        if ((interimTranscript.trim() || finalTranscript.trim()) && 
            (voiceStatusText.textContent.toLowerCase() === "speaking" || 
             voiceStatusText.textContent.toLowerCase() === "thinking")) {
          console.log("Interrupted by user speech");
          updateVoiceStatus("listening");
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "interrupt" }));
          }
          stopAllAudio();
        }

        if (finalTranscript.trim()) {
          const text = finalTranscript.trim();
          voiceTranscript.textContent = "You: " + text;
          updateVoiceStatus("thinking");
          stopSpeechRecognition();
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "user-message", text }));
          }
        }
      };

      recognition.onend = () => {
        if (callActive && voiceStatusText.textContent.toLowerCase() === "listening") {
          try { recognition.start(); } catch(e) {}
        }
      };
    }

    try {
      recognition.start();
    } catch(e) {}
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
  };

  const stopAllAudio = () => {
    activeSources.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSources = [];
    nextPlayTime = 0;
  };

  const playAudioChunk = async (base64Audio) => {
    if (!audioContext) return;

    try {
      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      if (!callActive) return;

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      const now = audioContext.currentTime;
      let playTime = nextPlayTime;
      if (playTime < now) {
        playTime = now + 0.05;
      }

      source.start(playTime);
      activeSources.push(source);
      nextPlayTime = playTime + audioBuffer.duration;

      source.onended = () => {
        activeSources = activeSources.filter(s => s !== source);
        if (activeSources.length === 0 && isFinishedStreaming) {
          updateVoiceStatus("listening");
          startSpeechRecognition();
        }
      };
    } catch(e) {
      console.error("Error playing voice segment:", e);
    }
  };

  // Toggle voice call on phone icon click
  voiceCallBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (callActive) {
      endVoiceCall();
    } else {
      startVoiceCall();
    }
  });

  endVoiceBtn.addEventListener("click", endVoiceCall);
};

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initCodeNCraftAgent);
} else {
  initCodeNCraftAgent();
}
