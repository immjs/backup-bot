module.exports = {
  desc: 'Executes a command',
  fn: async (msg, args) => {
    // eslint-disable-next-line no-eval
    const returned = await eval(`async ()=>{${args.join(' ')}}`)();
    if (returned) msg.channel.send(`Returned: ${JSON.stringify(returned)}`);
  },
  owner: 'bot',
};
