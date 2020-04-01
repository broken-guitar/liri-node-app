require("dotenv").config();
const axios = require("axios");
const inquirer = require("inquirer");
const keys = require("./keys.js");
const moment = require("moment")
const open = require('open');
const Spotify = require('node-spotify-api');
const spotify = new Spotify(keys.spotify);

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
         switch (answers.selection) {
            case "concert-this":
               inquirer.prompt(liri.bandInput).then(answers => liri.getConcert(answers.artistName));
               break;
            case "spotify-this-song":
               inquirer.prompt(liri.songInput).then(answers => liri.getSong(answers.songName));
               break;
            case "movie-this":
               inquirer.prompt(liri.movieInput).then(answers => liri.getMovie(answers.movieTitle));
               break;
            case "do-what-it-says":
               // doFile();
               break;
            case "quit":
               break;
            default:
               break;
         }
      });
}

// - - INITIALIZE

liri.showMenu();

// - - FUNCTIONS 

liri.getConcert = function(artistName) {
   axios
      .get("https://rest.bandsintown.com/artists/" + artistName + "/events?app_id=codingbootcamp")
      .then(response => {
         if (response.data.length < 1) {
            console.log("\n\tSorry, no upcoming events found. :(\n")
         } else {
            console.log("\nUpcoming Events:\n")
            for (e of response.data) {     
               console.log("\r--------------");    
               console.log(" Venue:\t\t", e.venue.name);
               console.log(" Location:\t", e.venue.city, e.venue.region, e.venue.country)
               console.log(" Date:\t\t", moment(e.datetime).format("MM/DD/YYYY"));
            }
         }
         liri.showMenu();
      })
      .catch( error => {
         liri.showAxiosErr(error);
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
            return console.log("Error occurred: " + err);
         }
         if (data) {
            let firstTrack = data.tracks.items[0];
            let allArtists = firstTrack.artists.map(artist => artist.name).join(", ");
            let previewUrl = (firstTrack.preview_url) ? firstTrack.preview_url : "N/A";
            console.log(firstTrack);
            console.log("\nSong info:\n")
            console.log(" Artist(s):\t", allArtists);
            console.log(" Song:\t\t", firstTrack.name);
            console.log(" Preview:\t", previewUrl);
            console.log(" Album:\t\t", firstTrack.album.name);
            console.log("\r\n--------------\n");
            liri.askPreviewUrl(previewUrl); // ask user to listen to song preview
         }
         
      });
}

liri.getMovie = function(movieTitle) {
    // Then run a request with axios to the OMDB API with the movie specified
    axios.get("http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&apikey=trilogy")
      .then(response => {  
         if (response.data.length < 1) {
            console.log("\n\tSorry, no movies found. :(\n")
         } else {
            let movie = response.data;
            console.log(movie.Ratings);
            let rotten = movie.Ratings.find(rating => rating.Source == "Rotten Tomatoes") || "N/A";
            console.log("\nMovie info:")
            console.log("\r------------------------\r");
            console.log(" Title:\t\t\t", movie.Title);
            console.log(" Year:\t\t\t", movie.Year)
            console.log(" IMDB Rating:\t\t", movie.imdbRating);
            console.log(" Rotten Tomatoes Rating:", rotten.Value);
            console.log(" Country:\t\t", movie.Country);
            console.log(" Language:\t\t", movie.Language);
            console.log(" Actors:\t\t", movie.Actors);
            console.log(" Plot:\t\t\t", movie.Plot);
            
         }
         liri.showMenu();
    })
    .catch(function(error) {
        liri.showAxiosErr(error);
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

// ask to open song preview url if available
liri.askPreviewUrl = function (url) {
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
            liri.showMenu();
      });
   }
}
// open url function
async function openUrl(url) {
   await open(url);
}