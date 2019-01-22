import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './main.html';

// Declare used collections
const PresenceDB = new Mongo.Collection('studentsPresence');
const ListDB = new Mongo.Collection('studentsList');


// Function to set date displayed in the menu and the session variables when the page finished loading
window.onload = function() {
    document.getElementById('current_date').textContent = getCurrentDate(1);
    Session.set('selectedDate', getCurrentDate(0));
    Session.set('selectedDateFormatted', getCurrentDate(1));
    // To prevent the bug that the following called function can't fetch the students from the ListDB, it's nested into the setTimeout()
    setTimeout(function () {
        generatePresenceDatabaseEntries();
    }, 500);
};

// Prototype function to work with objects of the type Date() setting the dates for database and graphical usage
Date.prototype.setDate = function (n) {
    let year = Number(Session.get('selectedDate').slice(0, 4));
    let month = Number(Session.get('selectedDate').slice(4, 6));
    let day = Number(Session.get('selectedDate').slice(6, 8));
    let condA = false;
    let condB = false;
    if((day + n) > daysInMonth(month, year)) {
        // The number for the next day is bigger then the amount of days the current month has
        condA = true;
        month++;
    } if((day + n) < 1) {
        // The number for the next day is less then 1
        condB = true;
        month--;
    } if(!condA && !condB) {
        // When none of the above condition is true: De-/Increment the number of the new day
        day = day + n;
    } else {
        if(month < 1) {
            // Check if the new month is less then 1
            month = 12;
            year--;
        } if(month > 12) {
            // Check if the new month is more then 12
            month = 1;
            year++;
        } if(condA) {
            // If we change to the next month set the day to 1
            day = 1;
        } else {
            // If we change to the previous month set the day to the last day of that month
            day = daysInMonth(month, year);
        }
    }
    // Set the session variables for the dates for database and graphical usage
    Session.set('selectedDate', '' + year + ('0' + month).slice(-2) + ('0' + day).slice(-2));
    Session.set('selectedDateFormatted', ('0' + day).slice(-2) + '.' + ('0' + month).slice(-2) + '.' + year);
};

// Function for getting the number of days for a month depending on the month and year
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

// Function for getting today's date in the right format
function getCurrentDate(n){
    let d = new Date();
    if(n === 0) {
        // Return the date in the format: YYYYMMDD
        return d.getFullYear() + ('0' + (d.getMonth() + 1)).toString().slice(-2) + d.getDate().toString().slice(-2);
    } else {
        // Return the date in the format: DD.MM.YYYY
        return d.getDate().toString().slice(-2) + '.' + ('0' + (d.getMonth() + 1)).toString().slice(-2) + '.' + d.getFullYear();
    }
}

// Function for getting right time in the right format
function getTime(){
    let t = new Date();
    const time = ('0' + t.getHours()).toString().slice(-2) + ('0' + t.getMinutes()).toString().slice(-2);
    return parseInt(time, 10);
}

// Function to determine the current block lesson
function getBlock(time){
    let block = 0;
    if (745 < time && time < 915){
        block = 1;
    } else if (915 < time && time < 1100){
        block = 2;
    } else if (1100 < time && time < 1245){
        block = 3;
    } else if (1245 < time && time < 1505){
        block = 4;
    }
    return block;
}

// Generate a new set of database entries for each student
function generatePresenceDatabaseEntries() {
    // Create an array filled with the information for each student presences
    const match = PresenceDB.find({date: Session.get('selectedDate')}).fetch();
    if(match[0] == null) {
        // If the array of presences is empty create a new array filled with the needed information for each student
        const allStudents = ListDB.find().fetch();
        // Go through each student element and create a new presence entry
        for(i = 0; i < allStudents.length; i++) {
            PresenceDB.insert({
                _id: newObjectID = new Mongo.ObjectID(),
                beaconID: allStudents[i].beaconID,
                firstName: allStudents[i].firstName,
                lastName: allStudents[i].lastName,
                block1: false,
                block2: false,
                block3: false,
                block4: false,
                checkbox1: newObjectID1 = new Mongo.ObjectID(),
                checkbox2: newObjectID2 = new Mongo.ObjectID(),
                checkbox3: newObjectID3 = new Mongo.ObjectID(),
                checkbox4: newObjectID4 = new Mongo.ObjectID(),
                date: Session.get('selectedDate')
            })
        }
    }
}

// List students that are present today
Template.body.helpers({
    presentStudents: function() {
        // By using a session variable as a search key, the content of the website is changed dynamically
        return PresenceDB.find({date: Session.get('selectedDate')});
    }
});

Template.body.events({
    // Update the presence for a scanned student for a specific lesson or create the document if necessary
    'submit .insertStudent': function(event) {
        const time = getTime();
        const currentBlock = getBlock(time);
        const userInput = event.target.beacon.value;
        const inPresenceList = PresenceDB.find(
            {beaconID: userInput, date: Session.get('selectedDate')},
            {_id: 1}
        ).fetch();
        // Check if the teacher registers a beacon out of the school time
        if (currentBlock !== 0){
            if (inPresenceList[0] == null){
                // If there is no presence list generate a new one.
                generatePresenceDatabaseEntries();
                const currentBlockString = 'block' + currentBlock;
                let obj = {};
                obj[currentBlockString] = true;
                // Set the presence of a student for the current block
                PresenceDB.update(
                    {_id: newObjectID},
                    {$set: obj}
                );
            } else {
                const currentBlockString = 'block' + currentBlock;
                let obj = {};
                obj[currentBlockString] = true;
                // Set the presence of a student for the current block
                PresenceDB.update(
                    {_id: inPresenceList[0]._id},
                    {$set: obj}
                );
            }
        } else {
            alert('Außerhalb der Schulzeiten!');
        }
        // Clear the beacon input text box
        event.target.beacon.value = '';
        // Prevent the website from reloading after a presence is scanned
        return false;
    },
    'click .previousDateClick': function() {
        // When the user selects the previous day
        let d = new Date();
        d.setDate(-1);
        document.getElementById('current_date').textContent = Session.get('selectedDateFormatted');
        const match = PresenceDB.find({date: Session.get('selectedDate')}).fetch();
        generatePresenceDatabaseEntries();
    },
    'click .nextDateClick': function() {
        // When the user selects the next day
        let d = new Date();
        d.setDate(1);
        document.getElementById('current_date').textContent = Session.get('selectedDateFormatted');
        generatePresenceDatabaseEntries();
    }
});

// Template event listener to save the manually changed presences of a student
Template.listingPresence.events({
    'click .toggled1': function() {
        PresenceDB.update(this._id, { $set: {block1: !this.block1}})
    },
    'click .toggled2': function() {
        PresenceDB.update(this._id, { $set: {block2: !this.block2}})
    },
    'click .toggled3': function() {
        PresenceDB.update(this._id, { $set: {block3: !this.block3}})
    },
    'click .toggled4': function() {
        PresenceDB.update(this._id, { $set: {block4: !this.block4}})
    }
});
