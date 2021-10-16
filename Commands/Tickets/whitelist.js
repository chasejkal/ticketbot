const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "whitelist",
    type: 'ticket',
    commandData: commands.Tickets.Whitelist,
    slashData: new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription(commands.Tickets.Whitelist.Description)
        .addUserOption(o => o.setName('user').setDescription('Which user to whitelist').setRequired(true))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    const member = message.mentions.members.first()
    if(!args[0] || !member) return Utils.setupEmbed({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: `**Invalid Usage**: ${commands.Tickets.Blacklist.Usage}` }
        ]
    })
    let isBlacklisted = await TUtils.isBlacklisted(message.guild, member)
    if(isBlacklisted && isBlacklisted[0] == false) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{error}/g, replaceWith: 'User is already whitelisted' }
                ]
            })
        ]
    })
    await TUtils.db.blacklist.findOneAndDelete({
        guild_id: message.guild.id,
        user_id: member.user.id,
    })
    bot.emit('userWhitelisted', message.guild, whitedListedBy = message.member, member)
    message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.UserWhitelisted,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{user}/g, replaceWith: `<@${member.user.id}>` }
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
    let user = interaction.options.getUser("user")
    let isBlacklisted = await TUtils.isBlacklisted(interaction.guild, interaction.guild.members.cache.get(user.id))
    if(isBlacklisted && isBlacklisted[0] == false) return interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{error}/g, replaceWith: 'User is already whitelisted' },
                ]
            })
        ],
        ephemeral: true
    })
    await TUtils.db.blacklist.findOneAndDelete({
        guild_id: interaction.guild.id,
        user_id: user.id,
    })
    bot.emit('userWhitelisted', interaction.guild, whitedListedBy = interaction.member, user)
    interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.UserWhitelisted,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{user}/g, replaceWith: `<@${user.id}>` }
                ]
            })
        ],
        ephemeral: true
    })
}