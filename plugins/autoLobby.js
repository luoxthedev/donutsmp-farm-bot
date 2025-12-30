const logger = require('../utils/logger');

/**
 * Automatically sends /lobby [1-7] on spawn and retries if not teleported.
 * @param {object} bot The mineflayer bot instance
 */
module.exports = function autoLobby(bot) {
  const tryLobby = () => {
    const lobbyId = Math.floor(Math.random() * 7) + 1;
    const cmd = `/lobby ${lobbyId}`;
    logger.info(`[AutoLobby] Sending ${cmd}`);
    bot.chat(cmd);

    let teleported = false;

    // Listen for indicators of teleportation
    const onTp = () => {
      teleported = true;
    };

    // We listen for 'respawn' (dimension change) or 'forcedMove' (teleport)
    bot.once('respawn', onTp);
    bot.once('forcedMove', onTp);

    setTimeout(() => {
      // Cleanup listeners
      bot.removeListener('respawn', onTp);
      bot.removeListener('forcedMove', onTp);

      if (!teleported) {
        logger.info(`[AutoLobby] Not teleported after 6s, retrying...`);
        tryLobby();
      } else {
        logger.success(`[AutoLobby] Successfully teleported to lobby.`);
      }
    }, 6000);
  };

  // Start the process
  tryLobby();
};
