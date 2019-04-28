var AWS = require("aws-sdk");
var creds = new AWS.Credentials('akid', 'secret', 'session');

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
    credentials: creds
});
const docClient = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB({
    region: 'us-east-1',
    endpoint: "http://localhost:8000"
});

// var tableName = "UserInfo";

// var createUsersTable= {
//     TableName : "CalRules",
//     KeySchema: [
//         { AttributeName: "Id", KeyType: "HASH"},
//         { AttributeName: "RuleWord", KeyType: "RANGE"}
//         // { AttributeName: "Day", KeyType: "RANGE"},
//         // { AttributeName: "Date", KeyType: "RANGE"},
//         // { AttributeName: "Time", KeyType: "RANGE"},
//         // { AttributeName: "Name", KeyType: "RANGE"},
//         // { AttributeName: "Topic", KeyType: "RANGE"}
//     ],
//     AttributeDefinitions: [
//         { AttributeName: "Id", AttributeType: "S" },
//         { AttributeName: "RuleWord", AttributeType: "S" }
//         // { AttributeName: "Day", AttributeType: "S" },
//         // { AttributeName: "Date", AttributeType: "S" },
//         // { AttributeName: "Time", AttributeType: "S" },
//         // { AttributeName: "Name", AttributeType: "S" },
//         // { AttributeName: "Topic", AttributeType: "S" }
//     ],
//     ProvisionedThroughput: {
//         ReadCapacityUnits: 1,
//         WriteCapacityUnits: 1
//     }
// }; 

// dynamodb.createTable(createUsersTable, function(err, data) {
//     if (err) {
//         console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
//     }
// });

 var params = {
        TableName:"CalRules",
        Item:{
            "Id": '4',
            "RuleWord": 'avoid',
            "Time": 'Evening',
            "Day" : 'Friday'

        }
    };
 //       console.log("Adding a new item...");
 //    docClient.put(params, function(err, data) {
 //        if (err) {
 //            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
 //        } else {
 //            console.log("Added item:", JSON.stringify(data, null, 2));
 //        }
 //    });
var params1 = {
 // "items": [
 //  {
   "kind": "calendar#event",
   "etag": "\"3102386740198000\"",
   "id": "2uk1oipqus61l06c9c0le6261u",
   "status": "confirmed",
   "htmlLink": "https://www.google.com/calendar/event?eid=MnVrMW9pcHF1czYxbDA2YzljMGxlNjI2MXUgc2F1bWV5YS5rYXR5YWxAY3VtbWluc2NvbGxlZ2UuaW4",
   "created": "2019-02-26T15:02:50.000Z",
   "updated": "2019-02-26T15:02:50.099Z",
   "summary": "test4334",
   "creator": {
    "email": "saumeya.katyal@cumminscollege.in",
    "self": true
   },
   "organizer": {
    "email": "saumeya.katyal@cumminscollege.in",
    "self": true
   },
   "start": {
    "dateTime": "2019-03-02T14:30:00+05:30"
   },
   "end": {
    "dateTime": "2019-03-02T15:30:00+05:30"
   },
   "iCalUID": "2uk1oipqus61l06c9c0le6261u@google.com",
   "sequence": 0,
   "extendedProperties": {
    "private": {
     "everyoneDeclinedDismissed": "-1"
    }
   },
   "reminders": {
    "useDefault": true
   }
  }//,
//]}
 docClient.scan(params, function(err, data) {
  
   var day = "Friday";
   var time = "Evening";
        if (err) {
            console.error("Unable to get items. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("table item:", JSON.stringify(data.Items[0].RuleWord.toString(), null, 2));
            data.Items.forEach(function(item) {
            //console.log(" -", item.Topic + ": " + item.Name);
            if(item.RuleWord=="ignore"){
              console.log("accept request");
            }
           
            if(item.RuleWord=='avoid'){
              if(item.Day=='Friday' && day=="Friday"){
             //  if(JSON.stringify(item.StartTime, null, 2)<'20:00' || JSON.stringify(item.EndTime, null, 2)>'21:00' || JSON.stringify(item.StartTime, null, 2)<'20:00' && JSON.stringify(item.EndTime, null, 2)>'21:00' )
                  console.log("deny request");
                  //console.log(JSON.stringify(item.StartTime, null, 2));
              }
            }
       });
       }
    });
