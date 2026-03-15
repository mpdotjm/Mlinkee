// ============================================================
// Linkee AI Chatbot Widget
// Floating chat bubble with conversation history
// ============================================================

(function () {
  const API_BASE = '/api';

  // --- Inject chatbot HTML ---
  const chatHTML = `
    <div id="linkee-chatbot">
      <button id="chatbot-toggle" title="Chat with Linkee AI">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="chatbot-badge" style="display:none;">1</span>
      </button>
      <div id="chatbot-window" class="chatbot-hidden">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">✨</div>
            <div>
              <strong>Linkee AI</strong>
              <span class="chatbot-status">Online</span>
            </div>
          </div>
          <button id="chatbot-close" title="Close chat">✕</button>
        </div>
        <div id="chatbot-messages">
          <div class="chatbot-msg bot">
            <div class="chatbot-msg-content">
              Hi! 👋 I'm Linkee AI. I can help you find services, post jobs, or answer any questions about the platform. What can I help you with?
            </div>
          </div>
        </div>
        <div id="chatbot-typing" class="chatbot-typing" style="display:none;">
          <div class="chatbot-msg bot">
            <div class="chatbot-msg-content">
              <span class="typing-dots"><span></span><span></span><span></span></span>
            </div>
          </div>
        </div>
        <form id="chatbot-form">
          <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off" />
          <button type="submit" id="chatbot-send" title="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    </div>
  `;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Don't inject on login page
    if (window.location.pathname.includes('login.html')) return;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    const toggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messagesEl = document.getElementById('chatbot-messages');
    const typingEl = document.getElementById('chatbot-typing');

    let history = [];

    toggle.addEventListener('click', () => {
      chatWindow.classList.toggle('chatbot-hidden');
      if (!chatWindow.classList.contains('chatbot-hidden')) {
        input.focus();
        scrollToBottom();
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.add('chatbot-hidden');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = input.value.trim();
      if (!msg) return;

      // Add user message
      appendMessage('user', msg);
      history.push({ role: 'user', content: msg });
      input.value = '';
      input.focus();

      // Show typing indicator
      typingEl.style.display = 'block';
      scrollToBottom();

      try {
        const res = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history })
        });

        const data = await res.json();
        typingEl.style.display = 'none';

        if (res.ok) {
          appendMessage('bot', data.reply);
          history.push({ role: 'assistant', content: data.reply });
        } else {
          appendMessage('bot', data.error || 'Sorry, something went wrong. Please try again.');
        }
      } catch (err) {
        typingEl.style.display = 'none';
        appendMessage('bot', 'Could not reach the AI service. Is the server running?');
      }

      scrollToBottom();
    });

    function appendMessage(role, text) {
      const div = document.createElement('div');
      div.className = `chatbot-msg ${role}`;
      div.innerHTML = `<div class="chatbot-msg-content">${escapeHTML(text)}</div>`;
      messagesEl.appendChild(div);
      scrollToBottom();
    }

    function scrollToBottom() {
      setTimeout(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 50);
    }

    function escapeHTML(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    }
  }
})();
