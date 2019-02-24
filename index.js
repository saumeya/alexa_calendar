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
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';
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
      getEmail(accessToken, res => {
        // //   const slots = handlerInput.requestEnvelope.request.intent.slots;
        // //   const timeSpec = slots.Time.value.toString();
        //   console.log(timeSpec);
        //   var hrSpec = parseInt(timeSpec.substring(0,2));
        //   hrSpec = hrSpec + 12;
        //   console.log(hrSpec);
        // var event = res.items[2].summary;
      //  console.log(res.items[2].start.dateTime);
        // var c = 0;
        // var speechText = "Your next event is ";
        //     var hr = parseInt(dateStr.substring(11,13));
        //     var min = parseInt(dateStr.substring(14,16))
        //    // console.log(hr);
        //     if(hr==14&&min==30)
        //   //if(hr==hrSpec)
        //     {
        //          speechText = speechText + res.items[c].summary + " ";
        //     }

        //     c++;
        // }
       var speechText = 'Your next events are ' ;
       for(var i=0;i<res.items.length;i++)
       {
           speechText = speechText + res.items[i].summary+" ";
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

function getEmail(accessToken, callback) {

  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
   // 'content-type': 'application/json'
  };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2019-01-18T10:00:00-07:00&orderBy=startTime&singleEvents=true', header)
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

const CalendarQueryHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalendarQuery';
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

        console.log(slots.FirstName.value.toString());
        console.log(slots.FirstName.value.toString());

        var email = slots.FirstName.value.toString()+"."+slots.LastName.value.toString()+"@cumminscollege.in";
      return new Promise(resolve => {
      query(accessToken, email, res => {
        
       var speechText = 'Your next events is ' ;
       for(var i=0;i<res.items.length;i++)
       {
           speechText = speechText + res.items[i].summary+" ";
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

function query(accessToken, email,callback) {

  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
   // 'content-type': 'application/json'
  };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/'+email+'/events?timeMin=2019-01-14T10:00:00-07:00&orderBy=startTime&singleEvents=true', header)
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
                          CalendarQueryHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();