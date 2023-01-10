// fresh match 3 lib

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    console.log('window onload loaded');
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");


    // Level object
    var level = {
        x: 250,         // X position of canvas?
        y: 113,         // Y position
        DIVERSITYLEVEL: 5, // how diverse are the colors? 
        tiles: [],      // The two-dimensional tile array
        score: 0,
        colorInPlay: -1, // positive - tileColor when clicked
        totalTurns: 0
    };

    var thisTurn = {
        markedNeighbors: 0,
        colorInPlay: -1,
        clickedTileX: -1,
        clickedTileY: -1,
        foundMatchedTiles: 0,
        totalErasedTiles: 0,
        foundanyNeighbor: false
    }


    // constants
    var BACKGROUNDCOLOR = "#d0d0d0";
    var XCANVASOFFSET=  250         // X position of canvas?(for coords 0,0)
    var YCANVASOFFSET=  113         // Y position
    var TOTALCOLUMNS=  8     // Number of tile columns
    var TOTALROWS=  8        // Number of tile rows
    var TILEWIDTH=  40  // Visual width of a tile
    var TILEHEIGHT=  40 // Visual height of a tile    

    var Buttons = [ { x: 30, y: 270, width: 120, height: 40, text: "New Game"},
                    { x: 30, y: 330, width: 120, height: 40, text: "Zap tile 1,1"},    
                    { x: 30, y: 390, width: 120, height: 40, text: "Refresh tiles"}];                        


    // Game states
    var gameStates = { init: 0, ready: 1, inProgress: 3 };
    var animationState = {};
    var gameState = gameStates.init;       

    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        horizRocket: Symbol("horizRocket"),
        vertRocket: Symbol("vertRocket")
    }

    var tilecolors = ["Blue",
                        "Crimson",
                        "DarkGreen",
                        "DarkOrange",
                        "Sienna"];


    // NOTE: xcor, ycor isn't really used
    // 
    class gameTile
     {
        constructor(xcor,ycor){
            this.xcor = xcor;  // not really used(2-dim array used instead)
            this.ycor = ycor;            
            this.markedTile = false; 
            this.tileType = myTileTypes.plainTile;
            this.tileColor  = returnRandomTileColor(); 
        }

        // in play!
        markTile()
        {
            console.log(`>>tile ${this.xcor},${this.ycor} marked`);
            this.markedTile = true;
        }

        // don't use
        setasPlaytile()
        {
            console.log(`>>tile ${this.xcor},${this.ycor} set as primary play tile`);
            this.markedTile  = true;
        }

        eraseTile()
        {
            this.tileColor = -1;
            this.tileType = myTileTypes.empty;
            this.markedTile = false; // might need to change later
            console.log(`&&  tile ${this.xcor},${this.ycor} erased`); 
        }

        Regenerate(){ 
            this.markedTile = false;
            this.tileType = myTileTypes.plainTile;
            this.tileColor  = returnRandomTileColor();  // redraw itself maybe?
            //console.log(`tile ${this.xcor},${this.ycor} regenerated`); 
        }


    }

    function startNewGame(){
        console.log('starting new game');
        level.totalTurns = 0; 
        regenerateTiles(); 
        level.targetColor = -1;        
        drawTheGrid(); 
        gameState = gameStates.inProgress;
    }


    function drawGUI(){  
        drawGridFrame();
        drawButtons();  
        drawTheGrid(); // draw tile grid(done repeatedly)
    }



    // Draw a frame with a border
    // blanks it all out
    // fun first?
    function drawGridFrame() {
        // Draw header block
        context.fillStyle = "green";
        context.fillRect(0, 0, canvas.width, 65);

        context.fillStyle = "darkgreen";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = BACKGROUNDCOLOR; 
        context.fillRect(1, 1, canvas.width-2, canvas.height-2); // the actual canvas

        // Draw title top bar
        // all of this will change
        context.fillStyle = "red";
        context.font = "24px Verdana";
        context.fillText("Match 3 Game", 10, 30);
        console.log('drawing grid frame FINISHED');
    }




    // Draw buttons
    function drawButtons() {
        for (var thisButton=0; thisButton<Buttons.length; thisButton++) {
            context.fillStyle = "white";
            context.fillRect(Buttons[thisButton].x, Buttons[thisButton].y, Buttons[thisButton].width, Buttons[thisButton].height);
            context.fillStyle = "black";
            context.font = "18px Verdana"; 
            var textdim = context.measureText(Buttons[thisButton].text);
            context.fillText(Buttons[thisButton].text, Buttons[thisButton].x + (Buttons[thisButton].width-textdim.width)/2, Buttons[thisButton].y+30);
        }
    }    

    
    // Get the mouse position
    function getMousePosition(canvas, event) {
        var boundingRectangle = canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - boundingRectangle.left)/(boundingRectangle.right - boundingRectangle.left)*canvas.width),
            y: Math.round((event.clientY - boundingRectangle.top)/(boundingRectangle.bottom - boundingRectangle.top)*canvas.height)
        };        
    }


    // just for drawing tiles
    function getTileCoordinate(column, row, columnOffset, rowOffset) {
        var thisTile = level.tiles[column][row];   
        var translatedTileX =  thisTile.xcor + (column + columnOffset) * TILEWIDTH;
        var translatedTileY = thisTile.ycor + (row + rowOffset) * TILEHEIGHT;  
        return { tilex: translatedTileX, tiley: translatedTileY};
    }


    // draw grid tiles
    // the outer loop
    function drawTheGrid(){
        console.log('drawing the grid of tiles');        
        // TODO: erase board? 
        for (let column=0; column<TOTALCOLUMNS; column++) {
            for (let row=0; row<TOTALROWS; row++) {
                        drawTile(row,column);                    
                }
            }
    }

    // for post-move
    function regenerateTiles(){
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row<TOTALROWS; row++) {
                        level.tiles[column][row].Regenerate();
                }
            } 
    }


    function drawTile(x,y){
        var myCoordinates = getTileCoordinate(x, y, 6, 3);     
        if (level.tiles[x][y].tileType  == myTileTypes.plainTile)
        {            
            context.fillStyle = tilecolors[level.tiles[x][y].tileColor]; 
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }
        else if (level.tiles[x][y].tileType == myTileTypes.empty){
            context.fillStyle = BACKGROUNDCOLOR; //  
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }
        else if (level.tiles[x][y].tileType == myTileTypes.Bomb){
            console.log('bomb');
        }

    }



    // graphics library
    // TODO: tweakable diversity
    function returnRandomTileColor() {
        var myValue = Math.floor(Math.random() * tilecolors.length); 
        //console.log(`fresh tile color: ${myValue} translates to ${tilecolors[myValue]} `);
        return myValue;
    }    


    // ENTRY POINT
    function init()
    {   
        console.clear(); 
        console.log("MAIN INIT");
        canvas.addEventListener("mousedown", onMouseDown);  
        // initialize the tile grid(mandatory)
        for (var thisColumn=0; thisColumn<TOTALCOLUMNS; thisColumn++) {
            level.tiles[thisColumn] = []; 
            for (var thisRow=0; thisRow<TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] =  new gameTile(thisColumn,thisRow); 
            }
        }        
        drawGUI(); // works
        gameState = gameStates.ready;
    }




    // CLICK FUNCTION EVENT
    // branches between button clicks or tile clicks, or nothing
    function onMouseDown(event){
        var mousePos = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePos);

        // TILE CLICK
        if (mt.validTileClick) {
            level.colorInPlay =  level.tiles[mt.x][mt.y].tileColor;
            if (passiveCheckNeighbors(mt.x,mt.y) == true)
            {
                console.log(`playing tile turn ${tilecolors[level.colorInPlay]}`);  // works
                PlayTileTurn(mt.x,mt.y);
            }
            else
            {
                console.log('no neighbors found');
            }
        }

        // BUTTON CLICK
        for (var aGameButton=0; aGameButton<Buttons.length; aGameButton++) {
            if (mousePos.x >= Buttons[aGameButton].x && mousePos.x < Buttons[aGameButton].x+Buttons[aGameButton].width &&
                mousePos.y >= Buttons[aGameButton].y && mousePos.y < Buttons[aGameButton].y+Buttons[aGameButton].height)
                 {
                    if (aGameButton == 0) {
                        startNewGame();
                    } else if (aGameButton == 1) {
                        zap1_1_tile();
                    } 
                } 
                    else if (aGameButton == 2) {
                    drawTheGrid();
                   }                     
            }
        }

        // TODO:
        // you can refresh things here, refreshes each click

    

    // input: pixel coordinates 
    // output: tile coordinates
    function getMouseTile(position) {
        var mouseX = Math.floor((position.x -XCANVASOFFSET) / TILEWIDTH);
        var mouseY = Math.floor((position.y - YCANVASOFFSET) / TILEHEIGHT);
        // Check if the tile is valid
        if (mouseX >= 0 && mouseX < TOTALCOLUMNS && mouseY >= 0 && mouseY < TOTALROWS) {
            return {
                validTileClick: true,
                x: mouseX,
                y: mouseY
            };
        }
        return {            
            validTileClick: false,
            x: -1,
            y: -1  // used to be zero, change back if it breaks things
        };
    }


    // resets the turn
    function resetTurn()
    {
        thisTurn.clickedTileX = -1;
        thisTurn.clickedTileY = -1;
        thisTurn.colorInPlay = -1;
        thisTurn.foundMatchedTiles = false;
        thisTurn.foundanyNeighbor = false;        
    }




    function PlayTileTurn(x,y){
        // determine clicked-on type
        if (level.tiles[x][y].tileType == myTileTypes.plainTile) // switch for bomb, etc
        {
            // first, passive check for neighbors
            markCheckNeighbors(x,y); // do passive check first
            if (thisTurn.markedNeighbors>0){
                console.log(`found matched tiles, erasing`);
                eraseMarkedPieces();
                //fallDownPieces(); // gravity                        
                
            }
        }
        else
        {
            console.log('non-tile clicked(future expansion)');
        }
        drawTheGrid(); // refresh screen
        // reset round here
        resetTurn(); 
    }



    // some debugging functions


    // returns # of tiles for selected color
    // on board. 
    // prevents board rendering. weird
    function totalTilesOnBoardForColor(thisColor){
        foundTiles = 0; 
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].tileColor == thisColor)
                {           
                    foundTiles++;
                    //console.log('loop test');
                }
            }
        }       
        //console.log(`found tiles for color ${tilecolors[thisColor]}: ${foundTiles} `);
        return foundTiles; 
    }




    // checks if the tile has any neighbors
    // but doesn't set off the ball
    // deterines if it is a valid move
    // just 1-square NESW match
    function passiveCheckNeighbors(x,y){
        console.log(`pasv: ${x},${y}   color/type seeking: ${tilecolors[level.tiles[x][y].tileColor]}`); 
        var foundAnyNeighbor = false;
        if (x==0) // left edge case
            {
                if (checkEastNeighbor(x,y,false))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }    
            }                    
        if (x>0 && x<TOTALCOLUMNS-1)
            {
            // check right                  
            if ( checkEastNeighbor(x,y,false))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                                  
            // check west
            if ( checkWestNeighbor(x,y,false))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                           
           }
        if  (x==TOTALCOLUMNS)  // right edge case(double check this)
        {
            if ( checkWestNeighbor(x,y,false))
            {
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true; 
            }         
        }

        
        // topmost, south match only
        if (y==0)
        {
            if ( checkSouthNeighbor(x,y,false))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            
        }
        else if  (y>0 && y<TOTALROWS-1) // in between
        {       
            if ( checkSouthNeighbor(x,y,false))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            // check north
            if (checkNorthNeighbor(x,y,false))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }

        }
        else if  (y==TOTALROWS) // bottom edge case
        {
            if (checkNorthNeighbor(x,y,false))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
        }
        if (foundAnyNeighbor==false)
        {
            console.log(`no matches found`);
            //level.colorInPlay = -1; // -1 is no matches
        }
        else{
            // mark self-tile as marked
            level.tiles[x][y].markTile(); 
        }
        // just return it back(true)
        console.log(`(foundanyneighbor) passive check neighbors: ${foundAnyNeighbor}`); // always false
        return foundAnyNeighbor; 
    }


    // check east neighbor
    // x- x value of tile
    // y - y value of tile
    // shouldmark(bool) - mark for deletion?
    function checkEastNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
        if (level.tiles[x+1][y].tileColor == level.colorInPlay)
        {
            level.pasvFoundMatches+=1;
            foundAnyNeighbor = true; 
            if (shouldMark) { level.tiles[x+1][y].markTile(); }
        }  
        return foundAnyNeighbor; 
    }

    function checkWestNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            console.log(`(middle)west color: ${tilecolors[level.tiles[x-1][y].tileColor]}`);
            if ( level.tiles[x-1][y].tileColor == level.tiles[x][y].tileColor)
                {
                    level.pasvFoundMatches+=1;
                    foundAnyNeighbor = true; 
                    if (shouldMark) { level.tiles[x-1][y].markTile(); }
                }            
                return foundAnyNeighbor;                                            
        }
    

    function checkSouthNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            console.log(`south color: ${tilecolors[level.tiles[x][y+1].tileColor]}`);
            if ( level.tiles[x][y+1].tileColor == level.colorInPlay)            
            {                               
                level.pasvFoundMatches+=1;
                foundAnyNeighbor = true;   
            }
        return foundAnyNeighbor;             
    }

    // check upward    
    function checkNorthNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            console.log(`north color: ${tilecolors[level.tiles[x][y-1].tileColor]}`);
            if ( level.tiles[x][y-1].tileColor == level.colorInPlay)            
            {               
                level.pasvFoundMatches+=1;
                foundAnyNeighbor = true;
            }
            return foundAnyNeighbor; 
    }

    function tileReport(){
        console.log(`tile report(TODO)`);
    }

    // DEBUG ONLY
    // zaps specific tile
    function zap1_1_tile(){
        level.tiles[1][1].eraseTile(); 
        eraseMarkedPieces(); 
        //fallDownPieces(); 
    }
    


    // part of the recursive function
    // marks matching nearby tiles.
    // potential for infinite loop, careful 
    // this is useless
    function markCheckNeighbors(row,col){
        console.log(`mark-checking neighbors`);
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markedTile == true) {           
                    console.log(`found marked tile...${row}${col} `);
                    thisTurn.markCheckNeighbors+=1; 
                }
            }                    
        }        
        console.log(`total thisturn.markedneighbors: ${thisTurn.markedNeighbors}`);
    }


    // part of checking for neighbors
    // also a safety brake
    function countmarkedTiles(){
        var totalCount = 0; 
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markedTile == true) {           
                    console.log(`found marked tile...${row}${col} `);
                    totalCount+=1; 
                }
            }                    
        }
    return totalCount; 
    }

    // 2. erase the tiles(same as 1?)
    // works so far
    // pre-drop
    function eraseMarkedPieces(){
        console.log(`about to erase marked pieces. total marked ${thisTurn.foundMatchedTiles}`);
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markedTile == true)
                {           
                    console.log(`erasing tile...${row}${col} `);
                    level.tiles[row][col].eraseTile(); 
                }
            }
        }         
    }

   
   
    // down to up
    // needs rebuilding
    // go column by column individually
    function fallDownPieces()
    {
        console.log(`** falling down pieces **`);
        var safety=TOTALROWS; // recursive function
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {  // column left to right
                if (countEmptiesPerColumn(col)>0) { // pre-check
                    for (let row = TOTALROWS; row < TOTALROWS-1; row--) { // loop upward
                        if (level.tiles[row][col].tileType != myTileTypes.empty && 
                            level.tiles[row+1][col].tileType == myTileTypes.empty)
                            {
                                console.log(`Falling tile ${row} ${col}`);                            
                                var fallingTile = level.tiles[row][col];  // grab original tile
                                level.tiles[row][col].eraseTile(); // do last
                                level.tiles[row+1][col] == fallingTile;
                            }                                
                        }
                }
            }
    console.debug(`fall pieces done`);
    }

    // count all tiles for deletion
    function countMarkedTiles(){
        var markedTilesSofar = 0; 
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markTile == true)        
                {
                    markedTilesSofar+=1; // self-assertion
                }
            }
        }
        return markedTilesSofar; 
    }
    

    // helper function
    // counts empty tiles per column
    // 
    function countEmptiesPerColumn(col)
    {
        var foundEmpties =0;
        for (let col = 0; col <TOTALCOLUMNS; col++) {  
            for (let row=0; row<TOTALROWS-1;row++) {      
                if (level.tiles[row][col].tileType == myTileTypes.empty)
                {
                    //console.log(`found empty ${row},${col}: total: ${foundEmpties}`);
                    foundEmpties+=1;
                }
            //console.log(`total empties for column ${col}: ${foundEmpties}`);                
        }
        }        
        return foundEmpties;
    }



    // primary entry point
    init();
}    