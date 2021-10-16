const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "close",
    type: 'ticket',
    commandData: commands.Tickets.Close,
    slashData: new SlashCommandBuilder()
        .setName("close")
        .setDescription(commands.Tickets.Close.Description)
        .addStringOption(o => o.setName('reason').setDescription('Reason For Closing the ticket (optional)'))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    await TUtils.closeTicket(message.guild, message.channel, message.member, args.join(" "))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    let reason = interaction.options.getString('reason') || null
    await TUtils.closeTicketInteraction(interaction, reason)
}