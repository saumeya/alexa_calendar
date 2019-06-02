const readline = require('readline-sync');
var CryptoJS = require("crypto-js");
var AWS = require("aws-sdk");
const axios = require('axios');

  var config = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": "AKIAVMHJ4Y6S7ZAUNLTL", "secretAccessKey": "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"
};
  var dynamodb = new AWS.DynamoDB(config);

  AWS.config.update(config);

let docClient = new AWS.DynamoDB.DocumentClient();
var object = {};

var res;
var resAccess;
module.exports = {
    acceptParameters : function(id, eventID, organizer, topic, day, dayTime){
        object.Id = id;
        object.eventID = eventID;
        object.Organizer = organizer;
        object.Topic = topic;
        object.EventDay = day;
        object.DayTime = dayTime;       
        if(organizer!=id){
          readDB(createKB);
      }
    }
}

    let readDB = function(callback) { 
    var params = {
    TableName: "CalRulesStored",
    FilterExpression: '#id = :id',
    ExpressionAttributeNames: {'#id': 'Id',},
    ExpressionAttributeValues: {':id': object.Id,},
    };
    docClient.scan(params, function (err, data) {
        if (err) {
            console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
        }
        else {
          
            res = data;           
            callback();
        }
    })
}

var kb = [];

    let createKB = function(){

    for(var i=0;i<res.Items.length;i++){
        var conclusion = {};
        var premise = [];
        var Rule = new Object();
        for(var keyWord in res.Items[i]){
             var obj = {};
             var valArr = [];
            if(keyWord.includes("KeyName")||keyWord.includes("Id")){
                continue;
            }
            else{
                if(keyWord.includes("State") || keyWord.includes("PreferredState"))
                {
                    conclusion.attribute = keyWord;
                    conclusion.value = res.Items[i][keyWord];
                  }
                else {
                    obj.attribute = keyWord;
                    valArr[0] = res.Items[i][keyWord];
                    if(keyWord=== "Organizer"){
                        valArr[1] = 5;
                    }
                    else if(keyWord=== "DayTime"){
                        valArr[1] = 4;
                    }
                    else if(keyWord=== "EventDay"){
                        valArr[1] = 3;
                    }
                    else if(keyWord=== "Topic"){
                        valArr[1] = 2;
                    }
                    obj.value = valArr;
                    premise.push(obj);
                }   
            }

        }

      Rule.premises = premise;
      Rule.conclusion = conclusion;
      kb.push(Rule);
     }
     
    let assertions = [];
    let attribute = 1;
    
   
     for(var key in object)
     {
        var assertObj = {};
        assertObj.attribute = key;
        assertObj.value = object[key];
        assertions.push(assertObj);
     }
if(kb.length != 0){
    assertions = forwardChain(assertions);
    console.log("\nASSERTIONS\n")
    console.log(assertions);
}
    var flag = 0;
     var Maxcnt=0;
     var result="";
    var responseS = "accept";
       for(var i=0;i<assertions.length;i++)
    {
     
     if(assertions[i].attribute==="State" || assertions[i].attribute==="PreferredState" )
      {
        if(assertions[i].value[1]>Maxcnt){
          Maxcnt=assertions[i].value[1];
          responseS=assertions[i].value[0];
        }
        
      }
    }
     if(responseS === "always accept"||responseS ==="always attend"||responseS ==="accept"||responseS ==="affirm")
        {
          console.log("\nAccept the meeting");
          responseS = "accepted"; 
          
        }
        else
        {
          console.log("\nDecline the meeting");
          responseS = "declined";
          
        }
 
getAccessToken(patchFunc,responseS);
}

    let getAccessToken = function(callback,responseS) { 

    var params = {
    TableName: "StoreAccessToken",
    FilterExpression: '#id = :id',
    ExpressionAttributeNames: {'#id': 'Id',},
    ExpressionAttributeValues: {':id': object.Id,},
    };
    docClient.scan(params, function (err, data) {
        if (err) {
            console.log("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
        }
        else {
            resAccess = data;        
            callback(responseS);
        }
    })
}

let patchFunc = function(responseS){
      var event_id =  object.eventID;
   const data = {
             "attendees": [
        {
          "email": object.Id, 
          "responseStatus": responseS
        }
      ]                    
    };
    const header = {
      headers: {'Authorization': 'Bearer ' + resAccess.Items[0]["accessToken"] }
     };
     axios
      .patch('https://www.googleapis.com/calendar/v3/calendars/'+object.Id+'/events/'+event_id+"?alwaysIncludeEmail=true&sendNotifications=true",data, header)
      .then(response => {

        console.log("\nPatched Successfully")
        //callback(response.data);
      }).catch((error) => {
        console.log('\nError occurred : '+error);
    });
      const rawMessage = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(
        'From: '+object.Id+'\r\n' +
        'To: '+object.Id+'\r\n' +
        'Subject: Alexa Calendar Notification\r\n\r\n' +
        'You have '+responseS+' '+object.Topic+' meeting.'
      )).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      var dataObject = {
        "raw":rawMessage
 };
    var accessToken = resAccess.Items[0]["accessToken"];
    const header2 = {
      headers: {'Authorization': 'Bearer ' +  resAccess.Items[0]["accessToken"].toString(),
      'Accept' : 'application/json',
      'content-type': 'application/json' }
    };

    axios
      .post('https://www.googleapis.com/gmail/v1/users/me/messages/send',dataObject,header2)
      .then(response => {   
          console.log('\nNotification sent : ');
      }).catch((error) => {
        console.log('\nError occurred : '+error);
    });
}

const forwardChain = function(assertions) {
 
  let ruleIndex = 0;
  let rule = kb[ruleIndex];
  var i =0;
  var cnt = 0;

  for(ruleIndex = 0;ruleIndex<kb.length;ruleIndex++){
     rule = kb[ruleIndex];
        cnt=0;
        var priCount=0; 
        for(var i=0;i<rule.premises.length;i++){
          priCount=0;
          for(var j=0;j<assertions.length;j++){
            if(assertions[j].attribute === rule.premises[i].attribute){
              if(assertions[j].value=== rule.premises[i].value[0]){
                cnt++;
                if(rule.premises[i].value[1]>priCount){
                  priCount = rule.premises[i].value[1];
                }
              }
            }
          }
        }

        if(cnt==rule.premises.length && !assertions.some(assertion => assertion.attribute === rule.conclusion.attribute && assertion.value[0] === rule.conclusion.value)){
            var attribute = rule.conclusion.attribute;
            var val = [];
            val[0] = rule.conclusion.value;
            val[1] = priCount;
            var obj = {};
            obj.attribute = attribute;
            obj.value = val;
            assertions.push(obj);
            ruleIndex = 0;                
        }
  }
  return assertions;
};