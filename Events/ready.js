const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const mongoose = require('mongoose')
const Discord = require('discord.js')
const Utils = require('../Modules/Utils')
const packageJSON = require('../package.json')
/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports = async (bot) => {
    const { SlashCmds, SlashCmdsData, config } = bot;
    
    Utils.logInfo('#--------------------------------------------------------------------------#');
    Utils.logInfo('#                                                                          #');
    Utils.logInfo(`#               • Advanced Ticket Bot ${packageJSON.version} is now Online! •               #`);
    Utils.logInfo('#                                                                          #');
    Utils.logInfo('#          • Join our Discord Server for any Issues/Custom Bots •          #');
    Utils.logInfo('#                     https://discord.gg/EgeZxGg6ev                        #');
    Utils.logInfo('#                                                                          #');
    Utils.logInfo('#--------------------------------------------------------------------------#');

    if(config.Transcripts.Enabled) {
        require('../Transcript/index')
    }

    const rest = new REST({ version: '9' }).setToken(config.Token);
    try {
		await rest.put(Routes.applicationGuildCommands(bot.user.id, config.GuildID), { 
            body: SlashCmdsData 
        });
	} catch (error) {
		console.error(error);
	}

    mongoose.connect(bot.config.MongoDB, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    })
    mongoose.connection.once('open', () => {
        Utils.logInfo("Database Connected!")
        Utils.logInfo("Bot ready!")
    })
	mongoose.connection.on('error', (error) => {
        Utils.logError(error)
        Utils.logError("Unable to connect to Database, Terminating.")
        process.exit()
    })
}
module.exports.once = true