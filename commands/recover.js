/* eslint-disable no-await-in-loop */
const NodeRSA = require('node-rsa');
const wait = require('wait');
const fetch = require('node-fetch');

const sendThenAwaitMsg = async (tempChannel, msgSnd, filter) => {
  tempChannel.send(msgSnd);
  try {
    return Array.from((await tempChannel.awaitMessages(
      filter,
      { max: 1, time: 120000, errors: ['time'] },
    )).values())[0];
  } catch (err) {
    return null;
  }
};

module.exports = {
  desc: 'Recover from a backup file',
  fn: async (msg, _, __, highlights) => {
    const tempChannel = await msg.guild.channels.create(
      `recovery-process-${Math.floor(Math.random() * 0xffffffff)
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
    if (await sendThenAwaitMsg(
      tempChannel,
      `${msg.author.toString()}, Welcome to the recovery process.
Unlike in the backup process, the recovery process will request some information, so to be sure you are here, send \`Hello\`.
Please not that you will have a 60 sec delay for answering each of the questions.
If this delay is not respected, we will delete this channel.`,
      (v) => v.author.id === msg.author.id && v.content.toLowerCase() === 'hello',
    ) == null) {
      await tempChannel.send('You did not reply in time. We will delete this channel in 3 seconds.');
      await wait(3000);
      await tempChannel.delete();
      await msg.channel.send(`${msg.author.toString()}, You did not reply in time. The channel was successfully deleted.`);
      return null;
    }
    const jsonFile = await sendThenAwaitMsg(
      tempChannel,
      'Please send your `.json.encrypted` file.',
      (v) => v.author.id === msg.author.id
      && Array.from(v.attachments).length !== 0
      && Array.from(v.attachments.values())[0].name.endsWith('.json.encrypted'),
    );
    if (jsonFile == null) {
      await tempChannel.send('You did not reply in time. We will delete this channel in 3 seconds.');
      await wait(3000);
      await tempChannel.delete();
      await msg.channel.send(`${msg.author.toString()}, You did not reply in time. The channel was successfully deleted.`);
      return null;
    }
    const backupContents = await fetch(Array.from(jsonFile.attachments.values())[0].url);
    const keyName = await sendThenAwaitMsg(
      tempChannel,
      'Please send the name of your .pub file.',
      (v) => v.author.id === msg.author.id && v.content.replace('.pub', '').match(/[0-9]{18}/g),
    );
    if (keyName == null) {
      await tempChannel.send('You did not reply in time. We will delete this channel in 3 seconds.');
      await wait(3000);
      await tempChannel.delete();
      await msg.channel.send(`${msg.author.toString()}, You did not reply in time. The channel was successfully deleted.`);
      return null;
    }
    let decrypted;
    try {
      const tempPubKey = new NodeRSA(highlights.keys.value[keyName.content.replace('.pub', '')]);
      console.log(tempPubKey);
      decrypted = tempPubKey.decryptPublic(backupContents, 'utf8');
    } catch (err) {
      console.log(err);
      await tempChannel.send('You provided an invalid filename. We will delete this channel in 3 seconds.');
      await wait(3000);
      await tempChannel.delete();
      await msg.channel.send(`${msg.author.toString()}, You did not reply with a valid filename. The channel was successfully deleted.`);
      return null;
    }
    console.log({ decrypted });
    return null;
  },
  admin: true,
};
