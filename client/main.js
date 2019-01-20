import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
//import {init} from '../server/main.js';

// Declare used collections
const PresenceDB = new Mongo.Collection('studentsPresence');
const ListDB = new Mongo.Collection('studentsList');

let selectedDate = getDate();

window.onload = function () {
    //init();
};

// Function for getting today's date in the right format
function getDate(){
    let d = new Date();
    return d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2).toString() + d.getDate().toString().slice(-2);
}

// Function for getting right time in the right format
function getTime(){
    let t = new Date();
    const time = t.getHours().toString() + t.getMinutes().toString();
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
    } else if (1245 < time && time < 1800){
        block = 4;
    }
    return block;
}

// List students that are present today
Template.body.helpers({
    presentStudents: function() {
        //const date = getDate();
        //return PresenceDB.find({date: date});
        return PresenceDB.find({date: selectedDate});
    }
});

Template.body.events({
    // Update the presence for a scanned student for a specific lesson or create the document if necessary
    'submit .insertStudent': function(event) {
        const date = getDate();
        const time = getTime();
        const currentBlock = getBlock(time);
        const userInput = event.target.beacon.value;
        const scannedStudent = ListDB.find(
            {beaconID: userInput},
            {firstName: 1, lastName: 1}
        ).fetch();
        const inPresenceList = PresenceDB.find(
            {beaconID: userInput, date: date},
            {_id: 1}
        ).fetch();
        let isExisting = (inPresenceList[0] != null);
        if (currentBlock !== 0){
            if (!isExisting){
                PresenceDB.insert(
                    {
                        _id: newObjectID = new Mongo.ObjectID(),
                        beaconID: userInput,
                        firstName: scannedStudent[0].firstName,
                        lastName: scannedStudent[0].lastName,
                        block1: false,
                        block2: false,
                        block3: false,
                        block4: false,
                        checkbox1: newObjectID1 = new Mongo.ObjectID(),
                        checkbox2: newObjectID2 = new Mongo.ObjectID(),
                        checkbox3: newObjectID3 = new Mongo.ObjectID(),
                        checkbox4: newObjectID4 = new Mongo.ObjectID(),
                        date: date
                    });
                const currentBlockString = "block" + currentBlock;
                let obj = {};
                obj[currentBlockString] = true;
                PresenceDB.update(
                    {_id: newObjectID},
                    {$set: obj}
                );
            } else {
                alert("update started");
                const currentBlockString = "block" + currentBlock;
                let obj = {};
                obj[currentBlockString] = true;
                PresenceDB.update(
                    {_id: inPresenceList[0]._id},
                    {$set: obj}
                );
            }
        } else {
            alert("Außerhalb der Schulzeiten!");
        }
        event.target.beacon.value = "";
        return false;
    }
});


Template.listingPresence.events({
    'click .toggled1': function() {
        alert(this._id);
        PresenceDB.update(this._id, { $set: {block1: !this.block1}})
    },
    'click .toggled2': function() {
        alert(this._id);
        PresenceDB.update(this._id, { $set: {block2: !this.block2}})
    },
    'click .toggled3': function() {
        alert(this._id);
        PresenceDB.update(this._id, { $set: {block3: !this.block3}})
    },
    'click .toggled4': function() {
        alert(this._id);
        PresenceDB.update(this._id, { $set: {block4: !this.block4}})
    }
});
