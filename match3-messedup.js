// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    console.log('window onload loaded');
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Timing and frames per second
    // stuff into class?
    var lastFrame = 0;    
    var framesPerSecond = 0;

    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;
    
    // Mouse dragging
    var drag = false;    


    // Game states
    var gamestates = { init: 0, ready: 1, resolve: 2 };
    var gamestate = gamestates.init;        

    // are we using this?
    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        Unknown: Symbol("unknown")
    }


    const tileTypes = {
        RegularTile: "tile",
        DiscardTile: "discardTile",
        Empty: "empty",  // discarded tile hole
        Bomb: "bomb",
        HorizRocket: "horizRocket",
        VerticalRocket: "verticalRocket"
    }

    // trying to incorporate
    class gameTile
     {

        gameTile()
        {
            var x = 3;
            console.log("initting game tile");
            var wilbeDeleted = false;
            var tileType = myTileTypes.plainTile;
            var type = 0; 
        }

        markTileToDelete()
        {
            wilbeDeleted = true;
        }
    }



    // Level object
    var level = {
        x: 250,         // X position of canvas?
        y: 113,         // Y position
        TOTALCOLUMNS: 8,     // Number of tile columns
        TOTALROWS: 8,        // Number of tile rows
        TILEWIDTH: 40,  // Visual width of a tile
        TILEHEIGHT: 40, // Visual height of a tile
        tiles: [],      // The two-dimensional tile array
        selectedtile: { selected: false, column: 0, row: 0 }  // change this a bit, for selected click tile?
    };

    // a round = 1 level of a game.
    var gameRound = {
        foundClusters: []

    };
    // All of the different tile colors in RGB
    var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [255, 255, 255]];
    
    // Clusters and moves that were found
    var clusters = [];  // { column, row, length, horizontal }
    var moves = [];     // { column1, row1, column2, row2 }

    // Current move
    var currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };
    
    // Game states
    var gamestates = { init: 0, ready: 1, resolve: 2 };
    var gamestate = gamestates.init;
    
    // Score
    var score = 0;
    
    // Animation variables
    var animationstate = 0;
    var animationtime = 0;
    var animationtimetotal = 0.3;
    
    // Show available moves
    var showmoves = false;
    
    // The AI bot
    var aibot = false;
    
    // Game Over
    var gameover = false;
    var gameButtons = [ { x: 30, y: 270, width: 150, height: 50, text: "New Game"},
                    { x: 30, y: 330, width: 150, height: 50, text: "Show Moves"}];

    // PROGRAM ENTRY POINT
    function init() {
        console.log("*** initting events ***");
        canvas.addEventListener("mousedown", onMouseDown);  // keep
        //canvas.addEventListener("mouseout", onMouseOut); // not really needed


        for (var thisColumn=0; thisColumn<level.TOTALCOLUMNS; thisColumn++) {
            level.tiles[thisColumn] = [];
            for (var thisRow=0; thisRow<level.TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] = { type: returnRandomTileColor(), shift:0 }
                console.log(`setting TILES`);
            }
        }
        startNewGame(); // New game(part 2?)
        main(0); // Enter main loop
    }

    // Main loop
    function main(theFrame) {
        window.requestAnimationFrame(init); // Request animation frames
        updateGameState(theFrame); // Update and render the game
        renderWholeScreen();
    }

    // Update the game state
    function updateGameState(thisFrame) {
        var frameDifferenceTime = (thisFrame - lastFrame) / 1000;
        lastFrame = thisFrame;
        if (gameState == currentGameState.ready) {
            // Game is ready for player input
            
            if (moves.length <= 0) {
                isGameOver = true;
            }

             if (animationState == 1) {
                // Tiles need to be shifted
                if (animationTime > animationTimeTotal) {
                    // Shift tiles
                    shiftTiles();

                    animationState = 0; // New clusters need to be found
                    animationTime = 0;

                    // Check if there are new clusters
                    findClusters();
                    if (foundMatches.length <= 0) {
                        gameState = currentGameState.ready; // Animation complete
                    }
                }
            } else if (animationState == 2) {
                // Swapping tiles animation
                if (animationTime > animationTimeTotal) {
                    // Swap the tiles
                    // TOOD: CHANGE to elimination
                    swapTwoTiles(currentMove.column1, currentMove.row1, currentMove.column2, currentMove.row2);

                    // Check if the swap made a cluster
                    findClusters();
                    if (foundMatches.length > 0) {
                        // Valid swap, found one or more clusters
                        // Prepare animation states
                        animationState = 0;
                        animationTime = 0;
                        gameState = currentGameState.resolve;
                    } else {
                        // Invalid swap, Rewind swapping animation
                        animationState = 3;
                        animationTime = 0;
                    }

                    // Update moves and clusters
                    findMoves();
                    findClusters();
                }
            } else if (animationState == 3) {
                // Rewind swapping animation
                if (animationTime > animationTimeTotal) {
                    // Invalid swap, swap back
                    swapTwoTiles(currentMove.column1, currentMove.row1, currentMove.column2, currentMove.row2);

                    // Animation complete
                    gameState = currentGameState.ready;
                }
            }

            // Update moves and clusters
            findMoves();
            findClusters();
        }
    }



    // Draw text that is centered
    function drawCenterText(myText, xCordinate, yCoordinate, width) {
        var textDimensions = context.measureText(myText);
        context.fillText(myText, xCordinate + (width-textDimensions.width)/2, yCoordinate);
    }

    // Render the game
    function renderWholeScreen() {
        drawGridFrame(); // Draw the frame
        context.fillStyle = "#000000"; // Draw score
        context.font = "24px Verdana";
        drawCenterText("Score:", 30, level.y+40, 150);
        drawCenterText(myScore, 30, level.y+70, 150);
        drawCenterText("Total Moves: ",30, level.y+100, 150);
        drawCenterText(myScore, 30, level.y+130, 150); // TODO: update
        drawButtons(); // render buttons
        // Draw level background
        var levelWidth = level.TOTALCOLUMNS * level.TILEWIDTH;
        var levelHeight = level.TOTALROWS * level.TILEHEIGHT;
        context.fillStyle = "#000000";  // todo: change
        context.fillRect(level.x - 4, level.y - 4, levelWidth + 8, levelHeight + 8);
        renderTiles(); // Render tiles
        //renderClusters(); // Render clusters(not needed)

        // Game Over overlay
        if (isGameOver) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(level.x, level.y, levelWidth, levelHeight);

            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Game Over!", level.x, level.y + levelHeight / 2 + 10, levelWidth);
        }
    }

    // Draw a frame with a border
    function drawGridFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);

        // Draw header block?
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);

        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("MatchHeaven", 10, 30);

        // Display fps(optional)
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + framesPerSecond, 13, 50);
    }

    // Draw buttons
    // runs quite often
    function drawButtons() {
        for (var i=0; i<gameButtons.length; i++) {
            // Draw button shape
            context.fillStyle = "#000000";
            context.fillRect(gameButtons[i].x, gameButtons[i].y, gameButtons[i].width, gameButtons[i].height);

            // Draw button text
            context.fillStyle = "#ffffff";
            context.font = "18px Verdana";
            var textdim = context.measureText(gameButtons[i].text);
            context.fillText(gameButtons[i].text, gameButtons[i].x + (gameButtons[i].width-textdim.width)/2, gameButtons[i].y+30);
        }
    }

    // Render tiles
    function renderTiles() {
        for (var column=0; column<level.TOTALCOLUMNS; column++) {
            for (var row=0; row<level.TOTALROWS; row++) {
                // Get the shift of the tile for animation
                var shift = 0; // level.tiles[column][row].shift;

                // Calculate the tile coordinates
                //var myCoordinates = getTileCoordinate(column, row, 0, (animationTime / animationTimeTotal) * shift);
                var myCoordinates = getTileCoordinate(column, row, 0, (animationTime / animationTimeTotal) * shift);

                // Check if there is a tile present
                // // BROKEN
                // if (level.tiles[column][row].type >= 0) {
                //     // Get the color of the tile
                //     var myColumn = tilecolors[level.tiles[column][row].type];

                //     // Draw the tile using the color
                //     drawTile(myCoordinates.tilex, myCoordinates.tiley, myColumn[0], myColumn[1], myColumn[2]);
                // }

                // Draw the selected tile
                if (level.selectedtile.selected) {
                    if (level.selectedtile.column == column && level.selectedtile.row == row) {
                        // Draw a red tile
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, 255, 0, 0);
                    }
                }
            }
        }

        
    }

    // Get the tile coordinate

    function getTileCoordinate(column, row, columnOffset, rowOffset) {
        var tilex = level.x + (column + columnOffset) * level.TILEWIDTH;
        var tiley = level.y + (row + rowOffset) * level.TILEHEIGHT;
        return { tilex: tilex, tiley: tiley};
    }

    // Draw a tile with a color
    // don't forget the gamegrid
    function drawTile(x, y, r, g, b) {
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(x + 2, y + 2, level.TILEWIDTH - 4, level.TILEHEIGHT - 4);
        //level.tiles[x][y]
    }



    // Render moves
    // obsolete - turn into "draw box around tile" thing
    function renderMoves() {
        for (var i=0; i<moves.length; i++) {
            // Calculate coordinates of tile 1 and 2
            var coord1 = getTileCoordinate(moves[i].column1, moves[i].row1, 0, 0);
            var coord2 = getTileCoordinate(moves[i].column2, moves[i].row2, 0, 0);

            // Draw a line from tile 1 to tile 2
            context.strokeStyle = "#ff0000";
            context.beginPath();
            context.moveTo(coord1.tilex + level.TILEWIDTH/2, coord1.tiley + level.TILEHEIGHT/2);
            context.lineTo(coord2.tilex + level.TILEWIDTH/2, coord2.tiley + level.TILEHEIGHT/2);
            context.stroke();
        }
    }

    // Start a new game
    function startNewGame() {
        console.clear();
        console.log("START NEW GAME");
        myScore = 0; // Reset score
        //gameState = currentGameState.ready; // Set the gamestate to ready
        gamestate = gamestates.ready;        
        isGameOver = false; // Reset game over
        createLevel(); // Create the level

        // Find initial clusters and moves
        // not really needed(for now)
        findMoves();
        findClusters();
    }

    // Create a random level
    // populate tiles
    function createLevel() {
        console.log('CREATE LEVEL');
            for (var column=0; column<level.TOTALCOLUMNS; column++) {
                for (var row=0; row<level.TOTALROWS; row++) {
                    level.tiles[column][row].type = returnRandomTileColor();
                    console.log(`TYPE OUTPUT: ${level.tiles[column][row].type}`);
                }
            }
        }
    

    // return a random tile
    // TODO; the whole tile object

    function returnRandomTileColor() {
        var myValue = Math.floor(Math.random() * tilecolors.length); 
        return myValue;
    }


        // Swap two tiles in the level
    // depreciate this
    // or better yet, use for falling function
    function swapTwoTiles(x1, y1, x2, y2) {
        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;
    }


    // Find available moves
    function findMoves() {
        // Reset moves
        moves = []
        console.log('finding moves');

        // Check horizontal swaps
        for (var row=0; row<level.TOTALROWS; row++) {
            for (var column=0; column<level.TOTALCOLUMNS-1; column++) {
                // Swap, find clusters and swap back
                swapTwoTiles(column, row, column+1, row);
                //findClusters();
                swapTwoTiles(column, row, column+1, row);

                // // Check if the swap made a cluster
                // if (foundClusters.length > 0) {
                //     // Found a move
                //     moves.push({column1: column, row1: row, column2: column+1, row2: row});
                // }
            }
        }

        // Check vertical swaps
        for (var column=0; column<level.TOTALCOLUMNS; column++) {
            for (var row=0; row<level.TOTALROWS-1; row++) {
                // Swap, find clusters and swap back
                swapTwoTiles(column, row, column, row+1);
                //findClusters();
                swapTwoTiles(column, row, column, row+1);

                // // Check if the swap made a cluster
                // if (foundClusters.length > 0) {
                //     // Found a move
                //     moves.push({column1: column, row1: row, column2: column, row2: row+1});
                // }
            }
        }

        // Reset clusters
        foundClusters = []
    }


    function findClusters(){}

    // Loop over the cluster tiles and execute a function
    function loopClusters(func) {
        for (var indexer=0; indexer<foundClusters.length; indexer++) {
            //  { column, row, length, horizontal }
            var cluster = foundClusters[indexer];
            var coffset = 0;
            var roffset = 0;
            for (var subloop=0; subloop<cluster.length; subloop++) {
                func(indexer, cluster.column+coffset, cluster.row+roffset, cluster);

                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }

    // Remove the marked tiles
    // my own function
    function removeMarkedTiles() {
        log("removing marked tiles...");
        // Change the type of the tiles to -1, indicating a removed tile
        //loopClusters(function(index, column, row, cluster) { level.tiles[column][row].type = -1; });
        for (var column=0; column<level.TOTALCOLUMNS; column++) {
             var shift = 0;
             for (var row=level.TOTALROWS-1; row>=0; row--) {
                 if (level[column][row].type == -1)
                    {
                        //erase tile
                        eraseTile(column,row);
                        //gameGrid[column][row].type =
                    }
             }
        }
    }

    // row,column on filrect might need to be swapped
    //
    function eraseTile(column, row){
        context.fillStyle = "#000000";  //background color
        context.fillRect(gameButtons[i].column,
         gameButtons[i].row,
         gameButtons[i].width,
         gameButtons[i].height);
    }



    // Get the tile under the mouse
    // keep this one
    function getMouseTile(pos) {
        // Calculate the index of the tile
        var mouseX = Math.floor((pos.x - level.x) / level.TILEWIDTH);
        var mouseY = Math.floor((pos.y - level.y) / level.TILEHEIGHT);
        // Check if the tile is valid
        if (mouseX >= 0 && mouseX < level.TOTALCOLUMNS && mouseY >= 0 && mouseY < level.TOTALROWS) {
            // Tile is valid
            console.log(`(getmousetile) tile is valid ${mouseX}  ${mouseY}`);
            return {
                valid: true,
                x: mouseX,
                y: mouseY
            };
        }

        console.log("(getmousetile) no  valid tiles(clicked outside)");
        // No valid tile
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }
    


    // CLICK FUNCTION EVENT
    function onMouseDown(event){
        var mousePosition = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePosition);
        if (mt.valid) {
                console.log(`valid tile click detected: ${mt.x}  ${mt.y} `); // WORKS
                // check neighbors of tile
                checkNeighbors(mt.x,mt.y);
            }

        // GAME BUTTON CLICK(META)
        for (var i=0; i<gameButtons.length; i++) {
            if (mousePosition.x >= gameButtons[i].x && mousePosition.x < gameButtons[i].x+gameButtons[i].width &&
                mousePosition.y >= gameButtons[i].y && mousePosition.y < gameButtons[i].y+gameButtons[i].height) {

                // Button i was clicked
                if (i == 0) {
                    // New Game
                    startNewGame();
                } else if (i == 1) {
                    // Show Moves
                    showMoves = !showMoves;
                    gameButtons[i].text = (showMoves?"Hide":"Show") + " Moves";
                } else if (i == 2) {
                    // AI Bot enable
                    isAIBotRunning = !isAIBotRunning;
                    gameButtons[i].text = (isAIBotRunning?"Disable":"Enable") + " AI Bot";
                }
            }
        }


    }


    function checkNeighbors(x, y){
        console.log(`checking neighbors for ${x} ${y} `);

    }

    // Get the mouse position
    // not unlike my thing
    function getMousePosition(canvas, event) {
        var boundingRectangle = canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - boundingRectangle.left)/(boundingRectangle.right - boundingRectangle.left)*canvas.width),
            y: Math.round((event.clientY - boundingRectangle.top)/(boundingRectangle.bottom - boundingRectangle.top)*canvas.height)
        };        
    }

    console.log("PRE INIT--");
    init();
}
    
    
    // Call init to start the game
    
    
    

    


