'use strict';
const Alexa = require('ask-sdk-core');
const Request = require('request-promise');
const axios = require('axios');

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
        //     const data = {
        //         "end": {
        //           "dateTime": "2019-01-23T"+slots.EventEndTime.value.toString()+"+05:30"
        //         },
        //         "start": {
        //           "dateTime": "2019-01-23T"+slots.EventStartTime.value.toString()+"+05:30"
        //         },
        //         "summary": slots.EventName.value.toString()
        // };
        console.log(eventName);
        console.log(slots.EventStartTime.value.toString());
        console.log(slots.EventEndTime.value.toString());
            const data = {
            "end": {
              "dateTime": "2019-01-23T"+slots.EventEndTime.value.toString()+":00+05:30"
            },
            "start": {
              "dateTime": "2019-01-23T"+slots.EventStartTime.value.toString()+":00+05:30"
            },
            "summary": eventName 
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
  
    // const data = {
    //         "end": {
    //           "dateTime": "2019-01-23T12:00:00+05:30"
    //         },
    //         "start": {
    //           "dateTime": "2019-01-23T11:00:00+05:30"
    //         },
    //         "summary": summary 
    // };
    axios
      .post('https://www.googleapis.com/calendar/v3/calendars/primary/events',data, header)
      .then(response => {

        console.log("Inserted the event")
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
        var event = res.items[2].summary;
      //  console.log(res.items[2].start.dateTime);
        var c = 0;
        var speechText = "Your next event is ";
        while(c<=2){
            //if(res.items.start.dateTime==)
           
            var dateStr = res.items[c].start.dateTime.toString();
            //console.log(dateStr);
            var hr = parseInt(dateStr.substring(11,13));
            var min = parseInt(dateStr.substring(14,16))
           // console.log(hr);
            if(hr==14&&min==30)
          //if(hr==hrSpec)
            {
                 speechText = speechText + res.items[c].summary + " ";
            }

            c++;
        }
      //  var speechText = 'Your next events is ' + event;
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
    .get('https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2019-01-14T10:00:00-07:00', header)
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
                          CalendarBasicHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();