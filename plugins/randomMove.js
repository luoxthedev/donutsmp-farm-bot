/**
 * Random movement plugin. Every so often the bot will pick a random
 * movement direction and move briefly. This helps make it look
 * slightly more like a real player. Adjust the interval and
 * duration as desired.
 *
 * @param {object} bot The mineflayer bot instance
 */
module.exports = bot => {
  setInterval(() => {
    if (!bot.entity) return;
    const controls = ['forward', 'back', 'left', 'right'];
    const move = controls[Math.floor(Math.random() * controls.length)];
    bot.setControlState(move, true);
    setTimeout(() => bot.setControlState(move, false), 800);
  }, 45000);
};