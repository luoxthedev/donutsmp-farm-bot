// Client side script for the web dashboard. Handles selecting
// between multiple bots, displaying chat logs, updating status
// indicators and sending messages back to the server.

const socket = io();
const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const usernameEl = document.getElementById('username');
const skinEl = document.getElementById('skin');
const botSelect = document.getElementById('botSelect');
const statusIndicator = document.getElementById('status-indicator');

// Maintain a log of messages per bot so switching between bots
// preserves the conversation history.
const messageLogs = {};

// Store the latest status for all bots. Each entry is keyed by
// username and contains online state plus allowWebChat.
let botsStatus = {};

// The bot currently selected in the drop down. When undefined the
// first available bot will be selected automatically.
let selectedBot = null;

// When the server broadcasts bot statuses we update our drop down
// options, pick a selected bot (if none yet) and refresh the UI.
socket.on('bots', data => {
  botsStatus = data || {};
  updateSelectOptions();
  if (!selectedBot || !botsStatus[selectedBot]) {
    selectedBot = Object.keys(botsStatus)[0] || null;
  }
  updateUI();
});

// Append incoming chat messages to the appropriate log and, if
// currently selected, to the visible chat area. All chat events
// carry the name of the bot they originated from.
socket.on('chat', ({ username, message }) => {
  if (!messageLogs[username]) {
    messageLogs[username] = [];
  }
  messageLogs[username].push({ username, message });
  if (username === selectedBot) {
    appendChat(username, message);
  }
});

// When the user selects a different bot from the drop down we
// update our selectedBot variable and redraw the chat history and
// status display.
botSelect.addEventListener('change', () => {
  selectedBot = botSelect.value;
  renderChat();
  updateUI();
});

// Handle the enter key for sending chat messages. We emit the
// message along with the currently selected bot's username so the
// server knows which bot should speak. If web chat is disabled
// nothing will happen.
inputEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (!selectedBot) return;
  if (inputEl.style.display === 'none') return;
  const msg = inputEl.value.trim();
  if (!msg) return;
  socket.emit('sendMessage', { username: selectedBot, message: msg });
  inputEl.value = '';
});

/**
 * Update the drop down options based on the current botsStatus.
 * Preserve the previously selected value if still valid.
 */
function updateSelectOptions() {
  botSelect.innerHTML = '';
  for (const [id, status] of Object.entries(botsStatus)) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = status.username || id;
    botSelect.appendChild(option);
  }
  if (selectedBot && botsStatus[selectedBot]) {
    botSelect.value = selectedBot;
  }
}

/**
 * Update the displayed username, skin, status indicator and
 * visibility of the input box based on the selected bot. If no
 * bot is selected the fields are cleared.
 */
function updateUI() {
  if (!selectedBot || !botsStatus[selectedBot]) {
    usernameEl.textContent = 'No bot';
    skinEl.src = '';
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
    inputEl.style.display = 'none';
    return;
  }
  const status = botsStatus[selectedBot];
  usernameEl.textContent = status.username || selectedBot;
  skinEl.src = `https://mc-heads.net/avatar/${status.username || selectedBot}/64`;
  if (status.online) {
    statusIndicator.classList.remove('offline');
    statusIndicator.classList.add('online');
  } else {
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
  }
  // Hide or show the message input depending on whether web chat is
  // enabled in the server configuration.
  if (status.allowWebChat === false) {
    inputEl.style.display = 'none';
  } else {
    inputEl.style.display = 'block';
  }
}

/**
 * Render the full chat history for the currently selected bot. This
 * clears the chat element and appends all messages stored for
 * selectedBot. Called when switching between bots.
 */
function renderChat() {
  chatEl.innerHTML = '';
  const logs = messageLogs[selectedBot] || [];
  for (const entry of logs) {
    const div = document.createElement('div');
    div.textContent = `<${entry.username}> ${entry.message}`;
    chatEl.appendChild(div);
  }
  chatEl.scrollTop = chatEl.scrollHeight;
}

/**
 * Append a single chat line to the visible chat area. Performs
 * auto‑scrolling if the user is already at the bottom of the
 * chat.
 */
function appendChat(username, message) {
  const shouldScroll = chatEl.scrollTop + chatEl.clientHeight >= chatEl.scrollHeight - 50;
  const div = document.createElement('div');
  div.textContent = `<${username}> ${message}`;
  chatEl.appendChild(div);
  if (shouldScroll) {
    chatEl.scrollTop = chatEl.scrollHeight;
  }
}