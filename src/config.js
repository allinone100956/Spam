require('dotenv').config();

function envBoolean(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  dmEnabled: envBoolean('DM_ENABLED', true),
  logChannelId: process.env.LOG_CHANNEL_ID || null,
  cooldownSeconds: Number(process.env.COMMAND_COOLDOWN_SECONDS || 5),
  authorizedUsers: (process.env.AUTHORIZED_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
};
