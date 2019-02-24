'use strict';
const Alexa = require('ask-sdk-core');
const Request = require('request-promise');
const axios = require('axios');
const moment = require('moment');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Hi, I am your Alexa Calendar Delegator! You can ask me any information about your calendar and save your preferences by saying Save Rules.';
return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hello World!';
         console.log('res');
return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const CalendarCreateHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalenderCreate';
    },
    handle(handlerInput){
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

        if (accessToken == undefined){
            // The request did not include a token, so tell the user to link
            // accounts and return a LinkAccount card
            var speechText = "Your calendar account is not linked";        
           
            return handlerInput.responseBuilder
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }
        else { 
            const slots = handlerInput.requestEnvelope.request.intent.slots;
            const eventName = slots.EventName.value.toString();

        console.log(eventName);
        console.log(slots.EventStartTime.value.toString());
        console.log(slots.EventEndTime.value.toString());
        console.log(slots.FirstName.value.toString());
        console.log(slots.LastName.value.toString());
            const data = {
            "end": {
              "dateTime": "2019-01-29T"+slots.EventEndTime.value.toString()+":00+05:30"
            },
            "start": {
              "dateTime": "2019-01-29T"+slots.EventStartTime.value.toString()+":00+05:30"
            },
            "summary": eventName,
            "attendees": [
                {
                  "email": slots.FirstName.value.toString()+"."+slots.LastName.value.toString()+"@cumminscollege.in"
                }
              ]
    };
            return new Promise(resolve => {
            insertEvent(accessToken, data, res => {
                console.log(res.status);
                
              var speechText = "Your event has been created ";
              resolve(
                handlerInput.responseBuilder
                  .speak(speechText)
                  .reprompt(speechText)
                  .getResponse()
              );
            });
          });                
         }
    }
}

function insertEvent(accessToken, data, callback) {

    const header = {
      headers: {'Authorization': 'Bearer ' + accessToken }
     // 'content-type': 'application/json'
    };

    axios
      .post('https://www.googleapis.com/calendar/v3/calendars/primary/events',data, header)
      .then(response => {

        console.log("Inserted the event")
        callback(response.data);
      }).catch((error) => {
        console.log('Error occurred : '+error);
    });

  }

  const CalendarFreeBusyHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FreeBusy';
    },
    handle(handlerInput){
        var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

        if (accessToken == undefined){

            var speechText = "Your calendar account is not linked";        
           
            return handlerInput.responseBuilder
                .speak(speechText)
                .withLinkAccountCard()
                .getResponse();
        }
        else { 
            const slots = handlerInput.requestEnvelope.request.intent.slots;
          
       
        const data ={
            
                "timeMin": "2019-01-29T00:00:00+05:30",
                "timeMax": "2019-01-29T23:00:00+05:30",
                "timeZone": "Asia/Kolkata",
                "groupExpansionMax": 4,
                "calendarExpansionMax": 4,
                "items": [
                  {
                    "id": "priya.andurkar@cumminscollege.in"
                  },
                  {
                    "id": "roshani.aher@cumminscollege.in"
                  },
                  {
                    "id": "saumeya.katyal@cumminscollege.in"
                  }
                ]
              
        };
            return new Promise(resolve => {
            freeBusyFunc(accessToken, data, res => {
                
                //console.log(res.calendars);
                
                var speechText = "Here ";
                var i=0;
                var firstID = "";
                const busy1 = {};

                for(var calID in res.calendars)
                {
                    var busyArr1 = [];

                    if(i==0)
                     {
                        firstID = firstID+calID; 
                        i++;
                    }   
               
                    var slotCounter=0;
                    var free = [];
                    for(var j=0;j<24;j++)
                    {
                       if(slotCounter<res.calendars[calID].busy.length)
                       {
                            var hour = parseInt(res.calendars[calID].busy[slotCounter].start.substring(11,13));
                       }

                       if(j==hour)
                       {
                           busyArr1[j] = 0;
                           slotCounter = slotCounter+1;
                       }
                       else{
                           busyArr1[j] = 1;

                       }
                    }
                  
                   busy1[calID] = busyArr1;
                }

                console.log(busy1);
                console.log(firstID);
                
               free = busy1[firstID];
              console.log(free);

                for(var id1 in busy1)
                {
                        for(var j=0;j<24;j++)
                        {
                            free[j] = free[j] & busy1[id1][j];
                        }
                }
               console.log(free);

              resolve(
                handlerInput.responseBuilder
                  .speak(speechText)
                  .reprompt(speechText)
                  .getResponse()
              );
            });
          });                
         }
    }
}

function freeBusyFunc(accessToken, data, callback) {

    const header = {
      headers: {'Authorization': 'Bearer ' + accessToken }

    };

    axios
      .post('https://www.googleapis.com/calendar/v3/freeBusy',data, header)
      .then(response => {

        console.log("Free Busy data")
        callback(response.data);
      }).catch((error) => {
        console.log('Error occurred : '+error);
    });

  }

const CalendarBasicHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalendarBasic';
    },
    handle(handlerInput) {
         var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        // var result;
    if (accessToken == undefined){
        // The request did not include a token, so tell the user to link
        // accounts and return a LinkAccount card
        var speechText = "Your calendar account is not linked";        
       
        return handlerInput.responseBuilder
            .speak(speechText)
            .withLinkAccountCard()
            .getResponse();
    } 
    else { 
      return new Promise(resolve => {
      getEvent(accessToken, res => {
       //const slots = handlerInput.requestEnvelope.request.intent.slots;
        
      // console.log(slots.Time.value.toString());

       var speechText = 'Your next event is ' ;
       //for(var i=0;i<res.items.length;i++)
       //{
        var t = moment(res.items[0].start.dateTime).format("dddd, Do MMMM , h:mm:ss a"); 
           speechText = speechText + res.items[0].summary+ " scheduled on " + t;
       //}

        resolve(
          handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        );
      });
    });                
   }      
  }
};

function getEvent(accessToken, callback) {
console.log('hi');
//console.log(moment().format("YYYY-MM-DDTHH:mm:ssZ"));
var d = new Date();
var time1 = ISODateString(d);
//console.log(ISODateString(d)); // prints something like 2009-09-28T19:03:12Z
console.log(time1);
  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
   // 'content-type': 'application/json'
  };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + time1 + '&orderBy=startTime&singleEvents=true', header)
    .then(response => {
      console.log(response.data);                                   
      console.log(response.data.items[0].summary);
      console.log(response.data.items[0].creator.email);
      console.log(response.data.items[0].start.dateTime);
     // var d = JSON.parse(response.data.items[0].creator)
      //console.log(d.email);
      callback(response.data);
    });
}
function ISODateString(d){
 function pad(n){return n<10 ? '0'+n : n}
 return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'}

const CalendarSlotQueryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalendarSlotQuery';
    },
    handle(handlerInput) {
         var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        
    if (accessToken == undefined){
        // The request did not include a token, so tell the user to link
        // accounts and return a LinkAccount card
        var speechText = "Your calendar account is not linked";        
       
        return handlerInput.responseBuilder
            .speak(speechText)
            .withLinkAccountCard()
            .getResponse();
    } 
    else { 
       const slots = handlerInput.requestEnvelope.request.intent.slots;
       const time = slots.EventTime.value.toString();
       const date = slots.EventDate.value.toString();
        
       console.log(time);
       console.log(date);
      
      return new Promise(resolve => {
      getEvents(accessToken, time, date, res => {

        var speechText = 'You have ' ;
      
        if(res.items[0] === undefined){
          speechText = speechText + "nothing scheduled for that time."
        }
        else{
        var t = moment(res.items[0].start.dateTime).format("dddd, Do MMMM , h:mm:ss a"); 
           speechText = speechText + res.items[0].summary+ " scheduled on " + t;
       }

        resolve(
          handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        );
      });
    });                
   }      
  }
};

function getEvents(accessToken, time, date, callback) {
console.log('hi');

const istTime = date + " " +time;
console.log(istTime);
const durationInMinutes = '330';

const utcTime = moment(istTime, 'YYYY-MM-DD HH:mm').subtract(durationInMinutes, 'minutes').format('YYYY-MM-DD HH:mm');
console.log(utcTime);
var time2 = utcTime.slice(0, 10) + "T" + utcTime.slice(11) + ":00Z";
console.log(time2);

var time3 = utcTime.slice(0, 10) + "T" + utcTime.slice(11) + ":30Z";
//console.log(ISODateString(d)); // prints something like 2009-09-28T19:03:12Z
//console.log(time1);
  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
   // 'content-type': 'application/json'
  };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + time2 + '&timeMax=' + time3 + '&orderBy=startTime&singleEvents=true', header)
    .then(response => {
      console.log(response.data);                                   
     // console.log(response.data.items[0].summary);
      //onsole.log(response.data.items[0].creator.email);
      //console.log(response.data.items[0].start.dateTime);
     // var d = JSON.parse(response.data.items[0].creator)
      //console.log(d.email);
      callback(response.data);
    });
}

const CalendarQueryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalendarQueryOther';
    },
    handle(handlerInput) {
         var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
        // var result;
    if (accessToken == undefined){
        // The request did not include a token, so tell the user to link
        // accounts and return a LinkAccount card
        var speechText = "Your calendar account is not linked";        
       
        return handlerInput.responseBuilder
            .speak(speechText)
            .withLinkAccountCard()
            .getResponse();
    } 
    else { 
        const slots = handlerInput.requestEnvelope.request.intent.slots;

        const time = slots.EventTime.value.toString();
        const date = slots.EventDate.value.toString();

        console.log(slots.FirstName.value.toString());
     //   console.log(slots.FirstName.id.toString());
        //console.log(slots.LastName.value.toString());

        //var email = slots.FirstName.value.toString()+"."+slots.LastName.value.toString()+"@cumminscollege.in";
     var email = handlerInput.requestEnvelope.request.intent.slots.FirstName.resolutions.resolutionsPerAuthority[0].values[0].value.id;
      console.log(email);
      return new Promise(resolve => {
      query(accessToken, email, time, date, res => {
        
       var speechText = slots.FirstName.value.toString() + ' has ' ;
      
        if(res.items[0] === undefined){
          speechText = speechText + "nothing scheduled for that time."
        }
        else{
        var t = moment(res.items[0].start.dateTime).format("dddd, Do MMMM , h:mm:ss a"); 
           speechText = speechText + res.items[0].summary+ " scheduled on " + t;
       }

        resolve(
          handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        );
      });
    });                
   }      
  }
};

function query(accessToken, email, time, date, callback) {

  const istTime = date + " " +time;
console.log(istTime);
const durationInMinutes = '330';

const utcTime = moment(istTime, 'YYYY-MM-DD HH:mm').subtract(durationInMinutes, 'minutes').format('YYYY-MM-DD HH:mm');
console.log(utcTime);
var time2 = utcTime.slice(0, 10) + "T" + utcTime.slice(11) + ":00Z";
console.log(time2);

var time3 = utcTime.slice(0, 10) + "T" + utcTime.slice(11) + ":30Z";

  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
    };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/'+email+'/events?timeMin=' + time2 + '&timeMax=' + time3 + '&orderBy=startTime&singleEvents=true', header)
    .then(response => {
      console.log(response.data);                                   
      
      callback(response.data);
    });
}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';
return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
    }
};
const ErrorHandler = {
    canHandle() {
      return true;
    },
    handle(handlerInput, error) {
      console.log(`Error handled: ${error.message}`);
return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
    },
};

exports.handler = Alexa.SkillBuilders.custom()
     .addRequestHandlers(LaunchRequestHandler,
                         HelloWorldIntentHandler,
                         CalendarCreateHandler,
                         CalendarFreeBusyHandler,
                         CalendarBasicHandler,
                         CalendarSlotQueryHandler,
                         CalendarQueryHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();