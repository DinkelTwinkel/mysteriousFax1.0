// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, mongourl } = require('./keys.json');
require('log-timestamp');
const Frequencies = require ('./models/frequencies')

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const mongoose = require('mongoose');

  mongoose.connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('connected to HellDB'))
    .catch((err) => console.log(err));

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'

client.once(Events.ClientReady, async c => {

    const results = await Frequencies.find();
    results.forEach((result) => {
        const guild = client.guilds.cache.get(result.serverID);
        const channel = guild.channels.cache.get(result.channelID);
        // channel.send('Fax Machine has awaken 👁');
    })

	console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setPresence( { status: "away" });
    client.user.setActivity('strange frequencies', { type: ActivityType.Listening });

});


client.on(Events.GuildDelete, async (guild) => {
    console.log('Bot ejection Detected, cleaning up-');

    const query = { serverID: guild.id };
    const result = await Frequencies.deleteOne(query);

    if (result.deletedCount === 1) {
        console.log("Successfully deleted one Server document.");
    } else {
        console.log("No documents matched the query. Deleted 0 documents.");
    }

})

// detect message

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) {
        result = await Frequencies.findOne({ channelID: message.channel.id });
        if (result) {
            // repeat message to all places except self. 

            const documents = await Frequencies.find({ serverID: { $ne: result.serverID } });
            console.log ( documents );

            documents.forEach((document) => {

                console.log('attempting to echo message');
                const guild = client.guilds.cache.get(document.serverID);
                console.log(guild);
                const channel = guild.channels.cache.get(document.channelID);
                console.log(channel);

                if (!channel) {
                    Frequencies.deleteOne( { channelID: document.channelID })
                    return console.log ('One Channel Deleted');
                }

                const currentNow = new Date().toUTCString();
                channel.send('[' + obfuscateString(message.guild.name) + ']⠄⠄⠄⠄⠄\n' + message.content + '\n⠄⠄⠄⠄⠄`' + currentNow + '`');

            })

        }
      }
})


//Regular Secret Commands 
//Check if user is also in the hell mart discord. Only work if so.
client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith('!')) {
        console.log('commandDetected');
        // Extract the command and any arguments
        const args = message.content.slice(1).trim().split(/ +/);
        const command = args.shift().toLowerCase();
    
        // Check the command and respond
        if (command === 'ping') {
          // message.channel.send('pong');
        } else if (command === 'connect') {
            const establishConnection = require('./PATTERNS/establishConnection');
            const results = await Frequencies.find();
            results.forEach((result) => {
                const guild = client.guilds.cache.get(result.serverID);
                const channel = guild.channels.cache.get(result.channelID);
                channel.send('New Connection Established???');
            })
            establishConnection(message.guild, message.channel);
        }
        // Add more commands here as needed
      }
})

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

// Log in to Discord with your client's token
client.login(token);