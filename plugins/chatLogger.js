/**
 * Simple chat logger. Prints all chat messages to the console
 * except messages sent by the bot itself. Useful for debugging
 * and to keep a record of conversations.
 *
 * @param {object} bot The mineflayer bot instance
 */
module.exports = bot => {
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`<${username}> ${message}`);
  });
};