# Bot Minecraft Multi‑Comptes

**Soutien :** Si vous souhaitez soutenir mon travail sur ce projet, vous pouvez exécuter la commande suivante sur **DonutSMP** :  
`/pay Luoxy_ [montant]`

[🇬🇧 Read the English version](README.md)

## Présentation

Ce projet permet de faire tourner plusieurs comptes Minecraft à l’aide de la bibliothèque [mineflayer](https://github.com/PrismarineJS/mineflayer). Il inclut un tableau de bord web et une intégration Discord pour surveiller et contrôler les bots en temps réel. Vous pouvez changer de bot, voir leur santé et leur position, envoyer des messages (si activé) et consulter leur scoreboard.

## Fonctionnalités

- Connexion de plusieurs comptes sur le même serveur.
- Tableau de bord web (Express + Socket.io) affichant le chat et l’état des bots en direct.
- Zone de saisie de chat optionnelle (désactivable dans la config).
- Anti‑AFK, mouvements aléatoires, respawn et reconnexion automatiques.
- Bot Discord avec commande `/send-embed` qui publie un embed en direct et le met à jour toutes les quelques secondes.
- Rechargement à chaud de `config/config.json` pour ajuster les paramètres sans redémarrer Node.

## Installation

1. Installez [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée).
2. Clonez ce dépôt ou téléchargez les fichiers.
3. Installez les dépendances :

   ```bash
   npm install
   ```

## Configuration

Modifiez `config/config.json` pour configurer vos comptes et préférences. Exemple :

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
    "port": 2028,
    "allowWebChat": true
  },
  "discord": {
    "enabled": true,
    "token": "VOTRE_TOKEN_DISCORD",
    "guildId": "VOTRE_GUILD_ID",
    "updateInterval": 5000,
    "scoreboardMaxLines": 10
  }
}
```

- **accounts** : liste des comptes bots. Utilisez votre e‑mail Microsoft et mettez `"auth": "microsoft"`.
- **plugins** : activez ou désactivez les comportements individuels.
- **web.enabled** : activez ou désactivez le tableau de bord web.
- **web.port** : port pour le tableau de bord.
- **web.allowWebChat** : mettez `false` pour masquer la zone de saisie du chat.
- **discord** : configurez l’intégration Discord. Si `enabled` vaut `false`, le bot ne se connectera pas.

## Utilisation

1. Démarrez le serveur :

   ```bash
   npm start
   ```

2. Ouvrez votre navigateur sur `http://localhost:2028` (ou le port configuré). Connectez-vous à votre compte Microsoft quand un code s’affiche dans le terminal (flux device code).
3. Utilisez la liste déroulante pour changer de bot. Vous pouvez consulter le chat, la santé, la nourriture, la dimension et la position. Si le chat web est activé vous pouvez taper des messages depuis la page.
4. Sur Discord (dans votre serveur), exécutez `/send-embed` dans un salon où votre bot a la permission. Le bot publiera un embed avec l’état de tous les comptes et le mettra à jour automatiquement.

## Soutien

Si vous rencontrez des problèmes ou avez des suggestions, n’hésitez pas à ouvrir une issue ou à soumettre une pull request. Et si vous aimez ce projet, vous pouvez me soutenir sur DonutSMP avec `/pay Luoxy_ [montant]` 😉