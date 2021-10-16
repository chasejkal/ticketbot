const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { lang, config, commands } = require('../../index');
const TUtils = require('../../Modules/Ticket');

module.exports = {
    name: "help",
    type: 'general',
    commandData: commands.General.Help,
    slashData: new SlashCommandBuilder()
        .setName("help")
        .setDescription(commands.General.Help.Description)
        .addStringOption(o => o.setName('command').setDescription("Command for info"))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    let cmds = bot.Commands.toJSON()
    let generalCommands = cmds.filter(x => x.type.toLowerCase() == 'general')
    let ticketCommands = cmds.filter(x => x.type.toLowerCase() == 'ticket')
    
    generalCommands = generalCommands.map(x => `\`${config.Prefix}${x.name}\``).join(", ")
    ticketCommands = ticketCommands.map(x => `\`${config.Prefix}${x.name}\``).join(", ")

    if(!args[0]) {
        message.channel.send({
            embeds: [
                Utils.setupEmbed({
                    configPath: {
                        Title: "💁‍♂️ Help Menu",
                        Description: "> User `-help <command>` to view more information about command",
                        Fields: [
                            {
                                Name: "General Commands",
                                Value: generalCommands
                            },
                            {
                                Name: "Ticket Commands",
                                Value: ticketCommands
                            }
                        ],
                        Footer: "{user-tag}",
                        FooterTag: "{user-tag}",
                        Thumbnail: "{bot-pfp}",
                        Timestamp: true
                    },
                    variables: [
                        ...Utils.userVariables(message.member),
                        ...Utils.botVariables(bot)
                    ]
                })
            ]
        })
    } else {
        let cmd = cmds.find(x => x.name.toLowerCase() == args[0].toLowerCase()) 
        if(cmd) {
            message.channel.send({
                embeds: [
                    Utils.setupEmbed({
                        configPath: {
                            Title: "Command Info - {command-name}",
                            Description: "{command-description}\n\n**Usage**\n> `{command-usage}`\n**Aliases**\n> {command-aliases}\n**Slash Command**: \{command-isSlashEnabled}",
                            Footer: "{user-tag}",
                            FooterTag: "{user-tag}",
                            Timestamp: true
                        },
                        variables: [
                            ...Utils.userVariables(message.member),
                            ...Utils.botVariables(bot),
                            { searchFor: /{command-name}/g, replaceWith: cmd.name },
                            { searchFor: /{command-description}/g, replaceWith: cmd.commandData.Description },
                            { searchFor: /{command-usage}/g, replaceWith: cmd.commandData.Usage },
                            { searchFor: /{command-aliases}/g, replaceWith: cmd.commandData.Aliases.length > 0 ? cmd.commandData.Aliases.join(", ") : "None" },
                            { searchFor: /{command-isSlashEnabled}/g, replaceWith: cmd.commandData.SlashCommand.Enabled ? "✅" : "❌" },
                        ]
                    })
                ]
            })
        } else {
            message.reply({
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.General.Help,
                        variables: [
                            ...Utils.userVariables(interaction.member),
                            ...Utils.botVariables(bot),
                            { searchFor: /{error}/g, replaceWith: `Unable to find \`${args[0]}\` command` },
                        ]
                    })
                ]
            })
        }
    }
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    await interaction.deferReply({ ephemeral: true })

    let cmds = bot.Commands.toJSON()
    let generalCommands = cmds.filter(x => x.type.toLowerCase() == 'general')
    let ticketCommands = cmds.filter(x => x.type.toLowerCase() == 'ticket')
    
    generalCommands = generalCommands.map(x => `\`${config.Prefix}${x.name}\``).join(", ")
    ticketCommands = ticketCommands.map(x => `\`${config.Prefix}${x.name}\``).join(", ")

    let command = interaction.options.getString('command')

    if(!command) {
        interaction.editReply({
            ephemeral: true,
            embeds: [
                Utils.setupEmbed({
                    configPath: {
                        Title: "💁‍♂️ Help Menu",
                        Description: "> User `-help <command>` to view more information about command",
                        Fields: [
                            {
                                Name: "General Commands",
                                Value: generalCommands
                            },
                            {
                                Name: "Ticket Commands",
                                Value: ticketCommands
                            }
                        ],
                        Footer: "{user-tag}",
                        FooterTag: "{user-tag}",
                        Thumbnail: "{bot-pfp}",
                        Timestamp: true
                    },
                    variables: [
                        ...Utils.userVariables(interaction.member),
                        ...Utils.botVariables(bot)
                    ]
                })
            ]
        })
    } else {
        let cmd = cmds.find(x => x.name.toLowerCase() == command.toLowerCase()) 
        if(cmd) {
            interaction.editReply({
                ephemeral: true,
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.General.Help,
                        variables: [
                            ...Utils.userVariables(interaction.member),
                            ...Utils.botVariables(bot),
                            { searchFor: /{command-name}/g, replaceWith: cmd.name },
                            { searchFor: /{command-description}/g, replaceWith: cmd.commandData.Description },
                            { searchFor: /{command-usage}/g, replaceWith: cmd.commandData.Usage },
                            { searchFor: /{command-aliases}/g, replaceWith: cmd.commandData.Aliases.length > 0 ? cmd.commandData.Aliases.join(", ") : "None" },
                            { searchFor: /{command-isSlashEnabled}/g, replaceWith: cmd.commandData.SlashCommand.Enabled ? "✅" : "❌" },
                        ]
                    })
                ]
            })
        } else {
            interaction.editReply({
                ephemeral: true,
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.General.Help,
                        variables: [
                            ...Utils.userVariables(interaction.member),
                            ...Utils.botVariables(bot),
                            { searchFor: /{error}/g, replaceWith: `Unable to find \`${command}\` command` },
                        ]
                    })
                ]
            })
        }
    }
}