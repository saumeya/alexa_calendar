// HTTP module contains all the logic for dealing with HTTP requests.
//var initialize = require("./watch.js")
var sync = require("./index.js")
var http = require('http');

// We define the port we want to listen to. Logically this has to be the same port than we specified on ngrok.
const PORT=5050;

// We create a function which handles any requests and sends a simple response
function handleRequest(request, response){
 const { headers, method, url } = request;
   response.end('google-site-verification: google1f97eb32d0a10e42.html');

if(method === 'POST' && response.statusCode==200)
{
  console.log("\nPost request for "+JSON.stringify(request.headers['x-goog-channel-token']));
  //console.log(JSON.stringify(request.headers['x-goog-channel-token'])); //delete later
  var user = request.headers['x-goog-channel-token'];
  //if statement 
  if(request.headers['x-goog-message-number']!=1){
 sync.synchronize(user);
    }
   }
}
// We create the web server object calling the createServer function. Passing our request function onto createServer guarantees the function is called once for every HTTP request that's made against the server
var server = http.createServer(handleRequest);

// Finally we start the server
server.listen(PORT, function(){
  // Callback triggered when server is successfully listening. Hurray!
console.log("Server listening on: http://localhost:%s", PORT);
});