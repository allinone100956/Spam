const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  Collection,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors
} = require('discord.js');

const color = 0x5865F2;

function userInfoEmbed(user, title = 'User information') {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .addFields(
      { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
      { name: 'Account created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
      { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true }
    );
}

module.exports = [
  new SlashCommandBuilder().setName('help').setDescription('Show the DM-friendly command menu'),
  new SlashCommandBuilder()
    .setName('checkuser')
    .setDescription('Look up basic public Discord user information')
    .addUserOption((option) => option.setName('user').setDescription('User to inspect').setRequired(true)),
  new SlashCommandBuilder()
    .setName('blame')
    .setDescription('Send a harmless blame message')
    .addUserOption((option) => option.setName('user').setDescription('User to blame').setRequired(true)),
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Request a confirmed guild ban')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) => option.setName('user').setDescription('User to ban').setRequired(true))
    .addStringOption((option) => option.setName('reason').setDescription('Moderation reason').setRequired(false)),
  new SlashCommandBuilder()
    .setName('embedspam')
    .setDescription('Send one safe test embed')
    .addStringOption((option) => option.setName('message').setDescription('Embed text').setRequired(true)),
  new SlashCommandBuilder().setName('fakeip').setDescription('Run the harmless fake IP format demo'),
  new SlashCommandBuilder()
    .setName('ghostping')
    .setDescription('Run a safe ghost-ping notification test')
    .addUserOption((option) => option.setName('user').setDescription('User to notify').setRequired(true)),
  new SlashCommandBuilder().setName('spamraid').setDescription('Run the safe raid simulation demo')
];

module.exports.userInfoEmbed = userInfoEmbed;
