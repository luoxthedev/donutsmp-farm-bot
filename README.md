# Minecraft Multi‑Account Bot

**Support me:** If you'd like to support my work on this project, feel free to run the following command on **DonutSMP**:  
`/pay Luoxy_ [amount]`

[🇫🇷 Voir la version française](README_fr.md)

## Overview

This project lets you run multiple Minecraft bot accounts using the [mineflayer](https://github.com/PrismarineJS/mineflayer) library. It also includes a web dashboard and Discord integration to monitor and control the bots in real time. You can switch between bots, view their health and position, send chat messages (if enabled) and see their scoreboard.

## Features

- Connect multiple accounts to the same server.
- Web dashboard built with Express and Socket.io showing live chat and bot status.
- Optional web chat input (can be disabled in the config).
- Automatic anti‑AFK, random movements, respawn and reconnection.
- Discord bot with `/send-embed` command that posts a live status embed and updates it every few seconds.
- Hot‑reload of `config/config.json` so you can adjust settings without restarting Node.

## Installation

1. Install [Node.js](https://nodejs.org/) (version 18 or higher recommended).
2. Clone this repository or download the files.
3. Install dependencies using npm:

   ```bash
   npm install
   ```

## Configuration

Edit `config/config.json` to set up your accounts and preferences. Example:

```json
{
  "accounts": [
    { "username": "EMAIL_MICROSOFT_1", "auth": "microsoft" },
    { "username": "EMAIL_MICROSOFT_2", "auth": "microsoft" }
  ],
  "plugins": {
    "antiAfk": true,
    "randomMove": true,
    "chatLogger": true,
    "autoReconnect": true,
    "autoSpawnCommand": true,
    "autoRespawn": true
  },
  "web": {
    "enabled": true,
    "port": 3000,
    "allowWebChat": true
  },
  "discord": {
    "enabled": false,
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "guildId": "YOUR_GUILD_ID",
    "updateInterval": 5000,
    "scoreboardMaxLines": 10
  }
}
```

- **accounts**: list of bot accounts. Use your Microsoft email and set `"auth": "microsoft"`.
- **plugins**: toggle individual behaviours.
- **web.enabled**: enable or disable the web dashboard.
- **web.port**: port for the dashboard.
- **web.allowWebChat**: disable this to hide the chat input on the dashboard.
- **discord**: configure the Discord integration. If `enabled` is `false`, the bot will not log in.

## Usage

1. Start the server:

   ```bash
   npm start
   ```

2. Open your browser to `http://localhost:3000` (or your configured port). Log in to your Microsoft account when prompted in the terminal (device code flow).
3. Use the dropdown to switch between bots. You can view chat, health, food, dimension and position. If web chat is enabled you can type messages from the web page.
4. In Discord (on your guild), run `/send-embed` in a channel where your bot has permission. The bot will post an embed with the status of all accounts and update it automatically.

## Support

If you run into issues or have suggestions, feel free to open an issue or submit a pull request. And if you enjoy this project, you can support me on DonutSMP with `/pay Luoxy_ [amount]` 😉