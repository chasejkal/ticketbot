const mongoose = require('mongoose')
const Discord = require('discord.js')
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')
const { config, lang } = require('../index')

module.exports = async (bot, guild, whitedListedBy, member) => {
    member = guild.members.cache.get(member.id ? member.id : member.user.id)
    if(config.Logs.ConsoleLog.UserWhitelisted) {
        Utils.logTicket(`New User Whitelist @${member.user.tag} (${member.user.id}) By @${whitedListedBy.user.tag} (${whitedListedBy.user.id})`)
    }
    if(config.Logs.UserWhitelisted && typeof config.Logs.UserWhitelisted == "string") {
        const logChannel = Utils.findChannel(config.Logs.UserWhitelisted, guild, "GUILD_TEXT", true)
        if(logChannel) {
            logChannel.send({
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.Logs.UserWhitelisted,
                        variables: [
                            ...Utils.userVariables(whitedListedBy),
                            /* Blacklisted User Placeholders */
                            { searchFor: /{whitelisted-id}/g, replaceWith: member.id },
                            { searchFor: /{whitelisted-displayname}/g, replaceWith: member.displayName },
                            { searchFor: /{whitelisted-username}/g, replaceWith: member.user.username},
                            { searchFor: /{whitelisted-tag}/g, replaceWith: member.user.tag },
                            { searchFor: /{whitelisted-mention}/g, replaceWith: '<@' + member.id + '>' },
                            { searchFor: /{whitelisted-pfp}/g, replaceWith: member.user.displayAvatarURL({ dynamic: true }) },
                            { searchFor: /{whitelisted-createdat}/, replaceWith: member.user.createdAt.toLocaleString() },
                            ...Utils.botVariables(bot),
                        ]
                    })
                ]
            }).catch(e => {})
        }
    }
}