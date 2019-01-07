'use strict';
const Alexa = require('ask-sdk-core');
<<<<<<< HEAD
const Request = require('request-promise');
const axios = require('axios');

=======
const Request = require('request');
>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
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
<<<<<<< HEAD
      return new Promise(resolve => {
      getEmail(accessToken, res => {
        var event = res.items[0].summary;
=======
   	  return new Promise(resolve => {
      getEmail(accessToken, res => {
      	var event = res.items[0].summary;
>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
        var speechText = 'Your next events is ' + event;
        resolve(
          handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        );
      });
<<<<<<< HEAD
    });                
=======
    });      	       
>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
   }      
  }
};

function getEmail(accessToken, callback) {

  const header = {
    headers: {'Authorization': 'Bearer ' + accessToken }
   // 'content-type': 'application/json'
  };

  axios
    .get('https://www.googleapis.com/calendar/v3/calendars/primary/events', header)
    .then(response => {
<<<<<<< HEAD
      console.log(response.data);                                   
=======
      console.log(response.data);       							
>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
      console.log(response.data.items[0].summary);
      console.log(response.data.items[0].creator.email);
       console.log(response.data.items[0].start.dateTime);
     // var d = JSON.parse(response.data.items[0].creator)
      //console.log(d.email);
      callback(response.data);
    });
}
<<<<<<< HEAD

=======
	    
>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
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
                         CalendarBasicHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();
<<<<<<< HEAD
=======
















>>>>>>> c318d4cb0d7f405a75ca221fab43a888020179a3
