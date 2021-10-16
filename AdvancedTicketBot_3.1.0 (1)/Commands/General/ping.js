const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket');

module.exports = {
    name: "ping",
    type: 'general',
    commandData: commands.General.Ping,
    slashData: new SlashCommandBuilder()
        .setName("ping")
        .setDescription(commands.General.Ping.Description)
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    await TUtils.generateTranscript2(message.guild, message.channel)
    /*message.channel.send({ 
        embeds: [
            {
                title: "Calculating ping.."
            }
        ]
    }).then(async msg => {
        const ping = msg.createdTimestamp - message.createdTimestamp
        msg.delete()
        msg.channel.send({
            embeds: [
                Utils.setupEmbed({
                    configPath: lang.General.Ping,
                    variables: [
                        ...Utils.userVariables(message.member),
                        ...Utils.botVariables(bot),
                        { searchFor: /{bot-latency}/g, replaceWith: ping },
                        { searchFor: /{api-latency}/g, replaceWith: bot.ws.ping },
                    ]
                })
            ]
        })
    })*/
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    interaction.reply({
        embeds: [
            Utils.SetupEmbed({
                configPath: lang.General.Ping,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    ...Utils.botVariables(bot),
                    { searchFor: /{bot-latency}/g, replaceWith: "Unknown" },
                    { searchFor: /{api-latency}/g, replaceWith: bot.ws.ping },
                ]
            })
        ],
        ephemeral: true
    })
}