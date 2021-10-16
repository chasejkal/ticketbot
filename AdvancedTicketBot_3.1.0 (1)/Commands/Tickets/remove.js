const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "remove",
    type: 'ticket',
    commandData: commands.Tickets.Remove,
    slashData: new SlashCommandBuilder()
        .setName("remove")
        .setDescription(commands.Tickets.Close.Description)
        .addUserOption(o => o.setName('user').setDescription('User to remove in the ticket').setRequired(true))
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
            { searchFor: /{error}/g, replaceWith: `**Invalid Usage**: ${commands.Tickets.Remove.Usage}` }
        ]
    })

    if(member.user.id == message.author.id) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(message.member),
                    { searchFor: /{error}/g, replaceWith: `You can't remove yourself.` }
                ]
            })
        ]
    })

    try {
        message.channel.permissionOverwrites.edit(member.user.id, {
            'VIEW_CHANNEL': false,
            'SEND_MESSAGES': false,
            'READ_MESSAGE_HISTORY': false,
            'EMBED_LINKS': false,
            'ATTACH_FILES': false
        })
        await TUtils.db.ticket.findOneAndUpdate({ 
            guild: message.guild.id, 
            channel: message.channel.id 
        }, {
            $unset: {
                addedUsers: member.user.id
            }
        })
        message.reply({
            embeds: [
                Utils.setupEmbed({
                    configPath: lang.UserRemove,
                    variables: [
                        ...Utils.userVariables(message.member),
                        { searchFor: /{user}/g, replaceWith: `<@${member.user.id}>` },
                    ]
                })
            ]
        })
    } catch (e) {
        Utils.logError(e)
        return Utils.setupEmbed({
            configPath: lang.Presets.Error,
            variables: [
                { searchFor: /{error}/g, replaceWith: `An Error Occured while removing ${member.user.id} to this ticket` }
            ]
        })
    }
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    let member = interaction.options.getUser("user")
    member = interaction.guild.members.cache.get(member.id)

    if(member.user.id == interaction.member.id) return interaction.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    { searchFor: /{error}/g, replaceWith: `You can't add yourself.` }
                ]
            })
        ],
        ephemeral: true
    })

    try {
        interaction.channel.permissionOverwrites.edit(member.user.id, {
            'VIEW_CHANNEL': false,
            'SEND_MESSAGES': false,
            'READ_MESSAGE_HISTORY': false,
            'EMBED_LINKS': false,
            'ATTACH_FILES': false
        })
        await TUtils.db.ticket.findOneAndUpdate({ 
            guild: interaction.guild.id, 
            channel: interaction.channel.id 
        }, {
            $pull: {
                addedUsers: member.user.id
            }
        })
        interaction.reply({
            embeds: [
                Utils.setupEmbed({
                    configPath: lang.UserRemove,
                    variables: [
                        ...Utils.userVariables(interaction.member),
                        { searchFor: /{user}/g, replaceWith: `<@${member.user.id}>` },
                    ]
                })
            ],
            ephemeral: true
        })
    } catch (e) {
        Utils.logError(e)
        return interaction.reply({
            embeds: [
                Utils.setupEmbed({
                    configPath: lang.Presets.Error,
                    variables: [
                        ...Utils.userVariables(interaction.member),
                        { searchFor: /{error}/g, replaceWith: `An Error Occured while removing ${member.user.id} to this ticket` }
                    ]
                })
            ],
            ephemeral: true
        })
    }
}