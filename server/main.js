import { Meteor } from 'meteor/meteor';

const PresenceDB = new Mongo.Collection('studentsPresence');
const ListDB = new Mongo.Collection('studentsList');


function getDate(){
	var d = new Date();
	return d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2).toString() + d.getDate().toString().slice(-2);
}

function init(){
  var date = getDate();
  const allStudents = ListDB.find().fetch();
  for (var student of allStudents){
    PresenceDB.insert(
    {
      _id: newObjectID = new Mongo.ObjectID(),
      beaconID: student.beaconID,
      firstName: student.firstName,
      lastName: student.lastName,
      block1: false,
      block2: false,
      block3: false,
      block4: false,
      date: date
    });
  }
}


Meteor.startup(() => {
  // code to run on server at startup
  	init();
  });