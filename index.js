'use strict';
const Alexa = require('ask-sdk-core');
const Request = require('request-promise');
const axios = require('axios');
const moment = require('moment');
const AWS = require('aws-sdk');
const uuid = require('uuid');

var config = {
    "apiVersion": "latest",
    "accessKeyId": "fakeMyKeyId",
    "secretAccessKey": "fakeSecretAccessKey",
    "region":"Asia Pacific(Mumbai)",
    "endpoint": "http://localhost:8000"
  }
  var dynamodb = new AWS.DynamoDB(config);
  
  AWS.config.update(config);
  let docClient = new AWS.DynamoDB.DocumentClient();

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

const CalendarCreateHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CalenderCreate';
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
            const eventName = slots.EventName.value.toString();
            const eventDate = slots.EventDate.value.toString();
            const startTime = slots.EventStartTime.value.toString();
            const endTime = slots.EventEndTime.value.toString();   
             
            var names = [];
            var email = {};
            var nameCnt =0;
            for(var slotKey in slots)
            {
               // console.log(slotKey);
                if(slotKey.includes('Name')&&slotKey.length==5&&slots[slotKey].value!=undefined)
                {
                   //console.log(slotKey);
                   console.log(slots[slotKey].resolutions.resolutionsPerAuthority[0].values[0].value.id.toString());
                   email = slots[slotKey].resolutions.resolutionsPerAuthority[0].values[0].value.id.toString();
                //    names[nameCnt] = emailList;
                names.push({"email":email});
                nameCnt++;
                }
            }
            console.log(names);
        const data = {
            "sendUpdates":true,
            "end": {
              "dateTime": eventDate+"T"+endTime+":00+05:30"
            },
            "start": {
              "dateTime": eventDate+"T"+startTime+":00+05:30"
            },
            "summary": eventName,
            "attendees":names
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

  const  CalendarFreeBusyHandler = {
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
            var freeHrStart;//Which hour and minute to start looking for free slots from
            var freeMinStart;
            if(slots.EventDate.value!=undefined)
            {
                var dateFree = slots.EventDate.value.toString();
                freeHrStart = 0;
                freeMinStart = 0;
            }
            else
            {
                var currentdate = new Date(); 
                var dateFree = "" + currentdate.getFullYear() + "-"
                                + (currentdate.getMonth()+1)  + "-" 
                                + currentdate.getDate();

                freeHrStart = currentdate.getHours();
                freeMinStart = currentdate.getMinutes();
            }
            console.log(dateFree);
            var dur = slots.Duration.value;
            var duration = 1;
            if(slots.Duration.value!=undefined)
            {
                duration  = 2 * parseInt(slots.Duration.value.substring(2,3));
            }
            var names = [];
            var email = {};
            var nameCnt =0;
            for(var slotKey in slots)
            {
                if(slotKey.includes('Name')&&slotKey.length==5&&slots[slotKey].value!=undefined)
                {
                   email = slots[slotKey].resolutions.resolutionsPerAuthority[0].values[0].value.id.toString();
                names.push({"id":email});
                nameCnt++;
                }

            }
    
        const data ={
            
                "timeMin": dateFree+"T00:00:00+05:30",
                "timeMax": dateFree+"T23:00:00+05:30",
                "timeZone": "Asia/Kolkata",
                "groupExpansionMax": 4,
                "calendarExpansionMax": 4,
                // "items": [
                //   {
                //     "id": email1
                //   },
                //   {
                //     "id": email2
                //   },
                //   {
                //     "id": "saumeya.katyal@cumminscollege.in"
                //   }
                // ]
              "items":names
        };
            return new Promise(resolve => {
            freeBusyFunc(accessToken, data, res => {
              
             //   console.log(res);
                var i=0;
                var firstID = "";
                const busy1 = {};
                
                for(var calID in res.calendars)
                {
                    var busyArr1 = [];
                    console.log(calID);
                    console.log(res.calendars[calID]);
                    if(i==0)
                    {
                        firstID = firstID+calID; 
                        i++;
                    }   
               
                    var slotCounter=0;
                    var j=0;
                    while(j<16)
                    {
                       // console.log("Length: "+res.calendars[calID].busy.length);
                       if(slotCounter<res.calendars[calID].busy.length)
                       {
                            var startHr = parseInt(res.calendars[calID].busy[slotCounter].start.substring(11,13));
                            var startMins = parseInt(res.calendars[calID].busy[slotCounter].start.substring(14,16));
                            var endHr = parseInt(res.calendars[calID].busy[slotCounter].end.substring(11,13));
                            var endMins = parseInt(res.calendars[calID].busy[slotCounter].end.substring(14,16));
                       }

                       if(startMins==0&&endMins==0)
                       {
                           endHr = endHr - 9;
                           endHr += endHr;
                           startHr = startHr - 9;
                           startHr += startHr;

                           if(j==startHr)
                           {
                               busyArr1[j] = 0;
                              
                               slotCounter+=1;
                               for(var k=j+1;k<endHr;k++)
                               {
                                  
                                   busyArr1[k] = 0;
                                   j+=1;
                                 
                               }
                               j++;
                           }
                           else
                           {
                            busyArr1[j] = 1;
                            j++;
                           }
                       }
                       else if(startMins==30&&endMins==30)
                       {
                        endHr = endHr - 9;
                        endHr += endHr;
                        startHr = startHr - 9;
                        startHr += startHr;

                        if(j==startHr+1)
                        {
                            busyArr1[j] = 0;
                           
                            slotCounter+=1;
                            for(var k=j+1;k<=endHr;k++)
                            {
                            
                                busyArr1[k] = 0;
                                j+=1;
                             
                            }
                            j++;
                        }
                        else
                        {
                         busyArr1[j] = 1;
                         j++;
                        }
                       }
                       else if(startMins==0&&endMins==30)
                       {  
                        endHr = endHr - 9;
                        endHr += endHr;
                        startHr = startHr - 9;
                        startHr += startHr;

                        if(j==startHr)
                        {
                            busyArr1[j] = 0;
                         
                            slotCounter+=1;
                            for(var k=j+1;k<=endHr;k++)
                            {
                             
                                busyArr1[k] = 0;
                                j+=1;
                              
                            }
                            j++;
                        }
                        else
                        {
                         busyArr1[j] = 1;
                         j++;
                        }
                       }
                       else if(startMins==30&&endMins==0)
                       {
                        endHr = endHr - 9;
                        endHr += endHr;
                        startHr = startHr - 9;
                        startHr += startHr;

                        if(j==startHr+1)
                        {
                            busyArr1[j] = 0;
                           
                            slotCounter+=1;
                            for(var k=j+1;k<endHr;k++)
                            {
                             
                                busyArr1[k] = 0;
                                j+=1;
                               
                            }
                            j++;
                        }
                        else
                        {
                         busyArr1[j] = 1;
                         j++;
                        }
                       }
                       else
                       {
                           busyArr1[j] = 1;
                           j++;
                       }
                    }
                  //console.log(busyArr1);
                   busy1[calID] = busyArr1;
                }

                console.log(busy1);
                console.log(firstID);
                
               var free = busy1[firstID];
              
                for(var id1 in busy1)
                {
                        for(var j=0;j<16;j++)
                        {
                            free[j] = free[j] & busy1[id1][j];
                        }
                }
                console.log(free);
                var speechText = "They are free ";
                 
                i=0;
                var t1,t2;
                var st;
                if(freeHrStart==0)
                {
                    st=0;
                }
                else
                {
                        freeHrStart -= 9;
                        freeHrStart += freeHrStart;
                        if(freeMinStart<30)
                            freeHrStart +=1;
                        else
                            freeHrStart +=2;
                        st = freeHrStart;
                }
                console.log(st);
                for(var j=st;j<16;j++)
                {
                    if(free[j]!=0)
                    {
                        i++;
                    }
                   
                    else{
                       
                        if(i>=duration)
                        {
                            t1 = j-i;
                            t2 = j;
                            console.log(j); console.log(i)
                            console.log(t1);
                            console.log(t2);
                            if(t1<4&&t1%2==0)
                                 t1+=9;
                            else if(t1<4&&t1%2!=0)
                            {
                                t1+=7;
                                t1 = t1.toString();
                                t1 = t1 + ":30"
                            }
                            else if(t1>=4&&t1%2==0)
                            {
                                //t1-=3;
                                t1 = t1/2;
                                t1=t1+9;
                                console.log(t1);
                            }
                            else
                            {
                                // t1-=2;
                                t1 = parseInt(t1/2);
                                console.log(t1);
                                t1=t1+9;
                                t1 = t1.toString();
                                t1 = t1 + ":30"
                                console.log(t1);
                            }
                            
                            
                            if(t2<4&&t2%2==0)
                                 t2+=9;
                            else if(t2<4&&t2%2!=0)
                            {
                                t2+=7;
                                t2 = t2.toString();
                                t2 = t2 + ":30"
                            }
                            else if(t2>=4&&t2%2==0)
                            {
                               // t2-=3;
                               t2 = t2/2;
                               t2=t2+9;
                            }
                            else
                            {
                              //  t2-=2;
                              t2 = parseInt(t2/2);
                              t2=t2+9;
                                t2 = t2.toString();
                                t2 = t2 + ":30"
                            }

                            speechText = speechText + t1 + " to " +t2+", ";
                           // i=0;
                           while(free[j]==0)
                           {
                               j=j+1;
                           }
                           j=j-1;
                            console.log(speechText);
                        }
                        i = 0;
                        console.log(j);
                    }
                    if(j==15&&i>=duration)
                    {
                        
                        t1 = j+1-i;
                        t2 = j+1;
                        if(t1<4&&t1%2==0)
                            t1+=9;
                        else if(t1<4&&t1%2!=0)
                        {
                            t1+=7;
                            t1 = t1.toString();
                            t1 = t1 + ":30"
                        }
                        else if(t1>=4&&t1%2==0)
                        {
                            //t1-=3;
                            t1 = t1/2;
                            t1=t1+9;
                        }
                        else
                        {
                           // t1-=2;
                           t1 = parseInt(t1/2);
                           t1=t1+9;
                            t1 = t1.toString();
                            t1 = t1 + ":30"
                        }
                                    
                        if(t2<4&&t2%2==0)
                        t2+=9;
                        else if(t2<4&&t2%2==0)
                        {
                            t2+=7;
                            t2 = t2.toString();
                            t2 = t2 + ":30"
                        }
                        else if(t2>=4&&t2%2==0)
                        {
                            //t2-=3;
                            t2 = t2/2;
                            t2=t2+9;
                        }
                        else
                        {
                            // t2-=2;
                            t2 = parseInt(t2/2);
                            t2=t2+9;
                            t2 = t2.toString();
                            t2 = t2 + ":30"
                        }
     
                        speechText = speechText +t1 + " to " +t2;
                        console.log(speechText);
                    }
                }
               console.log(free);
               if(speechText=="They are free "){
                   speechText = "They are not available";
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
}

function freeBusyFunc(accessToken, data, callback) {

    const header = {
      headers: {'Authorization': 'Bearer ' + accessToken }

    };

    axios
      .post('https://www.googleapis.com/calendar/v3/freeBusy',data, header)
      .then(response => {

        console.log("Free Busy data")
        console.log(response.data);
        callback(response.data);
      }).catch((error) => {
        console.log('Error occurred : '+error);
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

        var email;
        var speechText ;
        if(slots.FirstName.value==undefined)
        {
            email = 'primary';
            speechText = 'You have ' ;
        }
       else{
        email = handlerInput.requestEnvelope.request.intent.slots.FirstName.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        speechText = slots.FirstName.value.toString() + ' has ' ;
       }   
      console.log(email);
      return new Promise(resolve => {
      query(accessToken, email, time, date, res => {
        
      
      
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

console.log(email);
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

const AddRuleHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AddRule';
    },
    handle(handlerInput) {
         
      return new Promise(resolve => {
      
        const slots = handlerInput.requestEnvelope.request.intent.slots;
  
        var input={};
        input["KeyName"] = uuid.v4();
        for(var slotKey in slots)
        {
          //console.log(slotKey);
         // console.log(slotKey.value);
          if(slots[slotKey].value == undefined)
          {
            continue;
          }
          else
          {
  
            var key = slotKey;
            var value;
            if(key.includes('Organizer'))
            {
                value = slots[slotKey].resolutions.resolutionsPerAuthority[0].values[0].value.id.toString();
            }
            else{
              value = slots[slotKey].value;
            }
            
            input[key] = value;
          }
        }
        input["Id"] = "krutika.sarode@cumminscollege.in";
      console.log(input);
  
   var params = {
       TableName: "CalRulesStored",
       Item:  input
   };
   docClient.put(params, function (err, data) {
  
       if (err) {
           console.log("users::save::error - " + JSON.stringify(err, null, 2));                      
       } else {
           console.log("users::save::success" );                      
       }
   });
      var speechText = "Hello";
        resolve(
          handlerInput.responseBuilder
            .withShouldEndSession(true)
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        );
      });    
  }
  };


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
                         CalendarCreateHandler,
                         CalendarFreeBusyHandler,
                         CalendarQueryHandler,
                         AddRuleHandler,
                         HelpIntentHandler,
                         CancelAndStopIntentHandler,
                         SessionEndedRequestHandler)
     .lambda();