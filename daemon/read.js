const readline = require('readline-sync');
var AWS = require("aws-sdk");
//var indexApi = require("./index.js")
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
var object = {};
var cal = {};
var res;

module.exports = {
    acceptParameters : function(auth, calendar, id, eventID, organizer, topic, day, dayTime){
        object.Id = id;
        object.eventID = eventID;
        object.Organizer = organizer;
        object.Topic = topic;
        object.EventDay = day;
        object.DayTime = dayTime;
        cal.auth = auth;
        cal.calendar = calendar;
        readDB(createKB);
        //  acceptParameters : function(id, organizer, topic, day, dayTime){
        // object.Id = id;
        
        // object.Organizer = organizer;
        // object.Topic = topic;
        // object.EventDay = day;
        // object.DayTime = dayTime;
        
        // readDB(createKB);
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

    let createKB = function()
{


    for(var i=0;i<res.Items.length;i++)
    {
        var conclusion = {};
        var premise = [];
        var Rule = new Object();
        for(var keyWord in res.Items[i])
        {
             var obj = {};
            if(keyWord.includes("KeyName")||keyWord.includes("Id"))
            {
                continue;
            }
            else
            {
                if(keyWord.includes("State"))
                {
                    conclusion.attribute = keyWord;
                    conclusion.value = res.Items[i][keyWord];
                }
                else
                {
                    obj.attribute = keyWord;
                    obj.value = res.Items[i][keyWord];
                    premise.push(obj);
                }   
            }

        }

      Rule.premises = premise;
      Rule.conclusion = conclusion;
      //console.log(Rule);
      kb.push(Rule);
     }
     // console.log(kb);
      //return KB;

    let assertions = [];
    let attribute = 1;
    
   // console.log(object);


     for(var key in object)
     {
        // console.log(key);
        // console.log(object[key]);
        var assertObj = {};
        assertObj.attribute = key;
        assertObj.value = object[key];
        assertions.push(assertObj);
     }

    assertions = forwardChain(assertions);
    console.log(assertions);
    var responseS = "declined";
       for(var i=0;i<assertions.length;i++)
    {
     // console.log(assertions[i].attribute);
      if(assertions[i].attribute==="State")
      {
        if(assertions[i].value === "always accept"||assertions[i].value ==="always attend"||assertions[i].value ==="accept"||assertions[i].value ==="affirm")
        {
          console.log("Accept the meeting");
          responseS = "accepted"; 
          //indexApi.pakt();
        }
        else
        {
          console.log("Decline the meeting");
          responseS = "declined";
          //indexApi.pakt();
        }
      }
    }
    //indexApi.pakt();
    var patcher = {
  "attendees": [
    {
      "email": object.Id,
      "responseStatus": responseS
    }
  ]
  
}
var calendar = cal.calendar;
calendar.events.patch({
  auth: cal.auth,
  calendarId: object.Id,
  eventId: object.eventID ,
  sendNotifications: 'true',
  resource: patcher
}, function(err, res) {
     if (err) {
     console.log('Patch Error ' + err);
     return;
   }
   console.log('Result patch ', + res);
 });
}

const forwardChain = function(assertions) {
 
  let ruleIndex = 0;
  let rule = kb[ruleIndex];
  var i =0;
 
  while (ruleIndex < kb.length) {
        rule = kb[ruleIndex];
    const allPremisesExist = rule.premises.every(premise =>
      assertions.some(assertion => assertion.attribute === premise.attribute && assertion.value === premise.value)
    );

    
    if (allPremisesExist && !assertions.some(assertion => assertion.attribute === rule.conclusion.attribute && assertion.value === rule.conclusion.value)) {
    
      assertions.push(rule.conclusion);
      ruleIndex = 0;
    }
    else {
      // Select the next rule.
      rule = kb[++ruleIndex];
    }
  }

  return assertions;
};