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