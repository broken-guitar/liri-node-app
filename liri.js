require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const inquirer = require("inquirer");
const keys = require("./keys.js");
const moment = require("moment")
const open = require('open');
const Spotify = require('node-spotify-api');

const spotify = new Spotify(keys.spotify);
const logFile = "log.txt";
const divider = "\n\n################################################################\n\n";
const usageText = [
   "\r\nLiri command was not recognized!",
   "\nUsage: node liri.js {concert-this|spotify-this-song|movie-this|do-what-it-says} <search term>",
   "Examples:",
   "\tnode liri.js concert-this Kishi Bashi",
   "\tnode liri.js spotify-this-song You've Got Time\r\n"
].join("\n");

var command = process.argv[2];
var term = process.argv[3];
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
   default: "The Sign",
   validate: val => {
      return isEmpty(val) ? "Please enter a song name" :  true
   },
   filter: val => { return val.trim(); } 
}];

liri.movieInput = [{
   name: "movieTitle",
   message: "Enter a movie title",
   default: "Mr. Nobody",
   validate: val => {
      return isEmpty(val) ? "Please enter a movie title" :  true
   },
   filter: val => { return val.trim(); } 
}]

liri.showMenu = function() {
   console.log("\r")
   inquirer.prompt(liri.cmdList)
      .then(answers => {
         // prompt user for band, song, or movie depending on list selection
         liri.cmdSwitch(answers.selection);
      });
}

liri.getConcert = function(artistName) {
   axios
      .get("https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp")
      .then(response => {
         if (response.data.length < 1) {
            liri.output("\n\tSorry, no upcoming events found for '" + artistName + "'.\n", logFile);
         } else {
            let concertData = "\r\nUpcoming Events for " + artistName + ":\r\n";
            for (e of response.data) {
               concertData += [
                  "\n--------------",
                  " Venue:\t\t" + e.venue.name,
                  " Location:\t" + e.venue.city + " " + e.venue.region + " " + e.venue.country,
                  " Date:\t\t" + moment(e.datetime).format("MM/DD/YYYY")
               ].join("\n");
            }
            liri.output(concertData, logFile);
         }
      })
      .catch( error => {
         liri.showAxiosErr(error);
      })
      .finally(() => {
         liri.showMenu();
      });
}

liri.getSong = function(songName) {
   spotify.search({  
         type: "track",
         query: songName,
         limit: 5
      },
      function(err, data) {
         if (err) {
            return liri.output("Error occurred: " + err, logFile);
         }
         if (data) {
            let songData = "";
            let firstTrack = data.tracks.items[0];
            let allArtists = firstTrack.artists.map(artist => artist.name).join(", ");
            let previewUrl = (firstTrack.preview_url) ? firstTrack.preview_url : "N/A";
            songData = [
               "\nSong info:\n",
               " Artist(s):\t" + allArtists,
               " Song:\t\t" + firstTrack.name,
               " Preview:\t" + previewUrl,
               " Album:\t\t" + firstTrack.album.name
            ].join("\n");
            liri.output(songData, logFile);
            liri.askPreviewUrl(previewUrl); // ask user to listen to song preview
         }
      });
}

liri.getMovie = function(movieTitle) {
    // Then run a request with axios to the OMDB API with the movie specified
    axios.get("http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy")
      .then(response => {  
         if (response.data.length < 1 || response.Response === false) {
            liri.output("\n\tSorry, no movies found for '" + movieTitle + "'.\n", logFile);
         } else {
            let movieData = "";
            let movie = response.data;
            let rotten = movie.Ratings.find(rating => rating.Source == "Rotten Tomatoes") || "N/A";   
            movieData = [
               "\nMovie info:",
               "------------------------",
               " Title:\t\t\t" +  movie.Title,
               " Year:\t\t\t" +  movie.Year,
               " IMDB Rating:\t\t" +  movie.imdbRating,
               " Rotten Tomatoes Rating:" +  rotten.Value,
               " Country:\t\t" +  movie.Country,
               " Language:\t\t" +  movie.Language,
               " Actors:\t\t" +  movie.Actors,
               " Plot:\t\t\t" +  movie.Plot
            ].join("\n");
            liri.output(movieData, logFile);
         }
      })
      .catch(function(error) {
        liri.showAxiosErr(error);
      })
      .finally(() => {
         liri.showMenu();
      });
}

// axiom error handling
liri.showAxiosErr = function(error) {
   if (error.response) {
      liri.output("\nError\t" + error.message, logFile);
   
   } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an object that comes back with details pertaining to the error that occurred.
      liri.output(error.request, logFile);
   
   } else {
      // Something happened in setting up the request that triggered an Error
      liri.output("Error", error.message, logFile);
   }
   liri.output(error.config, logFile);
}

// ask to open song preview url if available
liri.askPreviewUrl = function (url, callback) {
   if (url !== "N/A" && url.substr(0,17) == "https://p.scdn.co") {
      inquirer.prompt({
         type: "confirm",
         name: "listen",
         message: "Do you want to listen to the song preview? (y/n)\nNOTE: this will opens the the song's Preview URL in your default browser.",
         default: false,
         validate: val => {
            return val.match(/^yes$|^no$|^n$|^y$/i) ? true : "Please enter y or n"
         }
      }).then(answers => {
            if (answers.listen) openUrl(url);
      })
      .finally(() => liri.showMenu());
   } else {
      liri.showMenu();
   }
}

liri.output = function(data, file) {
   console.log(data);
   if (file) {
      fs.appendFile(file, data + divider, function(err) {
         if (err) throw err;
      })
   }
}

liri.appendLog = function(data) {
   fs.appendFile(logFile, data + divider, function(err) {
      if (err) throw err;
    });
}

liri.doFile = function() {
   fs.readFile("random.txt", "utf8", (err, data) => {
      if (err) throw err;
      let cmd = data.split(" ")[0];
      if (cmd != "do-what-it-says") {
         let term = data.split(" ").splice(1).join(" ");
         liri.cmdSwitch(cmd, term);
      }
   });
}

liri.checkInput = function(cmd, term) {
   cmd = (cmd) ? cmd.trim() : "";
   term = (term) ? term.trim() : "";
   // handle valid command/arguments,
   // otherwise show usage text and menu interace to user
   if(cmd === "do-what-it-says") {
      liri.cmdSwitch(cmd);
   } else if (cmd && term) {
      liri.cmdSwitch(cmd, term);
   } else {
      liri.output(usageText);
      liri.showMenu();
   }
}

// handle each command; if user doesn't provide a search term then ask for it
liri.cmdSwitch = function(cmd, term) {
   switch (cmd) {
      case "concert-this":
         if (term) {liri.getConcert(term)}
         else {
            inquirer.prompt(liri.bandInput).then(answers => liri.getConcert(answers.artistName));
         }
         break;
      case "spotify-this-song":
         if (term) {
            liri.getSong(term)}
         else {
            inquirer.prompt(liri.songInput).then(answers => liri.getSong(answers.songName));
         }
         break;
      case "movie-this":
         if (term) {liri.getMovie(term)}
         else {
            inquirer.prompt(liri.movieInput).then(answers => liri.getMovie(answers.movieTitle));
         }
         break;
      case "do-what-it-says":
            liri.doFile();
         break;
      case "quit":
         break;
      default:
         liri.output(usageText);
         liri.showMenu();
         break;
   }
}

// #### START 

liri.checkInput(command, term);

// ### FUNCTIONS 

// check if string is empty
function isEmpty(string) {
   return string.match(/^\s*$/);
}
// open url function
async function openUrl(url) {
   await open(url);
}