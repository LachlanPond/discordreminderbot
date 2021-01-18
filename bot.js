const Discord = require('discord.js');
const client = new Discord.Client();
let commands = require('./commands.js');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!ping')) {
        msg.reply('Pong!');
        console.log(msg.author);
    }
    if (msg.content.startsWith('!reminders')) {
        console.log(`Command from ${msg.author.username}: !reminders`);
        let response = commands.getRemindListResponse(msg);
        msg.reply(response);
        console.log(`Replied to ${msg.author.username}'s !reminders command`);
    }
    if (msg.content.startsWith('!remindme')) {
        console.log(`Command from ${msg.author.username}: !remindme`);
        commands.addReminder(msg);
        console.log(`Added reminder for ${msg.author.username}: ${msg.content.slice(msg.content.indexOf(' ')+1)}`);
    }
});

if (process.env.NODE_ENV != 'production') {
    console.log('Running in Development mode');
    require('dotenv').config();
}
client.login(process.env.TOKEN_BOT);