var rules = require("./read.js");
let date = require('date-and-time');
module.exports={
	add:function(data){
		if(data.items[0]!=undefined &&  data.items[0].organizer.email!=undefined){
		console.log("\nEVENT DATA\n")
			var eventID = data.items[0].id;
			console.log(eventID);

			var id = data.summary;
			console.log('user id: '+id);

			var Organizer = data.items[0].organizer.email;
			//var Organizer = "saumeya.katyal@cumminscollege.in";
			console.log('organzer: '+Organizer);

			var Topic=data.items[0].summary;
			console.log('topic: '+Topic);

			var startTime=data.items[0].start.dateTime;
			console.log('start time: '+startTime);

			var endTime = data.items[0].end.dateTime;
			console.log('end time: '+endTime);

			var strTime=startTime.substring(0,19);
			var now=new Date(strTime);			
			var EventDay=date.format(now,'dddd');
			//EventDay = EventDay.toLowerCase();
			console.log('day: '+EventDay);
			
			var DayTime;
			var t=startTime.substring(11,16);
			if(t<="11:59"){
				DayTime="morning";
			}
			else if(t>="12:00" && t<"15:00"){
				DayTime="afternoon";
			}
			else{
				DayTime="evening";
			}
			console.log('daytime: '+DayTime);
			rules.acceptParameters(id, eventID, Organizer,Topic,EventDay, DayTime);
		}
		else{
			console.log(data.items[0]);
		}
	
	}
};