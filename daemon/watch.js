const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const axios = require('axios');
var extraction = require("./extract.js");

var MyApp = {};
const uuidv1 = require('uuid/v1');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
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
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  
  const calendar = google.calendar({version: 'v3', auth});
  var emails = ['krutika.sarode@cumminscollege.in','saumeya.katyal@cumminscollege.in','priya.andurkar@cumminscollege.in','roshani.aher@cumminscollege.in'];


for(var i = 0; i<emails.length; i++){
var channel = {
  id: uuidv1(),
  type: "web_hook",
  address: "https://f383a31c.ngrok.io/",
  token: emails[i]
}
calendar.events.watch({
  auth: auth,
  calendarId: emails[i],
  resource: channel
}, function(err, res) {
     if (err) {
     console.log('Error ' + err);
     return;
   }
   console.log('Watch Started for ', + res);
   });
  }
}