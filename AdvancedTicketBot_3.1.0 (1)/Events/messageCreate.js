const Discord = require("discord.js")
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')

/**
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 */
module.exports = async (bot, message) => {
    const { config, Commands, lang, Aliases } = bot;
    const { author, member, channel } = message;
    if(message.content.startsWith(config.Prefix)) {
        let msgArray = message.content.split(" "),
            command = msgArray[0].toLowerCase(), 
            args = msgArray.slice(1), 
            hasPermission = false

        let commands = Commands.get(command.slice(config.Prefix.length)) 
            || Commands.get(Aliases.get(command.slice(config.Prefix.length)))
        if(commands) {
            if(commands.commandData.Permission) {
                if(typeof commands.commandData.Permission == 'string') 
                    commands.commandData.Permission = [commands.Permission]

                if(!commands.commandData.Permission[0])
                    commands.commandData.Permission[0] = "@everyone"
                
                for (const role of commands.commandData.Permission) {
                    if (!Utils.hasRole(member, role, true)) {
                        if(hasPermission == true) {
                        
                        } else {
                            hasPermission = false
                        }
                    } else {
                        hasPermission = true
                    }
                }
            }
            if(hasPermission) {
                commands.run(bot, message, args, config) 
            } else {
                message.reply({ 
                    embeds: [
                        Utils.setupEmbed({
                            configPath: lang.Presets.NoPermission,
                            variables: [
                                { searchFor: /{roles}/g, replaceWith: commands.commandData.Permission.map(x => {
                                    let role = Utils.findRole(x, message.guild, true)
                                    if(role) return `<@&${role.id}>`
                                }).join(", ")},
                                ...Utils.userVariables(member)
                            ]
                        })
                    ], 
                    allowedMentions: { 
                        repliedUser: false 
                    }
                })
            }
        }
    }
    if(config.Tags.Enabled && message.content.startsWith(config.Tags.Prefix)) {
        let args = message.content.replace(config.Tags.Prefix, '').split(" ")
        let tag = config.Tags.Commands.find(x => x.Command.toLowerCase() == args[0])
        if(tag) {
            let mention = message.mentions.members.first(), mv
            let data = {
                content: tag.Content ? tag.Content : null,
                embeds: tag.Embeds ? tag.Embeds.map(path => {
                    return Utils.setupEmbed({
                        configPath: path,
                        variables: Utils.userVariables(member)
                    })
                }) : tag.Embed ? [
                    Utils.setupEmbed({
                        configPath: tag.Embed,
                        variables: Utils.userVariables(member)
                    })
                ] : null
            }
            if(mention) {
                mv = Utils.userVariables(mention) 
                if(data.content) {
                    for (let index = 0; index < mv.length; index++) {
                        data.content = data.content.replace(mv[index].searchFor, mv[index].replaceWith)
                    }
                }
            } else {
                mv = Utils.userVariables(member)
                if(data.content) {
                    for (let index = 0; index < mv.length; index++) {
                        data.content = data.content.replace(mv[index].searchFor, "")
                    }
                }
            }

            data.content ? data.content = data.content : data.content = null 
            await message.delete()
            message.channel.send(data)
        }
    }

    TUtils.addStatistics(message)
}
module.exports.once = false