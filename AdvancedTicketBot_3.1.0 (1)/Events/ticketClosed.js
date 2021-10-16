const mongoose = require('mongoose')
const Discord = require('discord.js')
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')
const { config, lang } = require('../index')

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Guild} guild 
 * @param {Discord.TextChannel} channel 
 * @param {Discord.GuildMember} member 
 * @param {String} reason 
 */
module.exports = async (bot, guild, channel, member, reason, url) => {
    const ticket = await TUtils.isTicket(guild, channel)
    if(ticket) {
        const creator = guild.members.cache.get(ticket.creator)
        if(config.Logs.ConsoleLog.TicketClosed) {
            Utils.logTicket(`Ticket Closed #${channel.name} (${channel.id}) By @${member.user.tag} (${member.user.id}) | Created by @${creator.user.tag} (${creator.user.id})`)
        }
        if(config.Logs.TicketClosed && typeof config.Logs.TicketClosed == "string") {
            const logChannel = await Utils.findChannel(config.Logs.TicketClosed, guild, "GUILD_TEXT", true)
            if(logChannel) {
                logChannel.send({
                    embeds: [
                        Utils.setupEmbed({
                            configPath: lang.Logs.TicketClosed,
                            variables: [
                                ...Utils.userVariables(member),
                                ...Utils.botVariables(bot),

                                /* Creator Placeholders */
                                { searchFor: /{creator-id}/g, replaceWith: creator.id },
                                { searchFor: /{creator-displayname}/g, replaceWith: creator.displayName },
                                { searchFor: /{creator-username}/g, replaceWith: creator.user.username},
                                { searchFor: /{creator-tag}/g, replaceWith: creator.user.tag },
                                { searchFor: /{creator-mention}/g, replaceWith: '<@' + creator.id + '>' },
                                { searchFor: /{creator-pfp}/g, replaceWith: creator.user.displayAvatarURL({ dynamic: true }) },
                                { searchFor: /{creator-createdat}/, replaceWith: creator.user.createdAt.toLocaleString() },

                                { searchFor: /{channel-name}/g, replaceWith: channel.name },
                                { searchFor: /{channel-id}/g, replaceWith: channel.id },
                                { searchFor: /{close-reason}/g, replaceWith: reason },
                                { searchFor: /{open-reason}/g, replaceWith: ticket.reason },
                                { searchFor: /{transcript}/g, replaceWith: url }
                            ]
                        })
                    ]
                })
            }
        }
    }
}