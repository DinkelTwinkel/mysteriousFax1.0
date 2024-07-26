
const Frequencies = require ('../models/frequencies')
const {ChannelType} = require('discord.js');

module.exports = async (guild, channel) => {

    console.log('Performing conflict check, please hold.');

    const query = { channelID: channel.id };
    const result = await Frequencies.findOne(query);

    if (result) {
        console.log('Document already exists: UserID:', result.serverID);
        console.log('Cancelling document creation.');
        channel.send ("[Connection Already Established, look for thread in channel.]");
        return result.save();
    } else {
        console.log('Document does not exist, proceeding with connection establishment...');
    }

    console.log('Adding Database Entry...');

    const faxThreadMessage = await channel.send ("# MYSTERIOUS FAX MACHINE");

    const thread = await faxThreadMessage.startThread({
      name: '??Mysterious Fax??',
      autoArchiveDuration: 1440,
      type:  ChannelType.PublicThread,
    });

    // Create Database Record.
    const connectionPoint = new Frequencies({

        serverID: guild.id,
        channelID: channel.id,
        threadMessageID: faxThreadMessage.id,
        name: obfuscateString(guild.name),
        level: 0,

    })

    console.log('Entry added successfully.');

    const results = await Frequencies.find();
    results.forEach((result) => {
        const guild = client.guilds.cache.get(result.serverID);
        const channel = guild.channels.cache.get(result.channelID);
        const threadChannel = channel.threads.cache.find(x => x.id === result.threadMessageID);
        if (threadChannel) {
          threadChannel.send('*New Connection Established-* \n# ' + guild.name);
        }
    })

    thread.send ("[Connection Established]");

    // add roles + set name

    return connectionPoint.save();

}

function obfuscateString(input, chance = 0.5) {
    const obfuscated = input.split('').map((char) => {
      // Determine whether to obfuscate the character
      if (/[a-zA-Z]/.test(char) && Math.random() < chance) {
        const random = Math.random();
        if (random < 0.33) {
          // Replace with a similar-looking number (e.g., 'o' -> '0')
          return char.replace(/[oO]/, '0').replace(/[lL]/, '1').replace(/[eE]/, '3');
        } else if (random < 0.66) {
          // Capitalize the letter
          return char.toUpperCase();
        } else if (random < 0.7) {
          // Repeat the letter
          return char + char;
        } else {
            return char;
        }
      }
      return char;
    });
  
    return obfuscated.join('');
  }