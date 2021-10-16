const Discord = require('discord.js')
const Utils = require('../Modules/Utils')
const TUtils = require('../Modules/Ticket')
const { MessageActionRow, MessageButton } = require('discord.js');

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports = async (bot, interaction) => {
    const { config, lang, SlashCmds } = bot; 
    let permissions = []
    if(interaction.isCommand()) {
        const command = SlashCmds.find(x => x.name.toLowerCase() == interaction.commandName.toLowerCase());
        if(!command) {
            let cmd = bot.guilds.cache.get(bot.config.GuildID).commands.cache.find(x => x.name.toLowerCase() == interaction.commandName.toLowerCase())
            if(cmd) cmd.delete()
            return interaction.reply({ content: "This command no longer exists.", ephemeral: true })
        }
        if(command.commandData.Permission) {
            if(typeof command.commandData.Permission == 'string') 
                command.commandData.Permission = [command.Permission]

            if(!command.commandData.Permission[0])
                command.commandData.Permission[0] = "@everyone"
            

            for (const role of command.commandData.Permission) {
                if (!Utils.hasRole(interaction.member, role, true)) {
                    permissions.push(false)
                } else {
                    permissions.push(true)
                }
            }
        }

        if(permissions.includes(true)) {
            command.runSlash(bot, interaction)
        } else {
            interaction.reply({ 
                ephemeral: true,
                embeds: [
                    Utils.setupEmbed({
                        configPath: lang.Presets.NoPermission,
                        variables: [
                            { searchFor: /{roles}/g, replaceWith: command.commandData.Permission.map(r => {
                                let role = Utils.findRole(r, interaction.guild, true)
                                if(role) return `<@&${role.id}>` }).join(", ")},
                            ...Utils.userVariables(interaction.member)
                        ]
                    })
                ]
            })}

    } else if(interaction.isButton()) {
        let { channel, guild, member } = interaction;
        if(interaction.customId.toLowerCase().startsWith('panel-setup')) return;
        switch(interaction.customId) {
            case 'create_ticket': {
                TUtils.createTicketInteraction(interaction, "Created via Ticket Creation Panel")
                break;
            }
            case 'close_ticket': {
                TUtils.closeTicketInteraction(interaction, "Closed by Close Ticket Button")
                break;
            }
            default: {
                let category = TUtils.getTicketCategory(interaction.customId, config.Categories)
                if(category) {
                    let answers = [], data = {
                        ticketDetails: await TUtils.isTicket(guild, channel),
                        category: category.Ticket.Category ? Utils.findChannel(category.Ticket.Category, guild, 'GUILD_CATEGORY', true) : false,
                        supportRoles: "",
                    }
                    if(data.ticketDetails) {
                        let message = await channel.messages.fetch(data.ticketDetails.message)
                        // SUB CATEGORIES
                        if(category.Ticket.SubCategories) {
                            let notesAndData = "", actionRows = {
                                1: new MessageActionRow(),2: new MessageActionRow(),
                                3: new MessageActionRow(), 4: new MessageActionRow(), 5: new MessageActionRow()
                            }, btns = [], ticketCategories = category.Ticket.SubCategories
                            for (let i = 1; i <= 5; i++) {
                                if(ticketCategories[i] && ticketCategories[i].length > 0) {
                                    if(ticketCategories[i].length > 5) {
                                        Utils.logError(`${category.Ticket.Title} SubCategories Row ${i} has more then 5 Buttons & Max Buttons per category is 5`)
                                        process.exit(0)
                                    } else {
                                        ticketCategories[i].forEach(x => {
                                            if(x.Ticket) 
                                                notesAndData += `\n**${x.Ticket.Title}** ${x.Ticket.Note ? `- ${x.Ticket.Note}` : ""}`
                                            
                                            actionRows[i].addComponents([
                                                Utils.parseButton(x.Button)
                                            ])
                                        })
                                    }
                                }
                            }
                            for (let x = 1; x <= 5; x++) {
                                if(actionRows[x].components.length > 0 && actionRows[x].components.length <= 5) {
                                    btns.push(actionRows[x])
                                }
                            }
                            interaction.update({
                                embeds: [
                                    Utils.setupEmbed({
                                        configPath: lang.MenuOptions,
                                        variables: [
                                            ...Utils.userVariables(member),
                                            { searchFor: /{data}/g, replaceWith: notesAndData }  
                                        ]
                                    })
                                ],
                                components: btns
                            })
                        } else {
                            if(category.Ticket.SupportRoles) {
                                category.Ticket.SupportRoles.forEach(r => {
                                    let role = Utils.findRole(r, guild, true)
                                    if(role) {
                                        data.supportRoles += ` <@&${role.id}>`
                                    }
                                })
                            }
                            if(category.Ticket.ChannelName) {
                                let newName = await TUtils.getTicketChannelName(interaction.guild, interaction.member, category.Ticket.ChannelName)
                                await channel.setName(newName)
                            }
                            
                            if(data.category) await channel.setParent(data.category, { lockPermissions: false })
    
                            let permissions = [
                                {
                                    // Support Role
                                    id: Utils.findRole(config.Tickets.DefaultSupport, guild, true).id,
                                    allow: [
                                        Discord.Permissions.FLAGS.VIEW_CHANNEL,
                                        Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
                                        Discord.Permissions.FLAGS.SEND_MESSAGES,
                                        Discord.Permissions.FLAGS.EMBED_LINKS,
                                        Discord.Permissions.FLAGS.ATTACH_FILES
                                    ]
                                },
                                {
                                    id: member.user.id,
                                    allow: [
                                        Discord.Permissions.FLAGS.VIEW_CHANNEL,
                                        Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
                                        Discord.Permissions.FLAGS.SEND_MESSAGES,
                                        Discord.Permissions.FLAGS.EMBED_LINKS,
                                        Discord.Permissions.FLAGS.ATTACH_FILES
                                    ]
                                },
                                {
                                    id: guild.id,
                                    deny: [
                                        Discord.Permissions.FLAGS.VIEW_CHANNEL,
                                        Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
                                        Discord.Permissions.FLAGS.SEND_MESSAGES,
                                    ]
                                }
                            ]
                            if(category.Ticket.SupportRoles) {
                                category.Ticket.SupportRoles.forEach(x => {
                                    let role = Utils.findRole(x, channel.guild, "GUILD_TEXT", true)
                                    if(role) {
                                        permissions.push({
                                            id: role.id,
                                            allow: [
                                                Discord.Permissions.FLAGS.VIEW_CHANNEL,
                                                Discord.Permissions.FLAGS.READ_MESSAGE_HISTORY,
                                                Discord.Permissions.FLAGS.SEND_MESSAGES,
                                                Discord.Permissions.FLAGS.EMBED_LINKS,
                                                Discord.Permissions.FLAGS.ATTACH_FILES
                                            ]
                                        })
                                    }
                                })
                            }
                            await channel.permissionOverwrites.set(permissions);
                            if(category.Ticket.Questions) {
                                for (let index = 0; index < category.Ticket.Questions.length; index++) {
                                    const question = category.Ticket.Questions[index];
                                    interaction.update({
                                        embeds: [
                                            Utils.setupEmbed({
                                                configPath: lang.MenuQuestionLayout,
                                                variables: [
                                                    ...Utils.userVariables(member),
                                                    { searchFor: /{category}/g, replaceWith: category.Ticket.Title },
                                                    { searchFor: /{question}/g, replaceWith: question },
                                                    { searchFor: /{min}/g, replaceWith: index + 1 },
                                                    { searchFor: /{max}/g, replaceWith: category.Ticket.Questions.length }
                                                ]
                                            })
                                        ],
                                        components: []
                                    })
                                    var filter = m => m.author.id == member.user.id
                                    await interaction.channel.awaitMessages({ filter, max: 1 }).then(async msgs => {
                                        answers.push({ index: index + 1, question: question, response: msgs?.first()?.content || " " })
                                        await msgs.first().delete().catch(e => {})
                                    })
                                }
                                await message.delete()
                                answers = answers.map(x => {
                                    return lang.ResponseEmbed.Layout
                                        .replace(/{question}/g, x.question)
                                        .replace(/{answer}/g, x.response)
                                        .replace(/{index}/g, x.index)
                                }).join("\n")
    
                                interaction.channel.send({
                                    embeds: [
                                        Utils.setupEmbed({
                                            configPath: lang.ResponseEmbed,
                                            variables: [
                                                ...Utils.userVariables(member),
                                                ...Utils.botVariables(bot),
                                                { searchFor: /{category}/g, replaceWith: category.Ticket.Title },
                                                { searchFor: /{data}/g, replaceWith: answers },
                                            ]
                                        })
                                    ],
                                    components: config.Tickets.CloseButton.Enabled ? [
                                        new MessageActionRow({ components: [
                                            Utils.parseButton(config.Tickets.CloseButton, 'close_ticket')
                                        ]})
                                    ] : null
                                })
    
                            } else {
                                await message.delete()
                                interaction.channel.send({
                                    embeds: [
                                        Utils.setupEmbed({
                                            configPath: lang.Menu,
                                            variables: [
                                                ...Utils.userVariables(member),
                                                ...Utils.botVariables(bot)
                                            ]
                                        })
                                    ],
                                    components: config.Tickets.CloseButton.Enabled ? [
                                        new MessageActionRow({ components: [
                                            Utils.parseButton(config.Tickets.CloseButton, 'close_ticket')
                                        ]})
                                    ] : null
                                })
                            }
                            
                            if(data.supportRoles) {
                                channel.send({ 
                                    content: data.supportRoles
                                }).then(m => {
                                    if(m.deletable) setTimeout(async () => {
                                        await m.delete()
                                    }, 2500);
                                })
                            }
                        }
                    }
                }
                break;
            }
        }
    } else if(interaction.isSelectMenu()) {

    }
}
module.exports.once = false