/**
 * Anti-AFK plugin. Periodically makes the bot jump to avoid
 * being kicked for inactivity. Interval and timing are hard
 * coded but could be moved to config if needed.
 *
 * @param {object} bot The mineflayer bot instance
 */
module.exports = bot => {
  setInterval(() => {
    if (!bot.entity) return;
    bot.setControlState('jump', true);
    setTimeout(() => bot.setControlState('jump', false), 300);
  }, 30000);
};