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
        clickedTileCol: -1,
        clickedTileRow: -1,
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

    var Buttons = [ { x: 30, y: 210, width: 120, height: 40, text: "New Game"},
                    { x: 30, y: 240, width: 120, height: 40, text: "Zap tile 1,1"},    
                    { x: 30, y: 280, width: 120, height: 40, text: "Refresh tiles"}];                        


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
        constructor(column,row,myTileType,tilecolor){
            //  console.log(`new tile: col${column}, row: ${row} tiletype:${myTileType}`);
            this.column = column;  // not really used(2-dim array used instead)
            this.row = row;            
            this.markedTile = false; 
            this.tileType  = myTileType; // myTileType;
            this.tileColor  =  tilecolor; // returnRandomTileColor(); 
        }




        eraseTile() {
            this.tileType = 0; 
            this.tileColor = -1;
            this.markedTile = true; // might need to change later
            console.log(`&&  tile ${this.column},${this.row} erased`); 
            //level.tiles[self.column][self.row].  //this.redrawSelf(); - messing things up 
        }

        // mark tile for potential deletion
        markTile()   {
            //console.log(`>>tile ${this.col},${this.row} marked`);
            this.markedTile = true;
        }

        redrawSelf()
        {
            drawTile(self.column,self.row);
        }

        // don't use yet
        setasPlaytile()
        {
            console.log(`>>tile ${this.column},${this.row} set as primary play tile`);
            this.markedTile  = true;
        }



        Regenerate(){ 
            this.markedTile = false;
            this.tileType = 1;
            this.tileColor  = returnRandomTileColor();  // redraw itself maybe?
            //console.log(`tile ${this.xcor},${this.ycor} regenerated`); 
        }

        // when swapping tiles
        // set ALL properties but the xcor and ycor
        // don't use yet
        reassignTile(newTileObject){
            console.log(`reassigning tile: ${self.xcor}, ${self.ycor} `);
            this.tileType = newTileObject.tileType;
            this.tileColor = newTileObject.tileColor;
            this.markedTile = false;
        }

        // for moving tiles
        // crude, but should work
        // might only allow for grafting on blank tiles
        // 
        reassignTileMk2(originalTile, newTile){
            console.log(`reassigning tile ${self.xcor} ${self.ycor}`);
            originalTile.tileType = newTile.tileType;
            originalTile.tilecolor = newTile.tilecolor; 
            // anything else?
            this.redrawSelf(); 

        }

        // never gets here
        killTile()
        {
            console.log('destroying tile');
            self.tileType = 0;
            self.tilecolor = -1;
            this.redrawSelf();
            return null; 
        }


    }

    // todo: use reset turn to start
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
        drawTheGrid(); // draw tile grid
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
        console.log('drawing grid');
        for (let column=0; column<TOTALCOLUMNS; column++) {
            for (let row=0; row<TOTALROWS; row++) {
                        drawTile(column,row);                    
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


    function drawTile(col,row){
        var myCoordinates = getTileCoordinate(col, row, 6, 3);     
        //var thisTile = level.tiles[col][row];
        //console.log(`drawing tile; ${col} ${row} type${thisTile.tileType}`);
        if (level.tiles[col][row].tileType == 0){
            context.fillStyle = BACKGROUNDCOLOR; //  
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }

        else if (level.tiles[col][row].tileType   == 1)  
        {            
            context.fillStyle = tilecolors[level.tiles[col][row].tileColor]; 
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }

        else if (level.tiles[col][row].tileType == 2){
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
        gameState = gameStates.init; 
        console.clear(); 
        console.log("MAIN INIT");
        canvas.addEventListener("mousedown", onMouseDown);  
        canvas.addEventListener("onkeydown",onKeyDown);
        // initialize the tile grid(mandatory)
        for (var thisColumn=0; thisColumn<TOTALCOLUMNS; thisColumn++) {
            level.tiles[thisColumn] = []; 
            for (var thisRow=0; thisRow<TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] =  new gameTile(thisColumn,thisRow,1,returnRandomTileColor()); 
            }
        }        
        drawGUI(); // works
        gameState = gameStates.ready;
    }


    // not working
    function onKeyDown(event){
        var keyCode = ('which' in event) ? event.which : event.keyCode;
        console.log(`you presed: ${keyCode}`);
    }

    

    // CLICK FUNCTION EVENT
    // branches between button clicks or tile clicks, or nothing
    function onMouseDown(event){
        var mousePos = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePos);
        if (mt.validTileClick) {
                PlayTileTurn(mt.x,mt.y);
        }
        else 
        {
            console.log('tile not clicked: ');
        }
        console.log(`mousex: ${mousePos.x} ${mousePos.y}`);

        for (var gameButtons=0; gameButtons<Buttons.length; gameButtons++) {
            if (mousePos.x >= Buttons[gameButtons].x && mousePos.x < Buttons[gameButtons].x+Buttons[gameButtons].width &&
                mousePos.y >= Buttons[gameButtons].y && mousePos.y < Buttons[gameButtons].y+Buttons[gameButtons].height)
                 {

                    if (gameButtons == 0) {
                        console.log(`button 1`);
                        drawTheGrid();
                    }
                     else if (gameButtons == 1) {
                        zap1_1_tile();
                    } 
                    else if (gameButtons == 2) {
                        destroyColumn(3);
                        drawTheGrid();
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
            x: position.x,
            y: position.y  // used to be zero, change back if it breaks things
        };
    }


    // resets the turn
    function resetTurn()
    {
        thisTurn.colorInPlay = -1; 
        thisTurn.clickedTileCol = -1;
        thisTurn.clickedTileRow = -1;
        thisTurn.colorInPlay = -1;
        thisTurn.foundMatchedTiles = false;
        thisTurn.foundanyNeighbor = false;    
        pasvFoundMatches = 0;     
    }



    // THE BIG TURN
    // 
    function PlayTileTurn(column,row){
        // determine clicked-on type
        console.log(`playing tile ${column},${row}`);  
        if (level.tiles[column][row].tileType == 1) // works
        {
            thisTurn.colorInPlay = level.tiles[column][row].tileColor
            checkNeighbors(column,row,false); // do passive check first
            if (thisTurn.markedNeighbors>0){
                console.log(`found matched tiles, erasing`);
                checkNeighbors(column,row,true); // active checking
                recursiveCheckNeighbors();  
                eraseMarkedPieces();  // only thing that erases tiles!
                fallDownPieces();  // not working   
            }
        }
        else
        {
            console.log('non-tile clicked(future expansion)');
        }
        drawTheGrid(); // refresh board
        resetTurn(); 
    }

    // now find neigboring tiles we haven't found yet
    // poison!
    function recursiveCheckNeighbors(){
        var recrFoundTiles = 0; // private counter 
        console.log(`recursive check neighbors`);
        for (let row = 0; row < TOTALROWS-1; row++) {            
            for (let column = 0; column < TOTALCOLUMNS-1; column++) {
                //console.log(`col: ${col} row: ${row}`);
                if (level.tiles[column][row].tileColor == thisTurn.colorInPlay && 
                    level.tiles[column][row].markedTile == true)
                    {     
                        checkNeighbors(column,row,true);
                    }
            }
        }     
        console.log(`recrfoundtiles: ${recrFoundTiles}`);

    }




    // checks if the tile has any neighbors
    // but doesn't set off the ball
    // deterines if it is a valid move
    // just 1-square NESW match
    function checkNeighbors(column,row,active){
        //console.log(`pasv: ${col},${row}   color/type seeking: ${tilecolors[level.tiles[col][row].tileColor]}`); 
        var foundAnyNeighbor = false;
        if (column==0) // left edge case
            {
                if (checkEastNeighbor(column,row,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }    
            }                    
        if (column>0 && column<TOTALCOLUMNS-1)
            {
            // check right                  
            if ( checkEastNeighbor(column,row,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                                  
            // check west
            if ( checkWestNeighbor(column,row,active))
                {
                    thisTurn.markedNeighbors+=1;
                    foundAnyNeighbor = true; 
                }                           
           }
        if  (column==TOTALCOLUMNS)  // right edge case(double check this)
        {
            if ( checkWestNeighbor(column,row,active))
            {
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true; 
            }         
        }

        
        // topmost, south match only
        if (row==0)
        {
            console.log(`topmost row`);
            if ( checkSouthNeighbor(column,row,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            
        }
        else if  (row>0 && row<TOTALROWS-1) // in between
        {       
            if ( checkSouthNeighbor(column,row,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }
            // check north
            if (checkNorthNeighbor(column,row,active))            
            {                   
                thisTurn.markedNeighbors+=1;
                foundAnyNeighbor = true;                   
            }

        }
        else if  (row==TOTALROWS) // bottom edge case
        {
            if (checkNorthNeighbor(column,row,active))            
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
            if (active) {level.tiles[column][row].markTile();} 
        }
        return foundAnyNeighbor; 
    }


    // check east neighbor
    // x- x value of tile
    // y - y value of tile
    // shouldmark(bool) - mark for deletion?
    function checkEastNeighbor(col,row,shouldMark){
        var foundAnyNeighbor = false;
        if (col+1 >= TOTALCOLUMNS) { console.warn(`columns exceeded! ${col+1}`)}
        if (level.tiles[col+1][row].tileColor == thisTurn.colorInPlay)
        {
            thisTurn.pasvFoundMatches+=1;
            foundAnyNeighbor = true; 
            if (shouldMark) { level.tiles[col+1][row].markTile(); }
        }  
        return foundAnyNeighbor; 
    }

    function checkWestNeighbor(col,row,shouldMark){
        var foundAnyNeighbor = false;
            //console.log(`(middle)west color: ${tilecolors[level.tiles[x-1][y].tileColor]}`);
            if ( level.tiles[col-1][row].tileColor == level.tiles[col][row].tileColor)
                {
                    thisTurn.pasvFoundMatches+=1;
                    foundAnyNeighbor = true; 
                    if (shouldMark) { level.tiles[col-1][row].markTile(); }
                }            
                return foundAnyNeighbor;                                            
        }
    

    function checkSouthNeighbor(col,row,shouldMark){
        var foundAnyNeighbor = false;
            if ( level.tiles[col][row+1].tileColor == thisTurn.colorInPlay)            
            {                               
                thisTurn.pasvFoundMatches+=1;
                foundAnyNeighbor = true;
                if (shouldMark) { level.tiles[col][row+1].markTile(); }   
            }
        return foundAnyNeighbor;             
    }

    // check upward    
    function checkNorthNeighbor(col,row,shouldMark){
        var foundAnyNeighbor = false;
            //console.log(`north color: ${tilecolors[level.tiles[x][y-1].tileColor]}`);
            if ( level.tiles[col][row-1].tileColor == thisTurn.colorInPlay)            
            {               
                thisTurn.pasvFoundMatches+=1;
                foundAnyNeighbor = true;
                if (shouldMark) { level.tiles[col][row-1].markTile(); }   
            }
            return foundAnyNeighbor; 
    }


    // DEBUG ONLY
    // zaps specific tile
    function zap1_1_tile(){
        console.log(`running debug function`);
        destroyColumn(1);
        eraseMarkedPieces(); 
        fallDownPieces(); 
        drawTheGrid();
    }
    






    // 2. erase the tiles
    // works 
    function eraseMarkedPieces(){
        console.log(`about to erase marked pieces.`);  
        for (let row = 0; row < TOTALROWS; row++) {
            for (let column = 0; column < TOTALCOLUMNS; column++) {
                if (level.tiles[column][row].markedTile == true)
                {           
                    level.tiles[column][row].eraseTile(); 
                }
            }
        }         
    }


   
    // down to up
    // needs rebuilding
    // go column by column individually
    // this.tileType = 0;
    // needs a rewrite
    function fallDownPieces()
    {
        console.log(`** falling down pieces **`);
        for  (let column=0; column<TOTALCOLUMNS; column++) {  // not geting here
                if (anyBlanksOnColumn(column)>0) 
                {
                    fallVerticalGrabLoop(column);
                    destroyColumn(column);
                }
        }
        console.debug(`fall pieces done`);
    }


    // works
    function anyBlanksOnColumn(col){
        var foundBlanks = 0; 
        for (var thisRow = 0; thisRow<TOTALROWS-1; thisRow++){
                if (level.tiles[col][thisRow].tileType ==0 )
                {                    
                    foundBlanks+=1;
                }
        }        
        return foundBlanks;
    }

    // can use for redraw
    // 
    function destroyColumn(column){
        console.log(`destroying column ${column}`);
        for (var thisRow = 0; thisRow<TOTALROWS; thisRow++){
            level.tiles[column][thisRow].tileType = 0;
            drawTile(column,thisRow);
        }
        //redrawColumn(column);
    }

    function redrawColumn(column){
        console.log(`redrawing column ${column}`);
        for (var thisRow = 0; thisRow<TOTALROWS-1; thisRow++){
            drawTile(column,thisRow);  
        }    
    }

    // a totally new function
    // will need top fill
    // just re-do the stack
    function fallVerticalGrabLoop(currentColumn)
    {
        var nonBlankTiles = [];
        for (let myRow = TOTALROWS-1; myRow > -1; myRow--) {
                    var thisTile = level.tiles[currentColumn][myRow]; // target tile
                    if ( thisTile.tileType  != 0 ) // look for non blanks
                    {       
                       nonBlankTiles.push(thisTile);
                    }
        }
        console.log(`total nonblanktiles for col ${currentColumn} reconstruct tile length::${nonBlankTiles.length}`);  // works
        return nonBlankTiles; 
    }   


    // filters out a column of empty tiles
    // puts the empties to the top.
    // top to down(experimental)
    // use this
    function tilesOnlyFilteredColumn(thisColumn){
        var filteredList = [];
        for (let thisRow=0; thisRow<TOTALROWS;thisRow++) {      
            //console.log(` (filter) current row: ${row}`);
            if (level.tiles[thisColumn][thisRow].tileType !=0) // anything not blank
            {
                console.log(`re-building column ${thisColumn}. row${thisRow}`); // good
                var movedTile = level.tiles[thisColumn][thisRow]; // grab tile
                filteredList.push(movedTile);
            }    
        }        
        console.log(`filtered list length  ${filteredList.length}`);  // now we have copy
        var rowup = TOTALROWS-1;
        for (var newUpTile in filteredList){
            console.log(`rowup ${rowup}`);
            level.tiles[thisColumn][rowup].tileType = newUpTile.tileType;
            level.tiles[thisColumn][rowup].tilecolor = newUpTile.tilecolor;
            rowup-=1;
        }
        return filteredList; // not working, do the work here
    }
    



    // primary entry point
    init();
}    