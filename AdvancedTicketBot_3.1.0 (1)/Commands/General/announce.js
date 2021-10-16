const Discord = require('discord.js');
const Utils = require('../../Modules/Utils')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { config, commands, lang } = require('../../index');
const TUtils = require('../../Modules/Ticket')

module.exports = {
    name: "announce",
    type: 'general',
    commandData: commands.General.Announce,
    slashData: new SlashCommandBuilder()
        .setName("announce")
        .setDescription(commands.General.Announce.Description)
        .addStringOption(o => o.setName('title').setDescription("Embed's Title"))
        .addStringOption(o => o.setName('text').setDescription("Embed's Description"))
        .addStringOption(o => o.setName('footer').setDescription("Embed's Footer"))
        .addStringOption(o => o.setName('footer-icon').setDescription("Embed's Footer Icon URL"))
        .addStringOption(o => o.setName('author').setDescription("Embed's Author"))
        .addStringOption(o => o.setName('author-icon').setDescription("Embed's Authors Icon URL"))
        .addStringOption(o => o.setName('image').setDescription("Embed's Image URL (Bigger Image)"))
        .addStringOption(o => o.setName('thumbnail').setDescription("Embed's Thumbnail URL (Smaller Image)"))
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Message} message 
 * @param {Array} args 
 * @param {Object} config 
 */
module.exports.run = async (bot, message, args, config) => {
    if(!args[0]) return message.reply({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.Presets.Error,
                variables: [
                    { searchFor: /{error}/g, replaceWith: `Invalid Usage \`${commands.General.Announce.Usage}\`` },
                    ...Utils.userVariables(message.member)
                ]
            })
        ]
    })
    message.channel.send({
        embeds: [
            Utils.setupEmbed({
                configPath: lang.General.Announcement,
                variables: [
                    { searchFor: /{text}/g, replaceWith: args.join(" ") },
                    ...Utils.userVariables(message.member)
                ]
            })
        ]
    }).then(m => {
        message.delete()
    })
}

/**
 * 
 * @param {Discord.Client} bot 
 * @param {Discord.Interaction} interaction 
 */
module.exports.runSlash = async (bot, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    
    let title = interaction.options.getString('title')
    let description = interaction.options.getString('text')
    let footer = interaction.options.getString('footer')
    let footerIcon = interaction.options.getString('footer-icon')
    let author = interaction.options.getString('author')
    let authorIcon = interaction.options.getString('author-icon')
    let image = interaction.options.getString('image')
    let thumbnail = interaction.options.getString('thumbnail')

    let announcementEmbed = {
        Title: title ? title : null,
        Description: description ? description : null,
        Footer: footer ? footer : null,
        FooterIcon: footerIcon ? footerIcon : null,
        Author: author ? author : null,
        AuthorIcon: authorIcon ? authorIcon : null,
        Image: image ? image : null,
        Thumbnail: thumbnail ? thumbnail : null
    }

    await interaction.channel.send({
        embeds: [
            Utils.setupEmbed({
                configPath: announcementEmbed,
                variables: [
                    ...Utils.userVariables(interaction.member),
                    ...Utils.botVariables(bot)
                ]
            })
        ]
    })
    interaction.editReply({
        content: "Message Sent",
        ephemeral: true
    })
}