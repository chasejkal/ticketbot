const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket');
const moment = require('moment')

module.exports = {
    name: "statistics",
    type: 'general',
    commandData: commands.General.Statistics,
    slashData: new SlashCommandBuilder()
        .setName("statistics")
        .setDescription(commands.General.Statistics.Description)
        .addUserOption(o => o.setName('user').setDescription('Statistics of a user'))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    const member = message.mentions.members.first() || message.member
    let stats = await TUtils.getStatistics(member, message.guild)
    message.channel.send({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.General.Statistics,
                variables: [
                    ...Utils.userVariables(member),
                    ...Utils.botVariables(bot),
                    { searchFor: /{all-messages}/g, replaceWith: stats.allMessages },
                    { searchFor: /{30days-messages}/g, replaceWith: stats.month },
                    { searchFor: /{7days-messages}/g, replaceWith: stats.week },
                    { searchFor: /{24hours-messages}/g, replaceWith: stats.day },
                    { searchFor: /{lvl}/g, replaceWith: stats.resLevel },
                    { searchFor: /{ticket-answred}/g, replaceWith: stats.totalTicketAnswred },
                    { searchFor: /{highest-role}/g, replaceWith: member.roles.highest.id }
                ]
            })
        ]
    })
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    let member = interaction.options.getUser("user")
    member = member ? interaction.guild.members.cache.get(member.id) : interaction.member
    let stats = await TUtils.getStatistics(member, interaction.guild)
    interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.General.Statistics,
                variables: [
                    ...Utils.userVariables(member),
                    ...Utils.botVariables(bot),
                    { searchFor: /{all-messages}/g, replaceWith: stats.allMessages },
                    { searchFor: /{30days-messages}/g, replaceWith: stats.month },
                    { searchFor: /{7days-messages}/g, replaceWith: stats.week },
                    { searchFor: /{24hours-messages}/g, replaceWith: stats.day },
                    { searchFor: /{lvl}/g, replaceWith: stats.resLevel },
                    { searchFor: /{ticket-answred}/g, replaceWith: stats.totalTicketAnswred },
                    { searchFor: /{highest-role}/g, replaceWith: member.roles.highest.id }
                ]
            })
        ],
        ephemeral: true
    })
}