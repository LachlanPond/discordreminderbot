const fs = require('fs');

module.exports = class Database {
    constructor(file) {
        this.database = null;
        this.file = file;
        this.loadFromFile()
    }

    // Load the database from the database file given in the constructor
    loadFromFile() {
        // Try to make the database file if it does not exist
        try {
            fs.writeFileSync(this.file, '{}', {flag: 'wx'})
            this.database = JSON.parse(fs.readFileSync(this.file));
        }
        catch (err) {
            // If it does exist, fs.writeFileSync will throw an error with code EEXIST
            if (err.code === 'EEXIST') {
                try {
                    this.database = JSON.parse(fs.readFileSync(this.file));
                }
                catch(err) {
                    console.error(`Reading database file failed: ${err.message}`);
                    process.exit(1);
                }
            }
            else {
                console.error(`Creating database file failed: ${err.message}`);
                process.exit(1);
            }
        }
    }

    writeToFile() {
        fs.writeFileSync(this.file, JSON.stringify(this.database, null, 4));
    }

    getReminderList(userID, userName) {
        if (!this.database.hasOwnProperty(userID)) {
            this.addUser(userID, userName);
        }
        return this.database[userID].reminders;
    }

    addReminder(userID, userName, reminder) {
        if (!this.database.hasOwnProperty(userID)) {
            this.addUser(userID, userName);
        }
        this.database[userID].reminders.push(
            {
                "message": reminder,
                "timestamp": Date.now()
            }
        );
        this.writeToFile();
    }

    addUser(userID, userName) {
        this.database[userID] = {
            "name": userName,
            "reminders": []
        }
        this.writeToFile();
    }

    deleteUser(userID) {
        delete this.database[userID];
        this.writeToFile();
    }

    deleteReminder(userID, reminderNumber) {
        let reminders = this.database[userID].reminders;
        if (reminders.length === 0) {
            console.log(`There are no reminders to delete`);
            throw new Error('No reminders');
        }
        if (!isInt(reminderNumber)) {
            console.log(`Reminder number is not an integer: ${reminderNumber}`);
            throw new Error('Reminder number is not an integer');
        }
        if (reminderNumber < 0 || reminderNumber > reminders.length-1) {
            console.log(`Reminder number out of range (0-${reminders.length-1}): ${reminderNumber}`);
            throw new Error('Reminder number out of bounds');
        }
        reminderNumber = parseInt(reminderNumber);
        let reminderMessage = this.database[userID].reminders[reminderNumber].message;

        this.database[userID].reminders.splice(reminderNumber, 1);
        this.writeToFile();
        return reminderMessage;
    }
}

function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}