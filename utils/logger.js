const chalk = require('chalk');

/**
 * Simple logger that prefixes messages with a coloured tag. The
 * colours help differentiate informational, success and error
 * messages on the console. Feel free to extend this if you need
 * additional levels later on.
 */
module.exports = {
  /**
   * Log an informational message.
   * @param {string} msg The message to output
   */
  info: msg => console.log(chalk.blue('[INFO]'), msg),

  /**
   * Log a success message.
   * @param {string} msg The message to output
   */
  success: msg => console.log(chalk.green('[OK]'), msg),

  /**
   * Log an error message.
   * @param {string} msg The message to output
   */
  error: msg => console.log(chalk.red('[ERR]'), msg)
};