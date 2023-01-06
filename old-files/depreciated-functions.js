  // need to recursively run this function
    // on all the marked tiles
    // depreciated
    function checkNeighbors(x,y)
    {
        level.foundMatchedTiles = 0;  // reset
        level.colorInPlay = level.tiles[x][y].tileColor;
        console.log(`${x},${y}   color in play: ${level.colorInPlay}`); // so far so good        
        var selfMatchedTiles = 0; 
        //east
        // left edge case
        if (x==0)
        {
                   if (level.tiles[1][y].tileColor == level.colorInPlay)
                    {
                        console.log(`3 matching color found: 1, ${y}`);
                        level.tiles[1][y].markTile(); 
                        level.tiles[x][y].markTile(); // mark self-tile
                    }    
            }                    
        else if (x>0 && x<TOTALCOLUMNS)
        {
            console.log(`got color back: ${level.tiles[x+1][y].tileColor}`);
            if ( level.tiles[x+1][y].tileColor == level.colorInPlay)
                {
                    level.tiles[x+1][y].markTile(); 
                    level.tiles[x][y].markTile(); // mark self-tile
                }                           
        }
        else if (x==TOTALCOLUMNS)
        {
            // check west only
            if ( level.tiles[x-1][y].tileColor == level.colorInPlay)
            {
                level.tiles[x-1][y].markTile(); 
                level.tiles[x][y].markTile(); // mark self-tile
            } 
        }

        // topmost, south match
        if (y==0)
        {
            if ( level.tiles[x][1].tileColor == level.colorInPlay)            
            {   
                level.tiles[x][1].markTile(); 
                level.tiles[x][y].markTile(); // mark self-tile   
            }
        }
        else if (y>0 && y<TOTALROWS)
        {
            
        }

        if (level.foundMatchedTiles>1)
        {
            console.log(`matches found`);
        }
        else{
            console.log(`..matches not found`);
        }

    }


    function swapTwoTiles(alphaX,alphaY,betaX,betaY){
        var firstTile = level.tiles[alphaX][alphaY];
        var secondTile = level.tiles[betaX][betaY];
        level.tiles[betaX][betaY] = firstTile;
        level.tiles[alphaX][alphaY] = secondTile; 
    }    


    
    // checks if the tile has any neighbors
    // but doesn't set off the ball
    // deterines if it is a valid move
    // just 1-square NESW match
    function passiveCheckNeighbors(x,y){
        var pasvFoundMatches = 0; // found matches so far(private value)
        level.colorInPlay = level.tiles[x][y].tileColor; // if nothing, set to -1 MIGHT MOVE THIS DOWN
        console.log(`pasv: ${x},${y}   color/type: ${tilecolors[level.tiles[x][y].tileColor]}`); // so far so good
        var foundAnyNeighbor = false;
        switch (x)
        {
        case (x==0): // left edge case
            {
                if (level.tiles[1][y].tileColor == level.colorInPlay)
                {
                    console.log(`east color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }    
            }                    
        case (x>0 && x<TOTALCOLUMNS): 
            {
            // check right
            console.log(`east color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x+1][y].tileColor == level.colorInPlay)
                {
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }                                   
            // check west
            console.log(`west color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x-1][y].tileColor == level.colorInPlay)
                {
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }                           
           }
        case (x==TOTALCOLUMNS):  // right edge case(double check this)
        {
            console.log(`west color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x-1][y].tileColor == level.colorInPlay)
            {
                pasvFoundMatches++;
                foundAnyNeighbor = true; 
            } 
            break;
        }
        }
        // topmost, south match
        switch (y)
        {
        case (0):
        {
            console.log(`south color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x][1].tileColor == level.colorInPlay)            
            {                   
                pasvFoundMatches++;
                foundAnyNeighbor = true;                   
            }
        }
        case (y>0 && y<TOTALCOLUMNS):
        {       
            console.log(`south color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x][y+1].tileColor == level.colorInPlay)            
            {               
                pasvFoundMatches++;
                foundAnyNeighbor = true;   
            }
        }
        case (y==TOTALCOLUMNS):
        {
            console.log(`west color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);
            if ( level.tiles[x][y-1].tileColor == level.colorInPlay)            
            {               
                pasvFoundMatches++;
                foundAnyNeighbor = true;   
            }
        }

        if (foundAnyNeighbor==false)
        {
            level.colorInPlay = -1; // -1 is no matches
        }
        else
        {
            console.log(`found matching neighbors`);
        }

        // just return it back(true)
        return foundAnyNeighbor; 
    }
}


function initGameplayClick(x,y){
    level.foundMatchedTiles = 0;  // reset
    level.colorInPlay = level.tiles[x][y].tileColor;
    console.log(`${x},${y}   color in play: ${level.colorInPlay}`); // so far so good        
    var selfMatchedTiles = 0; 
            
}


// the big function
    //
    function checkNeighbors_old(x,y){
        level.foundMatchedTiles = 0; 
        level.colorInPlay = level.tiles[x][y].tileColor;
        

        // mark clicked tag for self-notcied in play
        level.tiles[x][y].markTileToDelete();

        var scanX = x; 
        var lastXFound = -1; //self marker
        while (scanX<TOTALCOLUMNS-1)
        {
            console.log(`check: ${level.tiles[scanX][y].tileColor}`)
            if (level.tiles[scanX+1][y].tileColor == level.colorInPlay &&
                level.tiles[(scanX+1)][y].markTile == false)
            {
                console.log(`${level.foundMatchedTiles}  EAST MATCH >>>> ${scanX+1},${y}`);
                lastXFound = scanX; 
                level.foundMatchedTiles+=1;
                level.tiles[scanX+1][y].markTileToDelete(); 
            }            
            scanX++;
        }        
        // if we found matches, we need to mark the tile itself as 'in play'
        if (level.foundMatchedTiles>0){
            level.tiles[x][y].markTileToDelete(); // delete self tile
            console.log(`tiles played this turn: ${level.foundMatchedTiles}`);
            level.totalTurns+=1; 
        }
        else
        {
            console.log(`no matches found: (so far)`);
        }

        // END OF TURN(handled in next method)
    }