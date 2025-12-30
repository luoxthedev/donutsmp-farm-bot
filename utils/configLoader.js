const fs = require('fs');
const chokidar = require('chokidar');

// Load the configuration from disk once at startup. We will
// update this in memory whenever the underlying file changes.
let config = {};
try {
  config = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
} catch (err) {
  console.error('[CONFIG] Unable to read config/config.json:', err);
  config = {};
}

/**
 * Helper to retrieve the current configuration snapshot.
 * Always call this rather than caching the object yourself so
 * that hot reloading works properly.
 */
function getConfig() {
  return config;
}

// Watch for changes to config/config.json and reload it on the fly.
chokidar.watch('./config/config.json').on('change', () => {
  try {
    const next = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
    config = next;
    console.log('[CONFIG] Reloaded config/config.json');
  } catch (err) {
    console.error('[CONFIG] Invalid config/config.json:', err);
  }
});

module.exports = { getConfig };