/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const { LocaleDb } = require('informa-db.js');

const keys = new LocaleDb({ path: 'all_keys.json' });

const highlights = {
  keys,
};

const client = new Discord.Client();
const commands = Object.fromEntries(
  fs
    .readdirSync('commands')
    .map((v) => [v.replace('.js', ''), require(`./commands/${v}`)]),
);

client.on('message', async (msg) => {
  if (!msg.content.startsWith(process.env.PREFIX)) return null;
  const [command, ...args] = msg.content
    .substring(process.env.PREFIX.length)
    .split(' ');
  if (command.toLowerCase() in commands) {
    if (commands[command].admin) {
      if (msg.member.hasPermission('ADMINISTRATOR')) await commands[command].fn(msg, args, client);
      else msg.channel.send('Insufficient permission [Required: `Admin`]');
    } else if (commands[command].owner === 'bot') {
      if (msg.author.id === (await client.fetchApplication()).owner.id) {
        await commands[command].fn(msg, args, client, highlights);
      } else {
        msg.channel.send(`Command ${process.env.PREFIX}${command} not found`);
      }
    } else if (commands[command].owner === 'server') {
      if (msg.author.id === msg.guild.ownerID) {
        await commands[command].fn(msg, args, client, highlights);
      } else {
        msg.channel.send('Insufficient permision [Required: `Server owner`]');
      }
    } else {
      await commands[command].fn(msg, args, client);
    }
  } else {
    msg.channel.send(`Command ${process.env.PREFIX}${command} not found`);
  }
  return 'there';
});

client.on('ready', () => console.log(`----------
Ready player 1`));

client.login(process.env.TOKEN);
