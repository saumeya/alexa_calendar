var rules = require("./read.js");
let date = require('date-and-time');
module.exports={
	add:function(auth, calendar, data){
		if(data.items[0]!=undefined){

			var eventID = data.items[0].id;
			console.log(eventID);

			var id = data.summary;
			console.log(id);

			var Organizer = data.items[0].organizer.email;
			console.log(Organizer);

			var Topic=data.items[0].summary;
			console.log(Topic);

			var startTime=data.items[0].start.dateTime;
			console.log(startTime);

			var endTime = data.items[0].end.dateTime;
			console.log(endTime);

			var strTime=startTime.substring(0,19);
			var now=new Date(strTime);			
			var EventDay=date.format(now,'dddd');
			EventDay = EventDay.toLowerCase();
			console.log(EventDay);
			
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
			console.log(DayTime);
			//rules.acceptParameters(auth, calendar, id, eventID, Organizer,Topic,EventDay, DayTime);
		}
		else{
			console.log(data.items[0]);
		}
	
	}
};