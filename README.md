# scrabble
Nice way to learn version control with a game

##Game master:
Install node.js or io.js
Install the packages: 
```
npm install
```
Run the game: 
```
node master.js
```
You can set the port and pass also in the command, e.g.:
```
node master.js port=1234 pass=5678
```
In the console you see the ip and port of the game, send it to the new guys.

##New guys:
Clone the repository.
The file board.txt is your game board, it has a 15×15 grid.
Open the url in the browser, received from the master.
Now you see all your tiles.
First player put his word in the grid, each char between the square Brackets.

If you can play at least one tile on the board
```
/word/XXXXX
```

Or exchange one or more tiles for an equal number from the bag
```
/exchange/XXXXX
```

Pass, forfeiting the turn, do nothing
