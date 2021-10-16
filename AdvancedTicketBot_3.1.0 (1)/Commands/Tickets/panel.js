const Discord = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "panel",
    type: 'ticket',
    commandData: commands.Tickets.Panel,
    slashData: new SlashCommandBuilder()
        .setName("panel")
        .setDescription(commands.Tickets.Panel.Description)
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    await message.delete()
    message.channel.send({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Panel,
                variables: Utils.botVariables(bot)
            })
        ],
        components: [
            new MessageActionRow({ components: [
                Utils.parseButton(lang.Panel.Button, 'create_ticket')
            ]})
        ]
    })
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    await interaction.channel.send({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Panel,
                variables: Utils.botVariables(bot)
            })
        ],
        components: [
            new MessageActionRow({ components: [
                Utils.parseButton(lang.Panel.Button, 'create_ticket')
            ]})
        ]
    })
    interaction.reply({
        content: 'Create Ticket Panel Sent!',
        ephemeral: true
    })
}