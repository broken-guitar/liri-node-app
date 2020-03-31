require("dotenv").config();
var axios = require("axios");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var moment = require("moment")
var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

var liri = [];
liri.cmdList = [{ 
      type: "rawlist", name: "selection", message: "Select an option",
      choices: [
         "concert-this",
         "spotify-this-song",
         "movie-this",
         "do-what-it-says",
         "quit"
      ],
      default: 4
}];
liri.bandInput = [{
   name: "artistName",
   message: "Enter artist/band name",
   validate: val => {
      return isEmpty(val) ? "Please enter an artist/band name" :  true // if not empty, return true (valid input)
   },
   filter: val => { return val.trim(); } 
}];
liri.songInput = [{
   name: "songName",
   message: "Enter song name",
   validate: val => {
      return isEmpty(val) ? "Please enter a song name" :  true
   },
   filter: val => { return val.trim(); } 
}];

liri.showMenu = function() {
   inquirer
      .prompt(liri.cmdList)
      .then(answers => {
         // prompt user for band, song, or movie depending on list selection
         switch (answers.selection) {
            case "concert-this":
               inquirer.prompt(liri.bandInput).then(answers => liri.getConcert(answers.artistName));
               break;
            case "spotify-this-song":
               inquirer.prompt(liri.songInput).then(answers => liri.getSong(answers.songName));
               break;
            case "movie-this":
               // inquirer.prompt(liri.movieInput).then(answers => getMovie(answers.songName));
               break;
            case "do-what-it-says":
               doFile();
               break;
            case "quit":
               break;
            default:
               break;
         }
      });

}

liri.showMenu();

liri.getConcert = function(artistName) {
   axios
      .get("https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp")
      .then( response => {
         if (response.data.length < 1) {
            console.log("\n\tSorry, no upcoming events found. :(\n")
         } else {
            console.log("\nUpcoming Events:\n")
            for (e of response.data) {         
               console.log(" Venue:\t\t", e.venue.name);
               console.log(" Location:\t", e.venue.city, e.venue.region, e.venue.country)
               console.log(" Date:\t\t", moment(e.datetime).format("MM/DD/YYYY"));
               console.log("\r\n--------------\n");
            }
         }
         liri.showMenu();
      })
      .catch( error => {
         liri.showAxiosErr(error);
      });
}

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

// axiom error handling
liri.showAxiosErr = function(error) {
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
}

// check if string is empty
function isEmpty(string) {
   return string.match(/^\s*$/);
}