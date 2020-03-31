require("dotenv").config();
var Spotify = require('node-spotify-api');
var axios = require("axios");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

// var stdin = process.openStdin();
var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt("Input>");
rl.prompt();


rl.on("line", function(line){
    let input = line.split(" ");
    switch (input[0].toLowerCase()) {
        case "concert-this":
            break;
        case "spotify-this-song":
            break;
        case "movie-this":
            break;
        case "do-what-it-says":
            break;
        case "exit":
            rl.close();
        default:
            console.log("\r")
            console.log("Usage:\r")
            console.log("\tnode liri.js concert-this <artist/band name here>")
            console.log("\tnode liri.js movie-this <movie name here>")
            console.log("\tnode liri.js do-what-it-says")
            console.log("\r")
    }
       // switch (line)
    // console.log("You entered: " + line);
    rl.prompt();
})

rl.on("close", function() {
    console.log("exiting app")
    process.exit();
})

// stdin.addListener("data", function(d) {
//     console.log("you entered: [" + 
//         d.toString().trim() + "]");
//     console.log(d);
//   });


function getMovie() {
    // Then run a request with axios to the OMDB API with the movie specified
    axios.get("http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy").then(
    function(response) {
        console.log("The movie's rating is: " + response.data.imdbRating);
    })
    .catch(function(error) {
        if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("---------------Data---------------");
        console.log(error.response.data);
        console.log("---------------Status---------------");
        console.log(error.response.status);
        console.log("---------------Status---------------");
        console.log(error.response.headers);
        } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an object that comes back with details pertaining to the error that occurred.
        console.log(error.request);
        } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        }
        console.log(error.config);
    });
}
