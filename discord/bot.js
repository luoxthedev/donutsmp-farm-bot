const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder
} = require('discord.js');
const { getConfig } = require('../utils/configLoader');
const { getBotStatus } = require('../utils/status');

// The Discord integration spawns a client that listens for the
// `/send-embed` command. When the command is used it sends an
// embed to the invoking channel and continually edits that embed
// every few seconds to reflect the latest status of all running
// bots. The embed includes per‑bot online state, health, food,
// dimension, position and scoreboard (if available), along with a
// note about whether web chat is enabled. There is no webhook
// required – everything is performed by the bot itself.

let statusMessage = null;
let updateInterval = null;

/**
 * Start the Discord bot. Pass a function that returns the current
 * dictionary of bots. This allows status updates to work even if
 * bots reconnect or are replaced.
 *
 * @param {Function} getBots A function returning an object of bots
 */
module.exports = function startDiscordBot(getBots) {
  const cfg = getConfig();
  if (!cfg.discord || !cfg.discord.enabled) {
    console.log('[DISCORD] Disabled in config');
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', async () => {
    console.log('[DISCORD] Bot connected');
    try {
      const rest = new REST({ version: '10' }).setToken(getConfig().discord.token);
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, getConfig().discord.guildId),
        {
          body: [
            {
              name: 'send-embed',
              description: 'Send an embed with live bot statuses'
            }
          ]
        }
      );
      console.log('[DISCORD] Slash command registered');
    } catch (err) {
      console.error('[DISCORD] Failed to register slash command:', err);
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'send-embed') return;

    // Respond privately to acknowledge the command. Use `ephemeral: true`
    // (no space) to avoid sending the reply to everyone in the channel.
    await interaction.reply({ content: 'Status embed sent.', ephemeral: true });
    const channel = interaction.channel;

    // Clear existing update interval if there is one. Only one live
    // status message is supported at a time. If you need multiple
    // embeds simply run the command in separate channels.
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    statusMessage = null;

    const sendOrEdit = async () => {
      const bots = getBots();
      const cfg = getConfig();
      const embed = buildEmbed(bots, cfg);
      if (!statusMessage) {
        statusMessage = await channel.send({ embeds: [embed] });
      } else {
        try {
          await statusMessage.edit({ embeds: [embed] });
        } catch (err) {
          console.error('[DISCORD] Failed to edit embed:', err);
        }
      }
    };

    await sendOrEdit();
    updateInterval = setInterval(sendOrEdit, getConfig().discord.updateInterval);
  });

  client.login(getConfig().discord.token);
};

/**
 * Build an embed containing the status for all bots. Uses a green
 * colour if at least one bot is online and red otherwise. Each bot
 * gets its own section with summary details and an optional
 * scoreboard.
 *
 * @param {Object<string, object>} bots A dictionary of bot instances
 * @param {object} cfg The current configuration
 */
function buildEmbed(bots, cfg) {
  const embed = new EmbedBuilder();
  // Determine if any bot is online
  const anyOnline = Object.keys(bots).some(name => {
    const status = getBotStatus(bots[name], cfg);
    return status.online;
  });
  embed.setColor(anyOnline ? 0x00ff00 : 0xff0000);
  embed.setTitle('🟢 Minecraft Bots Status');

  for (const name of Object.keys(bots)) {
    const status = getBotStatus(bots[name], cfg);
    const lines = [];
    lines.push(`Online: ${status.online ? 'Yes' : 'No'}`);
    if (status.online) {
      lines.push(`Alive: ${status.alive ? 'Yes' : 'No'}`);
      lines.push(`Health: ${status.health}`);
      lines.push(`Food: ${status.food}`);
      lines.push(`Dimension: ${status.dimension}`);
      lines.push(`Position: ${status.position}`);
    }
    embed.addFields({ name: `Bot: ${name}`, value: lines.join('\n'), inline: false });

    if (status.scoreboard) {
      embed.addFields({
        name: `📊 Scoreboard — ${name} (${status.scoreboard.title})`,
        value: status.scoreboard.lines.join('\n') || '—',
        inline: false
      });
    }
  }

  embed.addFields({
    name: 'Web Chat',
    value: cfg.web && cfg.web.allowWebChat ? 'Enabled' : 'Disabled',
    inline: false
  });
  embed.setFooter({ text: `Auto updated every ${cfg.discord.updateInterval / 1000}s` });
  embed.setTimestamp();
  return embed;
}