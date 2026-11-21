require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Collection,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  Partials
} = require('discord.js');

const config = require('./config');
const { userInfoEmbed } = require('./commands');

if (!config.token) throw new Error('DISCORD_TOKEN is required');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel]
});

const cooldowns = new Collection();

function canUseProtectedCommand(interaction) {
  return !config.authorizedUsers.length || config.authorizedUsers.includes(interaction.user.id);
}

function isDm(interaction) {
  return interaction.channel?.type === ChannelType.DM;
}

async function audit(interaction, message) {
  if (!config.logChannelId) return;
  const channel = await client.channels.fetch(config.logChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  await channel.send({
    embeds: [new EmbedBuilder().setColor(Colors.Greyple).setTitle('Bot audit').setDescription(message).setTimestamp()]
  }).catch(() => null);
}

function helpEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('NEXTRON')
    .setDescription('**Utility command menu**')
    .addFields(
      { name: '/checkuser', value: 'Inspect a public Discord user', inline: true },
      { name: '/blame', value: 'Harmless blame test', inline: true },
      { name: '/ban', value: 'Confirmed guild moderation', inline: true },
      { name: '/embedspam', value: 'Send one test embed', inline: true },
      { name: '/fakeip', value: 'IP format demo', inline: true },
      { name: '/ghostping', value: 'Safe notification test', inline: true },
      { name: '/spamraid', value: 'Private safety demo', inline: true }
    )
    .setFooter({ text: 'DM-ready • cooldown protected' });
}

client.once('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (isDm(interaction) && !config.dmEnabled) {
      return interaction.reply({ content: 'DM commands are disabled.', ephemeral: true });
    }

    const key = `${interaction.commandName}:${interaction.user.id}`;
    const now = Date.now();
    const expires = cooldowns.get(key) || 0;
    if (expires > now) {
      const seconds = Math.ceil((expires - now) / 1000);
      return interaction.reply({ content: `Please wait ${seconds}s before using this command again.`, ephemeral: true });
    }
    cooldowns.set(key, now + config.cooldownSeconds * 1000);

    try {
      switch (interaction.commandName) {
        case 'help':
          await interaction.reply({ embeds: [helpEmbed()], ephemeral: isDm(interaction) });
          break;

        case 'checkuser': {
          const user = interaction.options.getUser('user', true);
          await interaction.reply({ embeds: [userInfoEmbed(user)], ephemeral: true });
          break;
        }

        case 'blame': {
          const user = interaction.options.getUser('user', true);
          await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setDescription(`Blame test: ${user} is **not** being penalized.`)],
            ephemeral: true
          });
          break;
        }

        case 'ban': {
          if (!canUseProtectedCommand(interaction)) {
            return interaction.reply({ content: 'You are not authorized to use this protected command.', ephemeral: true });
          }
          if (!interaction.inGuild()) {
            return interaction.reply({ content: 'This moderation command only works in a server.', ephemeral: true });
          }
          if (!interaction.memberPermissions?.has('BanMembers')) {
            return interaction.reply({ content: 'You need the Ban Members permission.', ephemeral: true });
          }

          const user = interaction.options.getUser('user', true);
          const reason = interaction.options.getString('reason') || 'No reason provided';
          const confirmId = `ban-confirm:${interaction.id}`;
          const cancelId = `ban-cancel:${interaction.id}`;
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(confirmId).setLabel('Confirm ban').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(cancelId).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
          );

          await interaction.reply({
            content: `Confirm banning ${user.tag} (${user.id})?\nReason: ${reason}`,
            components: [row],
            ephemeral: true
          });

          const confirm = await interaction.channel.awaitMessageComponent({
            filter: (component) => component.user.id === interaction.user.id && [confirmId, cancelId].includes(component.customId),
            time: 30_000
          }).catch(() => null);

          if (!confirm) {
            await interaction.editReply({ content: 'Ban confirmation timed out.', components: [] }).catch(() => null);
          } else if (confirm.customId === cancelId) {
            await confirm.update({ content: 'Ban cancelled.', components: [] });
          } else {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (!member) {
              await confirm.update({ content: 'User is not in this guild.', components: [] });
            } else if (!member.bannable) {
              await confirm.update({ content: 'I cannot ban this member.', components: [] });
            } else {
              await member.ban({ reason }).catch((error) => {
                throw error;
              });
              await confirm.update({ content: `Banned ${user.tag}.`, components: [] });
              await audit(interaction, `${interaction.user.tag} banned ${user.tag} (${user.id}). Reason: ${reason}`);
            }
          }
          break;
        }

        case 'embedspam': {
          if (!canUseProtectedCommand(interaction)) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
          }
          const message = interaction.options.getString('message', true).slice(0, 4000);
          await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('Safe embed test').setDescription(message).setTimestamp()],
            ephemeral: true
          });
          break;
        }

        case 'fakeip': {
          const parts = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
          await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('Fake IP demo').setDescription(`\`${parts.join('.')}\`\nThis value is randomly generated and is not a real lookup target.`)],
            ephemeral: true
          });
          break;
        }

        case 'ghostping': {
          const user = interaction.options.getUser('user', true);
          await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('Ghost-ping test').setDescription(`Safe test for ${user}; no persistent mention or mass ping was sent.`)],
            ephemeral: true
          });
          break;
        }

        case 'spamraid': {
          await interaction.reply({
            embeds: [new EmbedBuilder()
              .setColor(0x5865F2)
              .setTitle('Raid/spam safety demo')
              .setDescription('This command intentionally does not send repeated messages or contact other users. Use Discord permissions and audit logs to protect servers.')],
            ephemeral: true
          });
          break;
        }
      }
    } catch (error) {
      console.error(error);
      const payload = { content: 'The command failed safely. Check bot permissions and logs.', ephemeral: true };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => null);
      else await interaction.reply(payload).catch(() => null);
    }
  }
});

client.login(config.token);
