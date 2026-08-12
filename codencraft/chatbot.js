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
              <span>Online</span>
            </div>
          </div>
          <button class="close-chat-btn" id="close-chat-btn"><i class="fa-solid fa-times"></i></button>
        </div>
        <div class="chat-body" id="chat-body">
          <div class="chat-message ai">
            Hi! I am Amit's AI Assistant. Are you looking to build a custom SaaS product or website for your business?
          </div>
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

  // API URL - Update this when deployed to Render/Heroku
  const API_URL = "https://sales-agent-backend-bryr.onrender.com/chat";

  // Chat History Array
  let chatHistory = [];

  // Toggle chat window
  const toggleChat = () => {
    chatWindow.classList.toggle("active");
    if (chatWindow.classList.contains("active")) {
      toggleBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
      chatInput.focus();
    } else {
      toggleBtn.innerHTML = '<i class="fa-solid fa-message"></i>';
    }
  };

  toggleBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("active");
    toggleBtn.innerHTML = '<i class="fa-solid fa-message"></i>';
  });

  // Append a message to the UI
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

  // Handle sending message
  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    // Disable input while processing
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message to UI and history
    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });

    showTyping();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      appendMessage(
        "ai",
        "Sorry, my server is currently offline for maintenance. Please email aseth230@gmail.com directly!",
      );
      // Remove the failed user message from history so it doesn't break future attempts
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
};

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", initCodeNCraftAgent);
} else {
  initCodeNCraftAgent();
}
