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
        pasvFoundMatches: 0,
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

    // numeric tile types
    // 0 - empty
    // 1 - plain tile
    // 2 - bomb 

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

        // when swapping tiles
        // set ALL properties but the xcor and ycor
        // 
        graftTile(ddd){
            this.tileType = ddd.tileType;
            this.tileColor = ddd.tileColor;
            this.markedTile = false;
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
        //console.log(`thistile: XCOR:  ${thisTile.xcor}`);
        //var translatedTileX =  thisTile.xcor + (column + columnOffset) * TILEWIDTH; // original
        //var translatedTileY = thisTile.ycor + (row + rowOffset) * TILEHEIGHT;  
        var translatedTileX =  column + (column + columnOffset) * TILEWIDTH;  // ok so far
        var translatedTileY = row + (row + rowOffset) * TILEHEIGHT;  
        return { tilex: translatedTileX, tiley: translatedTileY};
    }


    // draw grid tiles
    // the outer loop
    function drawTheGrid(){
        //console.log('drawing the grid of tiles');        
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
        if (level.tiles[x][y].tileType  == myTileTypes.plainTile)  // breaks here
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
        canvas.addEventListener("onkeydown",onKeyDown);
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


    function onKeyDown(event){
        var keyCode = ('which' in event) ? event.which : event.keyCode;
        console.log(`you presed: ${keyCode}`);
    }


    // CLICK FUNCTION EVENT
    // branches between button clicks or tile clicks, or nothing
    function onMouseDown(event){
        var mousePos = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePos);

        // TILE CLICK
        // redo this to handle any type
        // 
        if (mt.validTileClick) {
                PlayTileTurn(mt.x,mt.y);
        }
        else
        {
        // BUTTON CLICK
        for (var aGameButton=0; aGameButton<Buttons.length; aGameButton++) {
            if (mousePos.x >= Buttons[aGameButton].x && mousePos.x < Buttons[aGameButton].x+Buttons[aGameButton].width &&
                mousePos.y >= Buttons[aGameButton].y && mousePos.y < Buttons[aGameButton].y+Buttons[aGameButton].height)
                 {
                    if (aGameButton == 0) {
                        drawTheGrid();
                    }
                     else if (aGameButton == 1) {
                        zap1_1_tile();
                    } 
                    else if (aGameButton == 2) {
                    drawTheGrid();
                   }  
                   else
                   {
                    console.log(`nothing clicked`);
                   }
                }                   
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
        thisTurn.colorInPlay = -1; 
        thisTurn.clickedTileX = -1;
        thisTurn.clickedTileY = -1;
        thisTurn.colorInPlay = -1;
        thisTurn.foundMatchedTiles = false;
        thisTurn.foundanyNeighbor = false;    
        pasvFoundMatches = 0;     
    }



    // THE BIG TURN
    // 
    function PlayTileTurn(x,y){
        // determine clicked-on type
        console.log(`playing tile ${x},${y}`);  
        if (level.tiles[x][y].tileType == myTileTypes.plainTile) // switch for bomb, etc
        {
            thisTurn.colorInPlay = level.tiles[x][y].tileColor
            // first, passive check for neighbors
            checkNeighbors(x,y,false); // do passive check first
            if (thisTurn.markedNeighbors>0){
                console.log(`found matched tiles, erasing`);
                checkNeighbors(x,y,true); // active checking
                recursiveCheckNeighbors();
                eraseMarkedPieces();
                fallDownPieces();               
                
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

    // now find neigboring tiles we haven't found yet
    function recursiveCheckNeighbors(){
        var recrFoundTiles = 0; // private counter 
        console.log(`recursive check neighbors`);
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].tileColor == thisTurn.colorInPlay && 
                    level.tiles[row][col].markedTile == true)
                    {     
                        checkNeighbors(row,col,true);
                        //checkSouthNeighbor(row,col,true);
                        //console.log('loop test');
                    }
            }
        }       

    }




    // checks if the tile has any neighbors
    // but doesn't set off the ball
    // deterines if it is a valid move
    // just 1-square NESW match
    function checkNeighbors(x,y,active){
        console.log(`pasv: ${x},${y}   color/type seeking: ${tilecolors[level.tiles[x][y].tileColor]}`); 
        var foundAnyNeighbor = false;
        if (x==0) // left edge case
            {
                if (checkEastNeighbor(x,y,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }    
            }                    
        if (x>0 && x<TOTALCOLUMNS-1)
            {
            // check right                  
            if ( checkEastNeighbor(x,y,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                                  
            // check west
            if ( checkWestNeighbor(x,y,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                           
           }
        if  (x==TOTALCOLUMNS)  // right edge case(double check this)
        {
            if ( checkWestNeighbor(x,y,active))
            {
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true; 
            }         
        }

        
        // topmost, south match only
        if (y==0)
        {
            if ( checkSouthNeighbor(x,y,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            
        }
        else if  (y>0 && y<TOTALROWS-1) // in between
        {       
            if ( checkSouthNeighbor(x,y,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            // check north
            if (checkNorthNeighbor(x,y,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }

        }
        else if  (y==TOTALROWS) // bottom edge case
        {
            if (checkNorthNeighbor(x,y,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
        }

        // END OF NEIGHBOR CHECK

        if (foundAnyNeighbor==false)
        {
            console.log(`no matches found`);
            //thisTurn.colorInPlay = -1; // -1 is no matches
        }
        else{
            // mark self-tile as marked
            if (active) {level.tiles[x][y].markTile();} 
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
        if (level.tiles[x+1][y].tileColor == thisTurn.colorInPlay)
        {
            thisTurn.pasvFoundMatches+=1;
            foundAnyNeighbor = true; 
            if (shouldMark) { level.tiles[x+1][y].markTile(); }
        }  
        return foundAnyNeighbor; 
    }

    function checkWestNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            //console.log(`(middle)west color: ${tilecolors[level.tiles[x-1][y].tileColor]}`);
            if ( level.tiles[x-1][y].tileColor == level.tiles[x][y].tileColor)
                {
                    thisTurn.pasvFoundMatches+=1;
                    foundAnyNeighbor = true; 
                    if (shouldMark) { level.tiles[x-1][y].markTile(); }
                }            
                return foundAnyNeighbor;                                            
        }
    

    function checkSouthNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            //console.log(`south color: ${tilecolors[level.tiles[x][y+1].tileColor]}`);
            if ( level.tiles[x][y+1].tileColor == thisTurn.colorInPlay)            
            {                               
                thisTurn.pasvFoundMatches+=1;
                foundAnyNeighbor = true;
                if (shouldMark) { level.tiles[x][y+1].markTile(); }   
            }
        return foundAnyNeighbor;             
    }

    // check upward    
    function checkNorthNeighbor(x,y,shouldMark){
        var foundAnyNeighbor = false;
            //console.log(`north color: ${tilecolors[level.tiles[x][y-1].tileColor]}`);
            if ( level.tiles[x][y-1].tileColor == thisTurn.colorInPlay)            
            {               
                thisTurn.pasvFoundMatches+=1;
                foundAnyNeighbor = true;
                if (shouldMark) { level.tiles[x][y-1].markTile(); }   
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
        quickTileReport(1,1);
        eraseMarkedPieces(); 
        fallDownPieces(); 
        drawTheGrid();
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
    // works 
    function eraseMarkedPieces(){
        console.log(`about to erase marked pieces.`);  
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markedTile == true)
                {           
                    level.tiles[row][col].eraseTile(); 
                }
            }
        }         
    }


   
    // down to up
    // needs rebuilding
    // go column by column individually
    // this.tileType = myTileTypes.empty;
    // needs a rewrite
    function fallDownPieces()
    {
        console.log(`** falling down pieces **`);
        for (let col = 0; col < TOTALCOLUMNS; col++) {  // column left to right
            console.log(`total empty pieces for column ${col} count: ${countEmptiesPerColumn(col)}`);
            if (countEmptiesPerColumn(col)>0) { // pre-check                    
                fallVerticalGrabLoop(col);
            }
        }
    console.debug(`fall pieces done`);
    }


    // a totally new function
    // will need top fill
    // just re-do the stack
    function fallVerticalGrabLoop(col)
    {
        // collect all non-blanks
        var nonBlankTiles = new Array(); 
        var myCounter = 0; 
        for (let thisRow = TOTALROWS-1; thisRow > 0; thisRow--) {
                     // loop upward
                    if (level.tiles[col][thisRow].tileType !=myTileTypes.empty){
                        var targetTile = level.tiles[col][thisRow]; //<- the tile to add
                        var targetX = level.tiles[col][thisRow].xcor;
                        var targetY = level.tiles[col][thisRow].ycor;
                        var thisTileType = level.tiles[col][thisRow].tileType;
                        //nonBlankTiles.push(new gameTile(targetX,targetY)); // xcor & ycor are messed up
                        //nonBlankTiles[myCounter++].tileColor = level.tiles[col][thisRow].tileColor;
                    }
        }

        // erase the tiles(start fresh)
        for (let thisRow = TOTALROWS-1; thisRow > 0; thisRow--) {
            // loop upward
           level.tiles[col][thisRow].eraseTile();
           }

        // re-graft the tiles
        var upCounter = 0; 
        for (let thisRow = TOTALROWS-1; thisRow > 0; thisRow--) {
            // loop upward
           level.tiles[col][thisRow] = nonBlankTiles[upCounter++];
           }           
    }   



    function quickTileReport(col,row){
        console.log(`    >col${col},row:${row} color:${level.tiles[col][row].tileColor}`);
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
    // works!
    function countEmptiesPerColumn(col)
    {
        var foundEmpties =0;
            for (let row=0; row<TOTALROWS-1;row++) {      
                console.log(`row: ${row}  col${col}`);
                if (level.tiles[row][col].tileType == myTileTypes.empty)
                {
                    //console.log(`found empty ${row},${col}: total: ${foundEmpties}`);
                    foundEmpties+=1;
                }
            //console.log(`total empties for column ${col}: ${foundEmpties}`);                
        }
        return foundEmpties;
    }



    // primary entry point
    init();
}    