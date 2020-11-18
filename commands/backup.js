/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
const { TextChannel, VoiceChannel, CategoryChannel } = require('discord.js');
const fs = require('fs');
const NodeRSA = require('node-rsa');

const fetchTilNone = async (channel, logMsg) => {
  const sumMessages = [];
  let lastId;
  let messages = [];
  do {
    const options = { limit: 100 };
    if (lastId) {
      options.before = lastId;
    }
    try {
      messages = await channel.messages.fetch(options);
      sumMessages.push(...messages.array());
      lastId = messages.last().id;
      messages = messages.array();
      await logMsg.edit(`\`[***] Fetching all messages in \`${channel.toString()}\`... Fetched ${sumMessages.length} so far\``);
    } catch (err) {
      console.log(err);
    }
  } while (messages.length === 100);
  return sumMessages;
};

module.exports = {
  description: 'Starts the backup process',
  fn: async (msg, _, __, highlight) => {
    const tempChannel = await msg.guild.channels.create(
      `backup-process-${Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(8, '0')}`, {
        permissionOverwrites: [
          {
            type: 'role',
            id: msg.guild.id,
            deny: ['VIEW_CHANNEL'],
          },
        ],
      },
    );
    const logMessages = [];
    logMessages[0] = await tempChannel.send(
      '`[***] Setting up default structure...`',
    );
    const finalJSON = {
      channels: [],
      roles: [],
      guildData: {
        afkChannel: msg.guild.afkChannel,
        afkTimeout: msg.guild.afkTimeout,
        auditLogs: Object.fromEntries(
          Array.from(
            (await msg.guild.fetchAuditLogs()).entries.entries(),
          ).map(([i, v]) => [i, { ...v }]),
        ),
        banner: msg.guild.banner,
        bans: Object.fromEntries(
          Array.from((await msg.guild.fetchBans()).entries()),
        ),
        defaultMessageNotifications: msg.guild.defaultMessageNotifications,
        description: msg.guild.description,
        discoverySplash: msg.guild.discoverySplash,
        emojis: Object.fromEntries(
          Array.from(msg.guild.emojis.cache.entries()),
        ),
        explicitContentFilter: msg.guild.explicitContentFilter,
        features: msg.guild.features,
        icon: msg.guild.icon,
        maximumMembers: msg.guild.maximumMembers,
        mfaLevel: msg.guild.mfaLevel,
        name: msg.guild.name,
        owner: msg.guild.ownerID,
        preferredLocale: msg.guild.preferredLocale,
        region: msg.guild.region,
        splash: msg.guild.splash,
        verificationLevel: msg.guild.verificationLevel,
        widgetEnabled: msg.guild.widgetEnabled,
      },
    };
    logMessages[0].edit('`[OK!] Setting up default structure...`');
    const textChannels = Array.from(
      msg.guild.channels.cache
        .filter(
          (v) => v instanceof TextChannel
            && !v.name.startsWith('backup-process-')
            && v.name !== 'backups',
        )
        .entries(),
    );
    logMessages[1] = [];
    for (let i = 0; i < textChannels.length; i += 1) {
      const [, v] = textChannels[i];
      logMessages[1].push(await tempChannel.send(`\`[***] Fetching all messages in \`${v.toString()}\`... Fetched none so far\``));
      finalJSON.channels.push({
        type: v.type,
        topic: v.topic,
        nsfw: v.nsfw,
        parent: v.parentID
          ? (await msg.guild.channels.resolve(v.parentID)).name
          : null,
        name: v.name,
        permissionOverwrites: Object.fromEntries(
          Array.from(v.permissionOverwrites.entries()).map(([i1, v1]) => [
            i1,
            {
              id: v1.id,
              type: v1.type,
              deny: v1.deny.bitfield,
              allow: v1.allow.bitfield,
            },
          ]),
        ),
        position: v.rawPosition,
        rateLimitPerUser: v.rateLimitPerUser,
        reason: v.reason,
        messages: (await fetchTilNone(v, logMessages[1][logMessages[1].length - 1]))
          .map((v1) => ({
            content: v1.content,
            authorName: v1.member ? v1.member.nickname || v1.author.username : v1.author.username,
            authorAvatar:
            v1.author.avatarURL()
            || `https://cdn.discordapp.com/embed/avatars/${
              v1.author.discriminator % 5
            }.png`,
            attachments: v1.attachments,
            embed: v1.embeds,
          })),
      });
      logMessages[1][logMessages[1].length - 1].edit(`\`[OK!] Fetching all messages in \`${v.toString()}\`...\``);
    }
    logMessages[2] = await tempChannel.send(
      '`[***] Fetching voice channels...`',
    );
    const voiceChannels = Array.from(
      msg.guild.channels.cache
        .filter((v) => v instanceof VoiceChannel)
        .entries(),
    );
    for (let i = 0; i < voiceChannels.length; i += 1) {
      const [, v] = voiceChannels[i];
      finalJSON.channels.push({
        type: v.type,
        topic: v.topic,
        bitrate: v.bitrate,
        parent: v.parentID
          ? (await msg.guild.channels.resolve(v.parentID)).name
          : null,
        name: v.name,
        permissionOverwrites: Object.fromEntries(
          Array.from(v.permissionOverwrites.entries()),
        ),
        position: v.rawPosition,
        userLimit: v.userLimit,
        reason: v.reason,
      });
    }
    logMessages[2].edit('`[OK!] Fetching voice channels...`');
    logMessages[3] = await tempChannel.send('`[***] Fetching categories...`');
    const categoryChannels = Array.from(
      msg.guild.channels.cache
        .filter((v) => v instanceof CategoryChannel)
        .entries(),
    );
    for (let i = 0; i < categoryChannels.length; i += 1) {
      const [, v] = categoryChannels[i];
      finalJSON.channels.push({
        type: v.type,
        topic: v.topic,
        name: v.name,
        permissionOverwrites: Object.fromEntries(
          Array.from(v.permissionOverwrites.entries()),
        ),
        position: v.rawPosition,
        reason: v.reason,
      });
    }
    logMessages[3].edit('`[OK!] Fetching categories...`');
    const roles = Array.from(
      msg.guild.roles.cache.filter((v) => !v.managed && v.id !== msg.guild.id),
    );
    for (let i = 0; i < roles.length; i += 1) {
      const [, v] = roles[i];
      finalJSON.roles.push({
        color: v.color,
        hoist: v.hoist,
        mentionable: v.mentionable,
        name: v.name,
        position: v.position,
        permissions: v.permissions,
        reason: v.reason,
      });
    }
    let tempPubKey;
    if (!highlight.keys.value[msg.guild.id]) {
      logMessages[4] = await tempChannel.send('`[***] Forging key pair...`');
      const key = new NodeRSA({ b: 1024 });
      highlight.keys.value[msg.guild.id] = key.exportKey();
      tempPubKey = key.exportKey('public');
      logMessages[4].edit('`[OK!] Forging key pair...`');
    } else {
      logMessages[4] = await tempChannel.send('`[***] Retrieving key pair...`');
      tempPubKey = new NodeRSA(highlight.keys.value[msg.guild.id]).exportKey('public');
      logMessages[4].edit('`[OK!] Retrieving key pair...`');
    }
    fs.writeFileSync(`${msg.guild.id}.pub`, tempPubKey);
    fs.writeFileSync(
      `${tempChannel.name}.json.encrypted`,
      new NodeRSA(highlight.keys.value[msg.guild.id]).encryptPrivate(
        JSON.stringify(finalJSON),
        'base64',
      ),
    );
    const backupsChannel = msg.guild.channels.cache.some(
      (v) => v.name === 'backups',
    )
      ? msg.guild.channels.cache.find((v) => v.name === 'backups')
      : await msg.guild.channels.create('backups', {
        permissionOverwrites: [
          {
            type: 'role',
            id: msg.guild.id,
            deny: ['VIEW_CHANNEL'],
          },
        ],
      });
    await backupsChannel.send({
      content: 'Here is your backup file, and other helpful files',
      files: [
        {
          attachment: `${tempChannel.name}.json.encrypted`,
          name: `${tempChannel.name}.json.encrypted`,
        },
        {
          attachment: `${msg.guild.id}.pub`,
          name: `${msg.guild.id}.pub`,
        },
        {
          attachment: 'RESTORE.md',
          name: 'HOW_TO_RESTORE.md',
        },
      ],
    });
    const admins = Array.from(msg.guild.members);
    for (let i = 0; i < admins.length; i += 1) {
      try {
        await msg.author.send({
          content: `In case one person in your admin team is evil, here is your backup file. (Summoned by ${msg.author.toString()} )`,
          files: [
            {
              attachment: `${tempChannel.name}.json.encrypted`,
              name: `${tempChannel.name}.json.encrypted`,
            },
            {
              attachment: `${msg.guild.id}.pub`,
              name: `${msg.guild.id}.pub`,
            },
            {
              attachment: 'RESTORE.md',
              name: 'HOW_TO_RESTORE.md',
            },
          ],
        });
      } catch (err) {
        // Ignore this
      }
    }
    fs.unlinkSync(`${tempChannel.name}.json.encrypted`);
    fs.unlinkSync(`${msg.guild.id}.pub`);
    tempChannel.delete();
    return 'Aight, got this done!';
  },
  admin: true,
};
