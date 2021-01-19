const fs = require('fs');

module.exports = class Database {
    constructor(file) {
        this.database = null;
        this.file = file;
        this.loadFromFile()
    }
    loadFromFile() {
        try {
            fs.writeFileSync(this.file, '{}', {flag: 'wx'})
            this.database = JSON.parse(fs.readFileSync(this.file));
        }
        catch (err) {
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
}