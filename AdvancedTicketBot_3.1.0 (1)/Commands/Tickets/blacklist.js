const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "blacklist",
    type: 'ticket',
    commandData: commands.Tickets.Blacklist,
    slashData: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription(commands.Tickets.Blacklist.Description)
        .addUserOption(o => o.setName('user').setDescription('Which user to blacklist').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason For Blacklisting the user'))
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
    const reason = args[1] ? args.join(" ").replace(new RegExp(`${args[0]}`, 'g')).trim() : "None"
    let isBlacklisted = await TUtils.isBlacklisted(message.guild, member)
    if(isBlacklisted && isBlacklisted[0] == true) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{error}/g, replaceWith: 'User is already blacklisted' }
                ]
            })
        ]
    })
    await new TUtils.db.blacklist({
        guild_id: message.guild.id,
        user_id: member.user.id,
        reason: reason
    }).save()
    bot.emit('userBlacklisted', message.guild, blackListedBy = message.member, member, reason)
    message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.UserBlacklisted,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{user}/g, replaceWith: `<@${member.user.id}>` },
                    { searchFor: /{reason}/g, replaceWith: reason }
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
    let reason = interaction.options.getString('reason') || "None"
    let isBlacklisted = await TUtils.isBlacklisted(interaction.guild, interaction.guild.members.cache.get(user.id))
    if(isBlacklisted && isBlacklisted[0] == true) return interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{error}/g, replaceWith: 'User is already blacklisted' },
                ]
            })
        ],
        ephemeral: true
    })
    await new TUtils.db.blacklist({
        guild_id: interaction.guild.id,
        user_id: user.id,
        reason: reason
    }).save()
    bot.emit('userBlacklisted', interaction.guild, blackListedBy = interaction.member, user, reason)
    interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.UserBlacklisted,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{user}/g, replaceWith: `<@${user.id}>` },
                    { searchFor: /{reason}/g, replaceWith: reason }
                ]
            })
        ],
        ephemeral: true
    })
}