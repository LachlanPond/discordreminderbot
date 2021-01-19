const Discord = require('discord.js');
const client = new Discord.Client();
const Database = require('./classes');

if (process.env.NODE_ENV != 'production') {
    console.log('Running in Development mode');
    require('dotenv').config();
}

const database = new Database(process.env.DATABASE_FILE);

client.login(process.env.TOKEN_BOT);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.content.startsWith('!reminders')) {
        console.log(`Command from ${msg.author.username}: !reminders`);
        let reminders = database.getReminderList(msg.author.id, msg.author.username);
        if (!reminders.length) {
            msg.reply("You don't have any reminders. Use !remindme [reminder message] to set one.");
            return;
        }
        let replyMessage = "```";
        reminders.forEach((reminder, index) => {
            replyMessage += `${index}. ${reminder.message}\n`;
        });
        replyMessage += "```";
        msg.reply(replyMessage);
        console.log(`Replied to ${msg.author.username}'s !reminders command`);
    }
    if (msg.content.startsWith('!remindme')) {
        console.log(`Command from ${msg.author.username}: !remindme`);
        let reminder = msg.content.slice(msg.content.indexOf(' ')+1);
        database.addReminder(msg.author.id, msg.author.username, reminder);
        console.log(`Added reminder for ${msg.author.username}: ${msg.content.slice(msg.content.indexOf(' ')+1)}`);
    }
});