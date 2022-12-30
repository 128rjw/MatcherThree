    // can depreciate
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

// On mouse movement
    // keep(not really needed tho)
    function onMouseMove(event) {
        // Get the mouse position
        var mousePosition = getMousePosition(canvas, event);
        // Check if we are dragging with a tile selected
        if (gameGrid.selectedtile.selected) {
            // Get the tile under the mouse
            mt = getMouseTile(mousePosition);
            if (mt.valid) {
                // Valid tile

                // the game move starts here!
                console.log("process line here");
                // Check if the tiles can be swapped
                // depreciate this
                if (canSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row)){
                    // Swap the tiles(don't)
                    mouseSwap(mt.x, mt.y, gameGrid.selectedtile.column, gameGrid.selectedtile.row);
                }
            }
        }
    }


    // Check if two tiles can be swapped
    // depreciate this
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



    // On mouse button click
    // keep, but change
    function onMouseDownOld(event) {

        var mousePosition = getMousePosition(canvas, event); // Get the mouse position
        console.log(`onmousedown fired`);
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
                        // Tiles can be swapped, swap the tiles(obsolete)
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
        for (var thisButton=0; thisButton<gameButtons.length; thisButton++) {
            if (mousePosition.x >= gameButtons[thisButton].x && mousePosition.x < gameButtons[thisButton].x+gameButtons[thisButton].width &&
                mousePosition.y >= gameButtons[thisButton].y && mousePosition.y < gameButtons[thisButton].y+gameButtons[thisButton].height) {

                // Button i was clicked
                if (thisButton == 0) {
                    // New Game
                    startNewGame();
                } else if (thisButton == 1) {
                    // Show Moves
                    showMoves = !showMoves;
                    gameButtons[thisButton].text = (showMoves?"Hide":"Show") + " Moves";
                }
            }
        }




    // Find clusters in the level
    // runs often
    // not needed really?
    function findClusters() {
        //log('finding clusters');
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
                        //log(`found horizontal cluster ${matchLength}`);
                    }

                    matchLength = 1;
                }
            }


    // Shift tiles and insert new tiles
    // TODO: shift downward
    function shiftTiles() {
        // Shift tiles
        log("shifting tiles");
        for (var column=0; column<gameGrid.TOTALCOLUMNS; column++) {
            for (var row=gameGrid.TOTALROWS-1; row>=0; row--) {
                // Loop from bottom to top
                if (gameGrid.tiles[column][row].type == -1) {
                    // Insert new random tile
                    gameGrid.tiles[column][row].type = returnRandomTileColor();
                } else {
                    // Swap tile to shift it
                    var shift = gameGrid.tiles[column][row].shift;
                }

                // Reset shift
                gameGrid.tiles[column][row].shift = 0;
            }
        }
    }

}