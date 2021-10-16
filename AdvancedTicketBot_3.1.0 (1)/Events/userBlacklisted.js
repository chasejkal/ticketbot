const mongoose = require('mongoose')
const Discord = require('discord.js')
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')
const { config, lang } = require('../index')

module.exports = async (bot, guild, blackListedBy, member, reason = 'None') => {
    member = guild.members.cache.get(member.id ? member.id : member.user.id)
    if(config.Logs.ConsoleLog.UserBlacklisted) {
        Utils.logTicket(`New User Blacklisted @${member.user.tag} (${member.user.id}) By @${blackListedBy.user.tag} (${blackListedBy.user.id})`)
    }
    if(config.Logs.UserBlacklisted && typeof config.Logs.UserBlacklisted == "string") {
        const logChannel = Utils.findChannel(config.Logs.UserBlacklisted, guild, "GUILD_TEXT", true)
        if(logChannel) {
            logChannel.send({
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.Logs.UserBlacklisted,
                        variables: [
                            ...Utils.userVariables(blackListedBy),
                            /* Blacklisted User Placeholders */
                            { searchFor: /{blacklisted-id}/g, replaceWith: member.id },
                            { searchFor: /{blacklisted-displayname}/g, replaceWith: member.displayName },
                            { searchFor: /{blacklisted-username}/g, replaceWith: member.user.username},
                            { searchFor: /{blacklisted-tag}/g, replaceWith: member.user.tag },
                            { searchFor: /{blacklisted-mention}/g, replaceWith: '<@' + member.id + '>' },
                            { searchFor: /{blacklisted-pfp}/g, replaceWith: member.user.displayAvatarURL({ dynamic: true }) },
                            { searchFor: /{blacklisted-createdat}/, replaceWith: member.user.createdAt.toLocaleString() },
                            ...Utils.botVariables(bot),
                            { searchFor: /{reason}/g, replaceWith: reason },
                        ]
                    })
                ]
            }).catch(e => {})
        }
    }
}