const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const serverConfig = require('./config/bot.config');
const logger = require('./utils/logger');
const { getConfig } = require('./utils/configLoader');
const { getBotStatus } = require('./utils/status');

// Plugins
const antiAfk = require('./plugins/antiAfk');
const randomMove = require('./plugins/randomMove');
const chatLogger = require('./plugins/chatLogger');
const autoReconnect = require('./plugins/autoReconnect');

// Discord integration
const startDiscordBot = require('./discord/bot');

// Store all active bots keyed by their username. This object will be
// passed into the Discord integration so it can build a live embed.
const bots = {};

// Create the web server and socket.io instance. The port is
// configured via config/config.json and can be reloaded at runtime.
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the web/public folder
app.use(express.static(__dirname + '/web/public'));

// Start the HTTP server on the configured port. Because the port
// can change when config/config.json is edited, we read it on start up. To
// change the port you must restart the node process.
if (getConfig().web && getConfig().web.enabled) {
  server.listen(getConfig().web.port, () => {
    logger.success(`Web dashboard running on port ${getConfig().web.port}`);
  });
}

/**
 * Broadcast the status of all bots to connected web clients. Each
 * status includes whether the bot is online plus health, food,
 * dimension and position if available. The allowWebChat flag is
 * copied from the configuration so the client knows whether to
 * display the message input.
 */
function broadcastBotsStatus() {
  const cfg = getConfig();
  if (!cfg.web || !cfg.web.enabled) return;
  const statuses = {};
  for (const name of Object.keys(bots)) {
    const status = getBotStatus(bots[name], cfg);
    status.allowWebChat = cfg.web && cfg.web.allowWebChat;
    statuses[name] = status;
  }
  io.emit('bots', statuses);
}

/**
 * Create and initialise a bot for the given account. All event
 * handlers are registered here including plugins, auto respawn,
 * auto reconnect and broadcasting of status changes and chat.
 *
 * @param {object} accountConfig An entry from config/config.json.accounts
 */
function createBot(accountConfig) {
  const cfgBot = serverConfig.server;
  logger.info(`Starting bot for ${accountConfig.username}…`);
  const bot = mineflayer.createBot({
    host: cfgBot.host,
    port: cfgBot.port,
    version: cfgBot.version,
    username: accountConfig.username,
    auth: accountConfig.auth
  });
  bots[accountConfig.username] = bot;

  // When the bot spawns we apply plugins and optionally run
  // commands like /spawn and /lobby. We then broadcast status to
  // update the web dashboard.
  bot.once('spawn', () => {
    logger.success(`Bot ${accountConfig.username} spawned`);
    const cfg = getConfig();
    if (cfg.plugins && cfg.plugins.antiAfk) antiAfk(bot);
    if (cfg.plugins && cfg.plugins.randomMove) randomMove(bot);
    if (cfg.plugins && cfg.plugins.chatLogger) chatLogger(bot);
    if (cfg.plugins && cfg.plugins.autoSpawnCommand) {
      setTimeout(() => {
        bot.chat('/spawn');
        setTimeout(() => bot.chat('/lobby'), 3000);
      }, 5000);
    }
    broadcastBotsStatus();
  });

  // Auto respawn the bot on death if enabled. The respawn will
  // happen after a short delay to allow the death to register.
  bot.on('death', () => {
    const cfg = getConfig();
    if (cfg.plugins && cfg.plugins.autoRespawn) {
      logger.info(`Bot ${accountConfig.username} died, respawning…`);
      setTimeout(() => bot.respawn(), 1500);
    }
  });

  // Forward all chat messages to the web clients. We include
  // accountConfig.username so the client can distinguish between
  // multiple bots.
  bot.on('chat', (username, message) => {
    if (getConfig().web && getConfig().web.enabled) {
      io.emit('chat', { username: accountConfig.username, message });
    }
  });

  // Auto reconnect when the bot disconnects if the option is
  // enabled. The restart function will create a brand new bot and
  // preserve its entry in the bots dictionary.
  if (getConfig().plugins && getConfig().plugins.autoReconnect) {
    autoReconnect(bot, () => {
      logger.info(`Recreating bot for ${accountConfig.username}…`);
      createBot(accountConfig);
      broadcastBotsStatus();
    });
  }

  // Broadcast status when the bot ends (disconnects) to update the
  // dashboard. Note that autoReconnect will create a new bot
  // instance so this event fires before the new one spawns.
  bot.on('end', () => {
    broadcastBotsStatus();
  });

  bot.on('error', err => {
    logger.error(err);
  });
}

/**
 * Iterate over the accounts defined in config/config.json and create a
 * bot for each one. If no accounts array is defined we fall back
 * to a single account property (for backwards compatibility). If
 * nothing is defined we log an error.
 */
function startBots() {
  const cfg = getConfig();
  let accounts = cfg.accounts;
  if (!accounts || accounts.length === 0) {
    // support legacy single account format
    if (cfg.account) {
      accounts = [cfg.account];
    } else {
      logger.error('No accounts configured in config/config.json');
      return;
    }
  }
  accounts.forEach(acc => createBot(acc));
}

// When a client connects via socket.io we immediately send the
// current statuses. We also listen for sendMessage events and
// forward messages to the appropriate bot if web chat is enabled.
io.on('connection', socket => {
  // Immediately push current status to the newly connected client
  broadcastBotsStatus();

  socket.on('sendMessage', data => {
    const cfg = getConfig();
    if (!cfg.web || !cfg.web.allowWebChat) return;
    if (!data || typeof data.message !== 'string' || data.message.trim().length === 0) return;
    // Determine which bot to send to. If username is not provided
    // default to the first available bot.
    const targetName = data.username || Object.keys(bots)[0];
    const targetBot = bots[targetName];
    if (!targetBot || !targetBot.player) return;
    if (data.message.length > 100) return; // basic anti-spam
    targetBot.chat(data.message.trim());
  });
});

// Start everything
startBots();
startDiscordBot(() => bots);