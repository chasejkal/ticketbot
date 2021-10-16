const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "new",
    type: 'ticket',
    commandData: commands.Tickets.New,
    slashData: new SlashCommandBuilder()
        .setName("new")
        .setDescription(commands.Tickets.New.Description)
        .addStringOption(o => o.setName('reason').setDescription('Reason For Opening the ticket').setRequired(config.Tickets.OpenReasonRequired ? true : false))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    if(config.Tickets.OpenReasonRequired && !args[0]) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.NoReason,
                variables: [
                    ...Utils.userVariables(message.member)
                ]
            })
        ]
    })
    await TUtils.createTicket(message.guild, message.channel, message.member, args[0] ? args.join(" ") : "None", false)
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    let reason = interaction.options.getString('reason') || "None"
    await TUtils.createTicketInteraction(interaction, reason)
}