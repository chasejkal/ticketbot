const mongoose = require('mongoose')
const Discord = require('discord.js')
const { MessageActionRow, MessageButton } = Discord
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')
const { config, lang } = require('../index')

module.exports = async (bot, guild, channel, ticket, res) => {
    const creator = guild.members.cache.get(ticket.creator)
    let URL;
    if(res) {
        URL = `${config.Transcripts.Domain.endsWith("/") ? config.Transcripts.Domain : `${config.Transcripts.Domain}/`}${res.URL}`
    } else {
        URL = `${config.Transcripts.Domain.endsWith("/") ? config.Transcripts.Domain : `${config.Transcripts.Domain}/`}${ticket._id}`
    }
    if(config.Logs.ConsoleLog.TranscriptCreated) {
        Utils.logTicket(`New Transcript of ticket #${channel.name} (${channel.id}) | ${URL}`)
    }
    if(config.Logs.TranscriptCreated && typeof config.Logs.TranscriptCreated == "string") {
        const logChannel = Utils.findChannel(config.Logs.TranscriptCreated, guild, "GUILD_TEXT", true)
        if(logChannel) {
            logChannel.send({
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.Logs.TranscriptCreated,
                        variables: [
                            /* Creator Placeholders */
                            { searchFor: /{creator-id}/g, replaceWith: creator.id },
                            { searchFor: /{creator-displayname}/g, replaceWith: creator.displayName },
                            { searchFor: /{creator-username}/g, replaceWith: creator.user.username},
                            { searchFor: /{creator-tag}/g, replaceWith: creator.user.tag },
                            { searchFor: /{creator-mention}/g, replaceWith: '<@' + creator.id + '>' },
                            { searchFor: /{creator-pfp}/g, replaceWith: creator.user.displayAvatarURL({ dynamic: true }) },
                            { searchFor: /{creator-createdat}/, replaceWith: creator.user.createdAt.toLocaleString() },
                            ...Utils.botVariables(bot),
                            { searchFor: /{transcript}/g, replaceWith: URL },
                            { searchFor: /{channel-name}/g, replaceWith: channel.name },
                            { searchFor: /{channel-id}/g, replaceWith: channel.id },
                        ]
                    })
                ],
                components: [
                    new MessageActionRow({ components: [
                        new MessageButton({ style: 'LINK', label: 'Transcript', emoji: '🔗', url: URL })
                    ]})
                ],
            }).catch(e => {})
        }
    }
}