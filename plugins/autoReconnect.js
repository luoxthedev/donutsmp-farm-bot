/**
 * Auto reconnect plugin. Whenever the bot disconnects it will wait
 * a few seconds and then attempt to create a new bot instance. The
 * restart function should create a new bot and register all
 * necessary event handlers.
 *
 * @param {object} bot The mineflayer bot instance
 * @param {Function} restart A function that spawns a fresh bot
 */
module.exports = (bot, restart) => {
  bot.on('end', () => {
    console.log('Disconnected. Reconnecting...');
    setTimeout(() => restart(), 10000);
  });

  bot.on('kicked', reason => {
    console.log('Kicked:', reason);
  });
};