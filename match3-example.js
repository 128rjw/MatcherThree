// ------------------------------------------------------------------------
// How To Make A Match-3 Game With HTML5 Canvas
// Copyright (c) 2015 Rembound.com
// 
// This program is free software: you can redistribute it and/or modify  
// it under the terms of the GNU General Public License as published by  
// the Free Software Foundation, either version 3 of the License, or  
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,  
// but WITHOUT ANY WARRANTY; without even the implied warranty of  
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the  
// GNU General Public License for more details.  
// 
// You should have received a copy of the GNU General Public License  
// along with this program.  If not, see http://www.gnu.org/licenses/.
//
// http://rembound.com/articles/how-to-make-a-match3-game-with-html5-canvas
// ------------------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");
    
    // Timing and frames per second
    // stuff into class? 
    var lastFrame = 0;
    var FPSTime = 0;
    var frameCount = 0;
    var framesPerSecond = 0;

    const tileTypes = {
        RegularTile: "tile",
        DiscardTile: "discardTile",
        Empty: "empty",  // discarded tile hole
        Bomb: "bomb",
        HorizRocket: "horizRocket",
        VerticalRocket: "verticalRocket"
    }
    
    class gameTile 
     {
        gameTile()
        {
            var x = 3; 
            console.log("initting game tile");

        }
    }

    // are we using this? 
    const myTyileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        Unknown: Symbol("unknown")
    }

    // Mouse dragging
    // not applicable to game rules
    var isMouseDragging = false;
    
    // Level object
    var gameGrid = {
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
    // replace with images?
    var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [255, 255, 255]];
    
    // Clusters and moves that were found
    // move to per-turn class? 
    var foundClusters = [];  // { column, row, length, horizontal } // NEEDS UPDATING
    var moves = [];     // { column1, row1, column2, row2 }

    // Current move
    // not really applicable to single click event
    // use column1 and column2
    var currentMove = { column1: 0, row1: 0, column2: 0, row2: 0 };
    
    // Game states
    var currentGameState = { init: 0, ready: 1, resolve: 2 }; // resolve = ai bot?
    var gameState = currentGameState.init;
    
    // Score
    var myScore = 0;
    
    // TODO: stats


    // Animation variables
    var animationState = 0;
    var animationTime = 0;
    var animationTimeTotal = 0.3;
    
    // Show available moves
    var showMoves = false;
    
    // The AI bot, running or not?
    var isAIBotRunning = false;
    
    // Game Over
    var isGameOver = false;
    
    // Gui buttons
    // TODO: Change font
    var gameButtons = [ { x: 30, y: 240, width: 150, height: 50, text: "New Game"},
                    { x: 30, y: 300, width: 150, height: 50, text: "Show Moves"},
                    { x: 30, y: 360, width: 150, height: 50, text: "Enable AI Bot"}];
    
    // TODO: severity
    function log(mymessage)
    {
        console.log(mymessage)
    }




    // Initialize the game
    function initGame() {
        // Add mouse events
        canvas.addEventListener("mousemove", onMouseMove); // keep
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);
        
        // Initialize the two-dimensional tile array
        // same as my code
        for (var thisColumn=0; thisColumn<gameGrid.TOTALCOLUMNS; thisColumn++) {
            gameGrid.tiles[thisColumn] = [];   // clear it out
            for (var thisRow=0; thisRow<gameGrid.TOTALROWS; thisRow++) {
                gameGrid.tiles[thisColumn][thisRow] = { type: 0, shift:0 }
            }
        }
        startNewGame(); // New game
        // Enter main loop
        main(0);
    }
    
    // Main loop
    function main(theFrame) {
        window.requestAnimationFrame(main); // Request animation frames
        updateGameState(theFrame); // Update and render the game
        render();
    }
    
    // Update the game state
    function updateGameState(thisFrame) {
        var frameDifferenceTime = (thisFrame - lastFrame) / 1000;
        lastFrame = thisFrame;
        updateFrameCounter(frameDifferenceTime); // Update the fps counter
        if (gameState == currentGameState.ready) {
            // Game is ready for player input
            // Check for game over
            if (moves.length <= 0) {
                isGameOver = true;
            }
            
            // Let the AI bot make a move, if enabled
            // remove later
            if (isAIBotRunning) {
                animationTime += frameDifferenceTime;
                if (animationTime > animationTimeTotal) {
                    // Check if there are moves available
                    findMoves();
                    
                    if (moves.length > 0) {
                        // Get a random valid move
                        var move = moves[Math.floor(Math.random() * moves.length)];
                        
                        // Simulate a player using the mouse to swap two tiles
                        mouseSwap(move.column1, move.row1, move.column2, move.row2);
                    } else {
                        // No moves left, Game Over. We could start a new game.
                        // newGame();
                    }
                    animationTime = 0;
                }
            }
        } else if (gameState == currentGameState.resolve) {
            // Game is busy resolving and animating clusters
            animationTime += frameDifferenceTime;
            
            if (animationState == 0) {
                // Clusters need to be found and removed
                if (animationTime > animationTimeTotal) {
                    
                    findClusters(); // Find clusters
                    
                    if (foundClusters.length > 0) {
                        
                        for (var myIndex=0; myIndex<foundClusters.length; myIndex++) { // Add points to the score
                            // Add extra points for longer clusters
                            myScore += 100 * (foundClusters[myIndex].length - 2);;
                        }
                    
                        // Clusters found, remove them
                        removeClusters();
                        
                        // Tiles need to be shifted
                        animationState = 1;
                    } else {
                        // No clusters found, animation complete
                        gameState = currentGameState.ready;
                    }
                    animationTime = 0;
                }
            } else if (animationState == 1) {
                // Tiles need to be shifted
                if (animationTime > animationTimeTotal) {
                    // Shift tiles
                    shiftTiles();
                    
                    // New clusters need to be found
                    animationState = 0;
                    animationTime = 0;
                    
                    // Check if there are new clusters
                    findClusters();
                    if (foundClusters.length <= 0) {
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
                    if (foundClusters.length > 0) {
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
    
    function updateFrameCounter(dt) {
        if (FPSTime > 0.25) {
            // Calculate fps
            framesPerSecond = Math.round(frameCount / FPSTime);
            
            // Reset time and framecount
            FPSTime = 0;
            frameCount = 0;
        }
        
        // Increase time and framecount
        FPSTime += dt;
        frameCount++;
    }
    
    // Draw text that is centered
    function drawCenterText(myText, xCordinate, yCoordinate, width) {
        var textDimensions = context.measureText(myText);
        context.fillText(myText, xCordinate + (width-textDimensions.width)/2, yCoordinate);
    }
    
    // Render the game
    function render() {        
        drawGridFrame(); // Draw the frame            
        context.fillStyle = "#000000"; // Draw score
        context.font = "24px Verdana";
        drawCenterText("Score:", 30, gameGrid.y+40, 150);
        drawCenterText(myScore, 30, gameGrid.y+70, 150);
        drawCenterText("Total Moves: ",30, gameGrid.y+100, 150);
        drawCenterText(myScore, 30, gameGrid.y+130, 150); // TODO: update            
        drawButtons(); // render buttons        
        // Draw level background
        var levelWidth = gameGrid.TOTALCOLUMNS * gameGrid.TILEWIDTH;
        var levelHeight = gameGrid.TOTALROWS * gameGrid.TILEHEIGHT;
        context.fillStyle = "#000000";  // todo: change
        context.fillRect(gameGrid.x - 4, gameGrid.y - 4, levelWidth + 8, levelHeight + 8);
        renderTiles(); // Render tiles            
        renderClusters(); // Render clusters
        
        // Render moves, when there are no clusters
        if (showMoves && foundClusters.length <= 0 && gameState == currentGameState.ready) {
            renderMoves();
        }
        
        // Game Over overlay
        if (isGameOver) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(gameGrid.x, gameGrid.y, levelWidth, levelHeight);
            
            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Game Over!", gameGrid.x, gameGrid.y + levelHeight / 2 + 10, levelWidth);
        }
    }
    
    // Draw a frame with a border
    function drawGridFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);
        
        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);
        
        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Match 3", 10, 30);
        
        // Display fps
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
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            for (var row=0; row<gameGrid.TOTALROWS; row++) {
                // Get the shift of the tile for animation
                var shift = gameGrid.tiles[column][row].shift;
                
                // Calculate the tile coordinates
                var myCoordinates = getTileCoordinate(column, row, 0, (animationTime / animationTimeTotal) * shift);
                
                // Check if there is a tile present
                if (gameGrid.tiles[column][row].type >= 0) {
                    // Get the color of the tile
                    var myColumn = tilecolors[gameGrid.tiles[column][row].type];
                    
                    // Draw the tile using the color
                    drawTile(myCoordinates.tilex, myCoordinates.tiley, myColumn[0], myColumn[1], myColumn[2]);
                }
                
                // Draw the selected tile
                if (gameGrid.selectedtile.selected) {
                    if (gameGrid.selectedtile.column == column && gameGrid.selectedtile.row == row) {
                        // Draw a red tile
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, 255, 0, 0);
                    }
                }
            }
        }
        
        // Render the swap animation
        if (gameState == currentGameState.resolve && (animationState == 2 || animationState == 3)) {
            // Calculate the x and y shift
            var shiftx = currentMove.column2 - currentMove.column1;
            var shifty = currentMove.row2 - currentMove.row1;

            // First tile
            var coord1 = getTileCoordinate(currentMove.column1, currentMove.row1, 0, 0);
            var coord1shift = getTileCoordinate(currentMove.column1, currentMove.row1, (animationTime / animationTimeTotal) * shiftx, (animationTime / animationTimeTotal) * shifty);
            var col1 = tilecolors[gameGrid.tiles[currentMove.column1][currentMove.row1].type];
            
            // Second tile
            var coord2 = getTileCoordinate(currentMove.column2, currentMove.row2, 0, 0);
            var coord2shift = getTileCoordinate(currentMove.column2, currentMove.row2, (animationTime / animationTimeTotal) * -shiftx, (animationTime / animationTimeTotal) * -shifty);
            var col2 = tilecolors[gameGrid.tiles[currentMove.column2][currentMove.row2].type];
            
            // Draw a black background
            drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
            drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);
            
            // Change the order, depending on the animation state
            if (animationState == 2) {
                // Draw the tiles
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
            } else {
                // Draw the tiles
                drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
            }
        }
    }
    
    // Get the tile coordinate
    function getTileCoordinate(column, row, columnOffset, rowOffset) {
        var tilex = gameGrid.x + (column + columnOffset) * gameGrid.TILEWIDTH;
        var tiley = gameGrid.y + (row + rowOffset) * gameGrid.TILEHEIGHT;
        return { tilex: tilex, tiley: tiley};
    }
    
    // Draw a tile with a color
    function drawTile(x, y, r, g, b) {
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(x + 2, y + 2, gameGrid.TILEWIDTH - 4, gameGrid.TILEHEIGHT - 4);
    }
    
    // Render clusters(matches)
    function renderClusters() {
        for (var thisFoundCluster=0; thisFoundCluster<foundClusters.length; thisFoundCluster++) {
            // Calculate the tile coordinates
            var coord = getTileCoordinate(foundClusters[thisFoundCluster].column, foundClusters[thisFoundCluster].row, 0, 0);
            
            if (foundClusters[thisFoundCluster].horizontal) {
                // Draw a horizontal line
                context.fillStyle = "#00ff00";
                context.fillRect(coord.tilex + gameGrid.TILEWIDTH/2, coord.tiley + gameGrid.TILEHEIGHT/2 - 4, (foundClusters[thisFoundCluster].length - 1) * gameGrid.TILEWIDTH, 8);
            } else {
                // Draw a vertical line
                context.fillStyle = "#0000ff";
                context.fillRect(coord.tilex + gameGrid.TILEWIDTH/2 - 4, coord.tiley + gameGrid.TILEHEIGHT/2, 8, (foundClusters[thisFoundCluster].length - 1) * gameGrid.TILEHEIGHT);
            }
        }
    }
    
    // Render moves
    function renderMoves() {
        for (var i=0; i<moves.length; i++) {
            // Calculate coordinates of tile 1 and 2
            var coord1 = getTileCoordinate(moves[i].column1, moves[i].row1, 0, 0);
            var coord2 = getTileCoordinate(moves[i].column2, moves[i].row2, 0, 0);
            
            // Draw a line from tile 1 to tile 2
            context.strokeStyle = "#ff0000";
            context.beginPath();
            context.moveTo(coord1.tilex + gameGrid.TILEWIDTH/2, coord1.tiley + gameGrid.TILEHEIGHT/2);
            context.lineTo(coord2.tilex + gameGrid.TILEWIDTH/2, coord2.tiley + gameGrid.TILEHEIGHT/2);
            context.stroke();
        }
    }
    
    // Start a new game
    function startNewGame() {
        console.clear(); 
        // Reset score
        myScore = 0;
        
        // Set the gamestate to ready
        gameState = currentGameState.ready;
        
        // Reset game over
        isGameOver = false;
        
        // Create the level
        createLevel();
        
        // Find initial clusters and moves
        findMoves();
        findClusters(); 
    }
    
    // Create a random level
    function createLevel() {
        var done = false;
        
        // Keep generating levels until it is correct
        while (!done) {
        
            // Create a level with random tiles
            for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
                for (var row=0; row<gameGrid.TOTALROWS; row++) {
                    gameGrid.tiles[column][row].type = getRandomTile();
                }
            }
            
            // Resolve the clusters
            resolveClusters();
            
            // Check if there are valid moves
            findMoves();
            
            // Done when there is a valid move
            if (moves.length > 0) {
                log("no valid moves");
                done = true;
            }
        }
    }
    
    // Get a random tile
    function getRandomTile() {
        return Math.floor(Math.random() * tilecolors.length);
    }
    
    // Remove clusters and insert tiles
    function resolveClusters() {
        // Check for clusters
        findClusters();
        
        // While there are clusters left
        while (foundClusters.length > 0) {
        
            // Remove clusters
            removeClusters();
            
            // Shift tiles
            shiftTiles();
            
            // Check if there are clusters left
            findClusters();
        }
    }
    
    // Find clusters in the level
    function findClusters() {
        // Reset clusters
        foundClusters = []
        
        // Find horizontal clusters
        for (var row=0; row<gameGrid.TOTALROWS; row++) {
            // Start with a single tile, cluster of 1
            var matchLength = 1;
            for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
                var checkCluster = false;
                
                if (column == gameGrid.TOTALCOLUMNS-1) {
                    // Last tile
                    checkCluster = true;
                } else {
                    // Check the type of the next tile
                    if (gameGrid.tiles[column][row].type == gameGrid.tiles[column+1][row].type &&
                        gameGrid.tiles[column][row].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchLength += 1;
                    } else {
                        
                        checkCluster = true; // Different type
                    }
                }
                
                // Check if there was a cluster
                if (checkCluster) {
                    if (matchLength >= 3) {
                        // Found a horizontal cluster
                        foundClusters.push({ column: column+1-matchLength, row:row,
                                        length: matchLength, horizontal: true });
                        log(`found horizontal cluster ${matchLength}`);
                    }
                    
                    matchLength = 1;
                }
            }
        }

        // Find vertical clusters
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            // Start with a single tile, cluster of 1
            var matchLength = 1;
            for (var row=0; row<gameGrid.TOTALROWS; row++) {
                var checkCluster = false;
                
                if (row == gameGrid.TOTALROWS-1) {
                    // Last tile
                    checkCluster = true;
                } else {
                    // Check the type of the next tile
                    if (gameGrid.tiles[column][row].type == gameGrid.tiles[column][row+1].type &&
                        gameGrid.tiles[column][row].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchLength += 1;
                        log("match length " + matchLength);
                    } else {
                       
                        checkCluster = true;  // Different type
                    }
                }
                
                // Check if there was a cluster
                if (checkCluster) {
                    if (matchLength >= 3) {
                        // Found a vertical cluster
                        foundClusters.push({ column: column, row:row+1-matchLength,
                                        length: matchLength, horizontal: false });
                    }
                    
                    matchLength = 1;
                }
            }
        }
    }
    
    // Find available moves
    function findMoves() {
        // Reset moves
        moves = []
        
        // Check horizontal swaps
        for (var row=0; row<gameGrid.TOTALROWS; row++) {
            for (var column=0; column<gameGrid.TOTALCOLUMNS-1; column++) {
                // Swap, find clusters and swap back
                swapTwoTiles(column, row, column+1, row);
                findClusters();
                swapTwoTiles(column, row, column+1, row);
                
                // Check if the swap made a cluster
                if (foundClusters.length > 0) {
                    // Found a move
                    moves.push({column1: column, row1: row, column2: column+1, row2: row});
                }
            }
        }
        
        // Check vertical swaps
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            for (var row=0; row<gameGrid.TOTALROWS-1; row++) {
                // Swap, find clusters and swap back
                swapTwoTiles(column, row, column, row+1);
                findClusters();
                swapTwoTiles(column, row, column, row+1);
                
                // Check if the swap made a cluster
                if (foundClusters.length > 0) {
                    // Found a move
                    moves.push({column1: column, row1: row, column2: column, row2: row+1});
                }
            }
        }
        
        // Reset clusters
        foundClusters = []
    }
    
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
    
    // Remove the clusters
    function removeClusters() {
        log("removing clusters");
        // Change the type of the tiles to -1, indicating a removed tile
        loopClusters(function(index, column, row, cluster) { gameGrid.tiles[column][row].type = -1; });

        // Calculate how much a tile should be shifted downwards
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            var shift = 0;
            for (var row=gameGrid.TOTALROWS-1; row>=0; row--) {
                // Loop from bottom to top
                if (gameGrid.tiles[column][row].type == -1) {
                    // Tile is removed, increase shift
                    shift++;
                    gameGrid.tiles[column][row].shift = 0;
                } else {
                    // Set the shift
                    gameGrid.tiles[column][row].shift = shift;
                }
            }
        }
    }
    
    // Shift tiles and insert new tiles
    function shiftTiles() {
        // Shift tiles
        log("shifting tiles");
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            for (var row=gameGrid.TOTALROWS-1; row>=0; row--) {
                // Loop from bottom to top
                if (gameGrid.tiles[column][row].type == -1) {
                    // Insert new random tile
                    gameGrid.tiles[column][row].type = getRandomTile();
                } else {
                    // Swap tile to shift it
                    var shift = gameGrid.tiles[column][row].shift;
                    if (shift > 0) {
                        swapTwoTiles(column, row, column, row+shift)
                    }
                }
                
                // Reset shift
                gameGrid.tiles[column][row].shift = 0;
            }
        }
    }
    
    // Get the tile under the mouse
    // keep this one
    function getMouseTile(pos) {
        // Calculate the index of the tile
        var mouseX = Math.floor((pos.x - gameGrid.x) / gameGrid.TILEWIDTH);
        var mouseY = Math.floor((pos.y - gameGrid.y) / gameGrid.TILEHEIGHT);
        
        // Check if the tile is valid
        if (mouseX >= 0 && mouseX < gameGrid.TOTALCOLUMNS && mouseY >= 0 && mouseY < gameGrid.TOTALROWS) {
            // Tile is valid
            return {
                valid: true,
                x: mouseX,
                y: mouseY
            };
        }
        
        // No valid tile
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }
    
    // Check if two tiles can be swapped
    // depreciate this for whole clickin'
    function canSwap(x1, y1, x2, y2) {
        // Check if the tile is a direct neighbor of the selected tile
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }
        
        return false;
    }
    
    // Swap two tiles in the level
    // depreciate this
    // or better yet, use for falling function
    function swapTwoTiles(x1, y1, x2, y2) {
        var typeswap = gameGrid.tiles[x1][y1].type;
        gameGrid.tiles[x1][y1].type = gameGrid.tiles[x2][y2].type;
        gameGrid.tiles[x2][y2].type = typeswap;
    }
    
    // Swap two tiles as a player action
    // depreciate this
    function mouseSwap(c1, r1, c2, r2) {
        // Save the current move
        currentMove = {column1: c1, row1: r1, column2: c2, row2: r2};
    
        // Deselect
        gameGrid.selectedtile.selected = false;
        
        // Start animation
        animationState = 2;
        animationTime = 0;
        gameState = currentGameState.resolve;
    }
    
    // On mouse movement
    // keep
    function onMouseMove(event) {
        // Get the mouse position
        var mousePosition = getMousePosition(canvas, event);
        
        // Check if we are dragging with a tile selected
        if (isMouseDragging && gameGrid.selectedtile.selected) {
            // Get the tile under the mouse
            mt = getMouseTile(mousePosition);
            if (mt.valid) {
                // Valid tile
                
                // Check if the tiles can be swapped
                if (canSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row)){
                    // Swap the tiles
                    mouseSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row);
                }
            }
        }
    }
    
    // On mouse button click
    // keep, but change
    function onMouseDown(event) {
        
        var mousePosition = getMousePosition(canvas, event); // Get the mouse position
        
        // Start dragging
        // get rid of this in favor of click
        if (!isMouseDragging) {
            // Get the tile under the mouse
            mt = getMouseTile(mousePosition);
            
            if (mt.valid) {
                // Valid tile
                var swapped = false;
                if (gameGrid.selectedtile.selected) {
                    if (mt.x == gameGrid.selectedtile.column && mt.y == gameGrid.selectedtile.row) {
                        // Same tile selected, deselect
                        gameGrid.selectedtile.selected = false;
                        isMouseDragging = true;
                        return;
                    } else if (canSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row)){
                        // Tiles can be swapped, swap the tiles
                        mouseSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row);
                        swapped = true;
                    }
                }
                
                if (!swapped) {
                    // Set the new selected tile
                    gameGrid.selectedtile.column = mt.x;
                    gameGrid.selectedtile.row = mt.y;
                    gameGrid.selectedtile.selected = true;
                }
            } else {
                // Invalid tile
                gameGrid.selectedtile.selected = false;
            }

            // Start dragging
            isMouseDragging = true;
        }
        
        // Check if a button was clicked
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
                    // AI Bot
                    isAIBotRunning = !isAIBotRunning;
                    gameButtons[i].text = (isAIBotRunning?"Disable":"Enable") + " AI Bot";
                }
            }
        }
    }

    // TODO: only if super-debug mode is on
    function debugMessage(mymessage){
        console.log(mymessage);
    }

    // keep? 
    function titleChange(myTItle){
        document.title = myTItle; 
    }
    
    function onMouseUp(e) {
        // Reset dragging
        isMouseDragging = false;
    }
    
    function onMouseOut(e) {
        // Reset dragging
        isMouseDragging = false;
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
    
    // Call init to start the game
    initGame();
};