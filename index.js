require("dotenv")
const {
    Client,
    MessageEmbed,
    MessageAttachment
} = require("discord.js");
const db = require("quick.db")

const Discord = require('discord.js');
const client = new Client({
    disableEveryone: true
})
const keepAlive = require('./server.js')
keepAlive()
client.on("ready", async () => {
    console.clear()
    console.log(`${client.user.tag} is online`)
})
const picExt = [".webp", ".png", ".jpg", ".jpeg", ".gif"];
const videoExt = [".webm", ".mp4", ".mov"];

const channel_logger_id = require("./config").channel_id
const prefix = require("./config").prefix

client.on("messageDelete", async (message) => {
    if (message.author.bot) return;
    let check_data = await db.get("logs")
    if (check_data == null) await db.set("logs", [])
    let logs = await db.get("logs")
    logs.unshift({
        content: message.content,
        author: message.author,
        image: message.attachments.first() ?
            message.attachments.first().proxyURL :
            null,
        date: new Date().toLocaleString("en-GB", {
            dataStyle: "full",
            timeStyle: "short",
        }),
    });
    logs.splice(10);
    await db.set("logs", logs)
    const attachment = message.attachments.first() ? message.attachments.first().proxyURL : null
    let description = `message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "message has no content"}`
    let check = false
    let embed = new MessageEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL({
            dynamic: true
        }))
        .setColor(`RANDOM`)
        .setFooter(client.user.tag, client.user.avatarURL({
            dynamic: true
        }))
        .setTimestamp()
    if (attachment != null) {
    picExt.forEach(async (ext) => {
        if (attachment.endsWith(ext)) {
            check = true
        }
    })
    if (check == true) {
        embed.setImage(attachment)
        embed.setDescription(description)
    } else {
        description = `message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "message has no content"}\n**Attachment**\n[Click here](${attachment})`
        embed.setDescription(description)
    }
    } else embed.setDescription(description)
    let channel = message.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
    if (!channel) return;
    channel.send(embed);
});
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return;
    let check_data = await db.get("logs")
    if (check_data == null) await db.set("logs", [])
    let logs = await db.get("logs")
    logs.unshift({
        content: oldMessage.content,
        author: oldMessage.author,
        image: oldMessage.attachments.first() ?
            oldMessage.attachments.first().proxyURL :
            null,
        date: new Date().toLocaleString("en-GB", {
            dataStyle: "full",
            timeStyle: "short",
        }),
    });
    logs.splice(10);
    await db.set("logs", logs)

    let embed = new MessageEmbed()
        .setAuthor(oldMessage.author.tag, oldMessage.author.avatarURL({
            dynamic: true
        }))
        .setDescription(`
      message updated in ${oldMessage.channel}
      **Before**\n${oldMessage.content ? oldMessage.content : "message has no content"}
      **After**\n${newMessage.content ? newMessage.content : "message has no content"}
      `)
        .setColor(`RANDOM`)
        .setImage(oldMessage.attachments.first() ? oldMessage.attachments.first().proxyURL : null)
        .setFooter(client.user.tag, client.user.avatarURL({
            dynamic: true
        }))
        .setTimestamp()
    let channel = oldMessage.guild.channels.cache.find((ch) => ch.id === channel_logger_id);
    if (!channel) return;
    channel.send(embed);
});
client.on("message", async (message, args) => {
    if (message.author.bot) return
    if (message.content.replace(/ /g, '').toLowerCase().startsWith(prefix + "snipe")) {
        var args = message.content.split(" ").slice(0)
        var args = args.slice(1)
        let check_data = await db.get("logs")
        if (check_data == null) await db.set("logs", [])
        const snipes = await db.get("logs")
        const msg = snipes[args[0] - 1 || 0];
        if (!msg) return message.channel.send(`That is not a valid snipe...`);
        const author = message.guild.members.cache.get(msg.author.id)
        let description = `**Content**\n${msg.content}`
        const Embed = new MessageEmbed()
            .setColor("RANDOM")
            .setAuthor(
                author.user.tag,
                author.user.displayAvatarURL({
                    dynamic: true
                })
            )
            .setFooter(`Date: ${msg.date} | ${args[0] || 1}/${snipes.length}`)
        let check = false
        if (msg.image != null) {
        picExt.forEach(async (ext) => {
            if (msg.image.endsWith(ext)) {
                check = true
            }
        })
        if (check == true) {
            Embed.setImage(msg.image)
            Embed.setDescription(description)
        } else {
            description = `message deleted in ${message.channel}\n**Content**\n${message.content ? message.content : "message has no content"}\n**Attachment**\n[Click here](${msg.image})`
            Embed.setDescription(description)
        }
        } else Embed.setDescription(description)
        message.channel.send(Embed);
    }
})

client.login(process.env.TOKEN);