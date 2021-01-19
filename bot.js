const Discord = require('discord.js');
const client = new Discord.Client();
const Database = require('./classes');
const fs = require('fs');

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
            msg.reply("```You don't have any reminders. Use !remindme [reminder message] to set one.```");
            return;
        }

        // Construct the message to be sent back to the user
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

        // Get the reminder message by seperating out the command
        let reminder = msg.content.slice(msg.content.indexOf(' ')+1);
        database.addReminder(msg.author.id, msg.author.username, reminder);
        msg.reply("```" + `Reminder added: ${reminder}` + "```");

        console.log(`Added reminder for ${msg.author.username}: ${msg.content.slice(msg.content.indexOf(' ')+1)}`);
    }

    if (msg.content.startsWith('!reminderdelete')) {
        console.log(`Command from ${msg.author.username}: !reminderdelete`);

        try {
            if (msg.content.split(' ').length === 1) {
                msg.reply(`Please specify the number of the reminder you wish to delete`);
                return;
            }
            let reminderNumber = msg.content.split(' ')[1];
            let reminder = database.deleteReminder(msg.author.id, reminderNumber);
            msg.reply("```" + `Reminder deleted: ${reminder}` + "```");
            console.log(`Deleted reminder for ${msg.author.username}: ${reminder}`);
        }
        catch (err) {
            if (err.message == 'No reminders') {
                msg.reply("```You have no reminders to delete```");
                return;
            }
            if (err.message == 'Reminder number is not an integer') {
                msg.reply("```The reminder number must be an integer```");
                return;
            }
            if (err.message == 'Reminder number out of bounds') {
                msg.reply("```" + `The reminder number you gave is out of bounds. Expected values are from 0-${database.getReminderList(msg.author.id, msg.author.username).length-1}` + "```");
                return;
            }
        }
    }

    if (msg.content.startsWith('!help')) {
        console.log(`Command from ${msg.author.username}: !help`);

        msg.reply("```" + getHelpMessage() + "```");

        console.log(`Replied to ${msg.author.username}'s !help command`);
    }
    
});

function getHelpMessage() {
    try {
        return fs.readFileSync(process.env.HELP_FILE);
    }
    catch (err) {
        console.log(`Reading help file failed: ${err.message}`);
        return "Could not read help message file";
    }
}