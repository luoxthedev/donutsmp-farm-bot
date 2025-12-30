/**
 * Convert a Minecraft dimension identifier into a human friendly
 * name. If the dimension is unknown we default to 'Unknown'.
 * @param {string} dim The dimension identifier as provided by mineflayer
 */
function getDimensionName(dim) {
  switch (dim) {
    case 'minecraft:overworld':
      return 'Overworld';
    case 'minecraft:the_nether':
      return 'Nether';
    case 'minecraft:the_end':
      return 'End';
    default:
      return 'Unknown';
  }
}

/**
 * Read the sidebar scoreboard from a mineflayer bot. Some servers
 * customise the scoreboard packets so it may not always be
 * available. We return a simple structure of title and an array of
 * lines or null if no readable scoreboard is present.
 *
 * @param {object} bot The mineflayer bot instance
 * @param {number} maxLines The maximum number of lines to return
 * @returns {object|null}
 */
function readScoreboard(bot, maxLines = 10) {
  try {
    const sb = bot.scoreboard;
    if (!sb || !sb.objectives) return null;

    const display = sb.displaySlots?.sidebar;
    if (!display) return null;
    const obj = sb.objectives[display];
    if (!obj || !obj.scores) return null;

    const lines = Object.entries(obj.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxLines)
      .map(([name, score]) => `${name}: ${score}`);

    return {
      title: obj.displayName || obj.name,
      lines
    };
  } catch (e) {
    return null;
  }
}

/**
 * Construct a status object for the provided bot. If the bot is
 * offline or not fully spawned we set online to false and return
 * minimal info. Otherwise we derive health, food, dimension and
 * position from the bot's entity. Scoreboard data is returned if
 * available.
 *
 * @param {object} bot The mineflayer bot instance
 * @param {object} config The loaded configuration
 */
function getBotStatus(bot, config) {
  if (!bot || !bot.player || !bot.entity) {
    return { online: false };
  }
  const e = bot.entity;
  const scoreboard = readScoreboard(bot, config?.discord?.scoreboardMaxLines || 10);
  return {
    username: bot.username,
    online: true,
    alive: e.health > 0,
    health: Math.round(e.health),
    food: Math.round(e.food),
    dimension: getDimensionName(bot.game.dimension),
    position: `${Math.floor(e.position.x)}, ${Math.floor(e.position.y)}, ${Math.floor(e.position.z)}`,
    scoreboard
  };
}

module.exports = { getBotStatus };