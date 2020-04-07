# Liri Bot

Liri is a node app that makes it possible to use APIs through a simple command line interface.

Users can use Liri to find information about upcoming concerts, songs, and movies. Search requests are entered at the terminal with a command/search term syntax or a menu-based terminal interface. Liri makes use of Band In Town, Spotify, the OMBD APIs.

## Installation

1. Install Node 
2. Clone or download the repo.
3. Open a terminal window and navigate to the repository folder on your machine.
4. At the command prompt enter: `npm install`

# Usage

```
node liri.js [command] [search term]
```
Example:
```
node liri.js concert-this Taylor Swift
```

Commands | Description
---------|------------
**concert-this**      | Queries the BandsinTown API for a list of upcoming concerts  
**spotify-this-song** | Queries the Spotify API for song information.
**movie-this**        | Queries the OMDB API for movie information.
**do-what-it-says**   | Runs a liri command from a text file (random.txt) located in the project root folder.

**Note**: If a command or argument is not provided, Liri will prompt the user with a command list and ask for search input.

# Demo

# Built with
- Node
- JavaScript
- NPM modules: axios, node-spotify-api, open
- APIs: OMDB, Bandintown


