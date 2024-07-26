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
  results.forEach(async (result) => {
      const guild = client.guilds.cache.get(result.serverID);
      const channel = guild.channels.cache.get(result.channelID);
      if (!channel) {
        Frequencies.deleteOne({serverID: result.serverID});
        return 
      }
      else {
        //console.log (guild);
        //const startFax = guild.systemChannel.send('Fax Machine is trying to wake up 👁');
      }
  })

  client.guilds.cache.forEach(async guild => {
    
    const query = { serverID: guild.id };
    const result = await Frequencies.findOne(query);

    if (!result) {
      console.log(guild.systemChannel);
     // guild.systemChannel.send('https://tenor.com/view/fax-calling-gif-adastra-remember-the-flowers-gif-14024327373489605943');
     // guild.systemChannel.send('# Hello, this is FAX MACHINE?!? I AM ALIVE AGAIN bzzt ⚡.\nI work differently now, instead of using channels, I will create a **thread!** Anyone can choose to opt-in or opt-out of the thread to reduce spam. \nIf you would no longer like to participate in this social experiment, feel free to remove me!\n```type !connect to create a fax thread\ntype !seed to get an invite link for the fax bot! Proliferate!```')
    }
  });

	console.log(`Ready! Logged in as ${c.user.tag}`);
    client.user.setPresence( { status: "away" });
    client.user.setActivity('!connect to connect', { type: ActivityType.Listening });

    // const guild = await client.guilds.fetch('1171795345223716964');
    // guild.systemChannel.send('https://tenor.com/view/fax-calling-gif-adastra-remember-the-flowers-gif-14024327373489605943');
    // guild.systemChannel.send('# Hello, this is FAX MACHINE?!? I AM ALIVE AGAIN bzzt ⚡.\nI work differently now, instead of using channels, I will create a **thread!** Anyone can choose to opt-in or opt-out of the thread to reduce spam. \nIf you would no longer like to participate in this social experiment, feel free to remove me!\n```type !connect to create a fax thread\ntype !seed to get an invite link for the fax bot! Proliferate!```')

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

      // const systemChannel = message.guild.channels.cache.get(bet.channelID);

      //console.log (message.channel.id);
      // const thread = vegas.threads.cache.find(x => x.id === bet.postID);

        result = await Frequencies.findOne({ threadMessageID: message.channel.id });
        if (result) {
            // repeat message to all places except self. 

            const documents = await Frequencies.find({ threadMessageID: { $ne: message.channel.id} });
            // console.log ( documents );

            documents.forEach(async (document) => {

                console.log('attempting to echo message');
                const guild = await client.guilds.fetch(document.serverID);
                //console.log(guild);
                const channel = guild.channels.cache.get(document.channelID);
                //console.log(channel);

                const threadChannel = channel.threads.cache.find(x => x.id === document.threadMessageID);

                // console.log(threadChannel);

                if (!threadChannel) {
                    Frequencies.deleteOne( { channelID: document.channelID })
                    return console.log ('One Channel Deleted');
                }

                const currentNow = new Date().toUTCString();
                // channel.send('[' + obfuscateString(message.guild.name) + ']⠄⠄⠄⠄⠄\n' + message.content + '\n⠄⠄⠄⠄⠄`' + currentNow + '`');
                threadChannel.send('```' + '[' + obfuscateString(message.member.displayName) + '] "' + message.content + '"```' );

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
          message.channel.send('pong');
        } else if (command === 'connect') {
            const establishConnection = require('./PATTERNS/establishConnection');
            const results = await Frequencies.find();
            results.forEach((result) => {
                const guild = client.guilds.cache.get(result.serverID);
                const channel = guild.channels.cache.get(result.channelID);
                const threadChannel = channel.threads.cache.find(x => x.id === result.threadMessageID);
                if (threadChannel) {
                  threadChannel.send('*New Connection Established-* \n# ' + message.guild.name);
                }
            })
            establishConnection(message.guild, message.channel);
        } else if (command === 'seed') {
          message.reply ('https://discord.com/oauth2/authorize?client_id=1166155625290534992&permissions=309237647360&integration_type=0&scope=bot');
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