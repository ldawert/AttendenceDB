import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

// Declare used Collections
const PresenceDB = new Mongo.Collection('studentsPresence');
const ListDB = new Mongo.Collection('studentsList');

// Funtion for getting todays date in the right format
function getDate(){
	var d = new Date();
	return d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2).toString() + d.getDate().toString().slice(-2);
}

// Funtion for getting right time in the right format
function getTime(){
	var d = new Date();
	var time = d.getHours().toString() + d.getMinutes().toString();
	return parseInt(time, 10);
}

// Funtion to determine the current block lesson
function getBlock(time){
	if (745 < time && time < 915){
		var block = 1;
	} else if (915 < time && time < 1100){
		var block = 2;
	} else if (1100 < time && time < 1245){
		var block = 3;
	} else if (1245 < time && time < 1800){
		var block = 4;
	} else {
		var block = 0;
	}
	return block;
}

// List Students that are present today
Template.body.helpers({
	presentStudents: function() {
		var date = getDate();
		return PresenceDB.find({date: date});
	}
});


Template.body.events({
	// Update the presence for a scanned Student for a specific lesson or Create the Document if neccissary
	'submit .insertStudent': function(event) {
		var date = getDate();
		var time = getTime();
		var now = getBlock(time);
		var userInput = event.target.beacon.value;
		const scannedStudent = ListDB.find(
			{beaconID: userInput},
      {firstName: 1, lastName: 1}
    ).fetch();
		const inPresenceList = PresenceDB.find(
			{beaconID: userInput, date: date},
			{_id: 1}
		).fetch();
		let isExisting = (inPresenceList[0] == null ? false : true);
		if (now != 0){
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
					date: date
		    });
				var nowBlock = "block" + now;
				var obj = {};
      	obj[nowBlock] = true;
				PresenceDB.update(
					{_id: newObjectID},
					{$set: obj}
				);
			} else {
				alert("update started");
				var nowBlock = "block" + now;
				var obj = {};
      	obj[nowBlock] = true;
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
