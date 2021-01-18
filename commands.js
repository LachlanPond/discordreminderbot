const fs = require('fs');

function getRemindListResponse(msg) {
    let database = JSON.parse(fs.readFileSync('database.json'));
    let reminders = database[msg.author.id].reminders;
    let response = "```";
    reminders.forEach((reminder, index) => {
        response += `${index}. ${reminder.message}\n`;
    });
    response += "```";
    return response;
}

function addReminder(msg) {
    let database = JSON.parse(fs.readFileSync('database.json'));
    let reminders = database[msg.author.id].reminders;
    reminders.push(
        {
            "message": msg.content.slice(msg.content.indexOf(' ')+1),
            "timestamp": Date.now()
        }
    );
    database[msg.author.id].reminders = reminders;
    let databasestring = JSON.stringify(database, null, 4);
    fs.writeFileSync('database.json', databasestring);
}

exports.getRemindListResponse = getRemindListResponse;
exports.addReminder = addReminder;