const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "rename",
    type: 'ticket',
    commandData: commands.Tickets.Rename,
    slashData: new SlashCommandBuilder()
        .setName("rename")
        .setDescription(commands.Tickets.Rename.Description)
        .addStringOption(o => o.setName('new-name').setDescription('New Name of the Ticket').setRequired(true))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    if(!args[0]) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{error}/g, replaceWith: `Invalid Usage: \`${commands.Tickets.Rename.Usage}\`` }
                ]
            })
        ]
    })
    var isTicket = await TUtils.isTicket(message.guild, message.channel)
    if(!isTicket) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{error}/g, replaceWith: `This channel doesn't exists in the database.` }
                ]
            })
        ]
    })
    await message.channel.setName(args.join(" "))
    message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.TicketRenamed,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{new-name}/g, replaceWith: `<#${message.channel.id}>`}
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
    var isTicket = await TUtils.isTicket(interaction.guild, interaction.channel)
    if(!isTicket) return interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{error}/g, replaceWith: `This channel doesn't exists in the database.` }
                ]
            })
        ],
        ephemeral: true
    })
    let newName = interaction.options.getString('new-name')
    await interaction.channel.setName(newName)
    interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.TicketRenamed,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{new-name}/g, replaceWith: `<#${message.channel.id}>`}
                ]
            })
        ],
        ephemeral: true
    })
}