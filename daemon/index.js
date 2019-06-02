const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var extraction = require("./extract.js");

var MyApp = {};
var AWS = require("aws-sdk");

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
const uuidv1 = require('uuid/v1');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), listEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  MyApp.auth1 = auth;

 var emails = ['krutika.sarode@cumminscollege.in','saumeya.katyal@cumminscollege.in','priya.andurkar@cumminscollege.in','roshani.aher@cumminscollege.in'];

for(var i = 0; i<emails.length; i++){
   
 calendar.events.list({
    calendarId: emails[i],
    timeMin: (new Date()).toISOString(),   
  }, (err, res) => {
    
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
  
    MyApp.sync_tokenS = res.data.nextSyncToken;
    var params = {
        TableName:"SyncToken",
        Item:{
            "Id": res.data.summary,
      "token":res.data.nextSyncToken 
    
        }
    };
     
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added sync token:", JSON.stringify(data, null, 2));
        }
    });
 });
}

}

module.exports = {
  synchronize: function(user){ 
  var auth = MyApp.auth1;
  const calendar = google.calendar({version: 'v3', auth});
    
  var params = {
    TableName: "SyncToken"
        };

  docClient.scan(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
           
            for(var i=0;i<data.Count;i++){
                if(data.Items[i].Id==user){
                    var token=data.Items[i].token;

                     calendar.events.list({
                        calendarId: user,                       
                       syncToken: token,   
                      }, (err, res) => {
                        if (err) return console.log('synchronize returned an error: ' + err);    
                       
                       token = res.data.nextSyncToken;
                       
                        var params={
                          TableName: "SyncToken",
                          Item:{
                           "Id": user,
                          "token":token    
                          }
                        };
                        docClient.put(params, function(err, data) {
                        if (err) {
                        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                         console.log("New Sync token added:", JSON.stringify(data, null, 2));
                        }
                     }); //updating sync token                       
                      extraction.add(res.data);
                 });//cal list
                }               
            }
        }
    });
 },
};