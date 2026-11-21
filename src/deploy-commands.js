const { REST, Routes } = require('discord.js');
const config = require('./config');
const commands = require('./commands');

async function deploy() {
  if (!config.token || !config.clientId) throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required');
  const rest = new REST({ version: '10' }).setToken(config.token);
  const payload = commands.map((command) => command.toJSON());

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: payload });
    console.log(`Deployed ${payload.length} commands to guild ${config.guildId}`);
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), { body: payload });
    console.log(`Deployed ${payload.length} global commands`);
  }
}

deploy().catch((error) => {
  console.error(error);
  process.exit(1);
});
