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
module.exports = async (bot, guild, channel, member, reason) => {
    const ticket = await TUtils.isTicket(guild, channel)
    if(ticket) {
        if(config.Logs.ConsoleLog.TicketCreated) {
            Utils.logTicket(`New Ticket #${channel.name} (${channel.id}) By @${member.user.tag} (${member.user.id})`)
        }
        if(config.Logs.TicketCreated && typeof config.Logs.TicketCreated == "string") {
            const logChannel = await Utils.findChannel(config.Logs.TicketCreated, guild, "GUILD_TEXT", true)
            if(logChannel) {
                logChannel.send({
                    embeds: [
                        Utils.setupEmbed({
                            configPath: lang.Logs.TicketCreated,
                            variables: [
                                ...Utils.userVariables(member),
                                ...Utils.botVariables(bot),
                                { searchFor: /{channel-name}/g, replaceWith: channel.name },
                                { searchFor: /{channel-id}/g, replaceWith: channel.id },
                                { searchFor: /{reason}/g, replaceWith: reason }
                            ]
                        })
                    ]
                })
            }
        }
    }
}