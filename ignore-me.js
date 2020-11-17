/* await tempChannel.send(`[INF] Let's begin. What are the total number of messages in these \
channels?
[INF] You can search all messages in the said channel through the searchbar and lookup the total \
number of results.
[INF] If this is your first time using the search bar, make a check up search. If an 'indexation \
process' pops out, wait a bit, then relaunch the research
[INF] When you're all set and ready, say \`Ok\`.`);
    try {
      await tempChannel.awaitMessages((v) => v.content.toLowerCase() === 'ok', {
        max: 1,
        time: 300000,
        errors: 'time',
      });
    } catch (err) {
      tempChannel.send(
        `${msg.member.toString()} did not reply in time. We will be deleting this channel in 3 \
seconds`,
      );
      await wait(3000);
      return tempChannel.delete();
    } */
/* for (let i = 0; i < textChannels.length; i += 1) {
      const [, v] = textChannels[i];
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
      });
      await tempChannel.send(
        `What are the total number of messages in ${v.toString()}?`,
      );
      try {
        const numberOfMessages = Array.from(
          (
            await tempChannel.awaitMessages(
              (v1) => v1.author.id === msg.author.id,
              { max: 1, time: 60000, errors: 'time' },
            )
          ).values(),
        );
        if (Number.isNaN(numberOfMessages)) {
          tempChannel.send(
            '> Did I ask base36? ( <https://en.wikipedia.org/wiki/Base_36> )',
          );
          i -= 1;
        } else {
          finalJSON.channels[finalJSON.channels.length - 1].messages = (
            await v.messages.fetch({ limit: numberOfMessages })
          ).map((v1) => ({
            content: v1.content,
            authorName: v1.member.nickname || v1.author.username,
            authorAvatar:
              v1.author.avatarURL()
              || `https://cdn.discordapp.com/embed/avatars/${
                v1.author.discriminator % 5
              }.png`,
            attachments: v1.attachments,
            embed: v1.embeds,
          }));
        }
      } catch (err) {
        console.log(err);
        if (err.message.includes('Internal')) {
          tempChannel.send(
            'Didn\'t quite catch that [Internal Server Error]... Let me ask you again...',
          );
          i -= 1;
        } else {
          tempChannel.send(
            'You timed out [Did not reply in 1 min]! Assuming 100',
          );
          finalJSON.channels[finalJSON.channels.length - 1].messages = (
            await v.messages.fetch({ limit: 100 })
          ).map((v1) => ({
            content: v1.content,
            authorName: v1.member.nickname || v1.author.username,
            authorAvatar:
              v1.author.avatarURL()
              || `https://cdn.discordapp.com/embed/avatars/${
                v1.author.discriminator % 5
              }.png`,
            attachments: v1.attachments,
            embed: v1.embeds,
            type: v1.type,
          }));
        }
      }
    } */
