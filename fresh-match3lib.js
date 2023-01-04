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
        colorInPlay: -1,
        clickedTileX: -1,
        clickedTileY: -1,
        foundMatchedTiles: 0,
        totalErasedTiles: 0
    }


    // constants
    var BACKGROUNDCOLOR = "#d0d0d0";
    var XCANVASOFFSET=  250         // X position of canvas?(for coords 0,0)
    var YCANVASOFFSET=  113         // Y position
    var TOTALCOLUMNS=  8     // Number of tile columns
    var TOTALROWS=  8        // Number of tile rows
    var TILEWIDTH=  40  // Visual width of a tile
    var TILEHEIGHT=  40 // Visual height of a tile    

    var Buttons = [ { x: 30, y: 270, width: 150, height: 50, text: "New Game"},
                    { x: 30, y: 330, width: 150, height: 50, text: "Refresh tiles"}];    


    // Game states
    var gameStates = { init: 0, ready: 1, resolve: 2, inprogress: 3 };
    var animationState = {};
    var gameState = gameStates.init;       

    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        horizRocket: Symbol("horizRocket"),
        vertRocket: Symbol("vertRocket")
    }

    // TODO: can toggle diversity level
    // with wrapper function
    var tilecolors = [[255, 0, 0],
                      [0, 255, 0],
                      [0, 0, 255],
                      [128, 0, 0],
                      [0, 128, 125]];    




    // trying to incorporate
    class gameTile
     {
        constructor(xcor,ycor){
            this.xcor = xcor;  // fraw ints(0,1,2,3)
            this.ycor = ycor;            
            this.markedTile = false; // mark when it will be eliminated
            this.tileType = myTileTypes.plainTile;
            this.tileColor  = returnRandomTileColor(); 
        }

        // in play!
        markTile()
        {
            console.log(`>>tile ${this.xcor},${this.ycor} marked`);
            level.foundMatchedTiles+=1;
            this.markedTile = true;
        }

        setasPlaytile()
        {
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
        }


    }

    function startNewGame(){
        console.log('starting new game');
        level.totalTurns = 0; 
        regenerateTiles(); 
        level.targetColor = -1;        
        drawTheGrid(); 
        gameState = gameStates.inprogress;
    }


    //outer function
    function drawGUI(){
        console.log("drawing whole GUI");        
        drawGridFrame();
        drawButtons();  
        drawTheGrid(); // draw tile grid(done repeatedly)
    }



    // Draw a frame with a border
    // blanks it all out
    // fun first?
    function drawGridFrame() {
        console.log('drawing grid frame');
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = BACKGROUNDCOLOR; //  "#08eaec";  // background - anything you want
        context.fillRect(1, 1, canvas.width-2, canvas.height-2);

        // Draw header block
        context.fillStyle = "#603030";
        context.fillRect(0, 0, canvas.width, 65);

        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Match 3 Game", 10, 30);
        console.log('drawing grid frame FINISHED');
    }

    // Draw buttons
    // runs quite often
    function drawButtons() {
        for (var thisButton=0; thisButton<Buttons.length; thisButton++) {
            context.fillStyle = "#000000";
            context.fillRect(Buttons[thisButton].x, Buttons[thisButton].y, Buttons[thisButton].width, Buttons[thisButton].height);

            context.fillStyle = "#ffffff";
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


    // get exact function coordinates
    // NOW WORKS
    // old code:
    function getTileCoordinate(column, row, columnOffset, rowOffset) {
        var thisTile = level.tiles[column][row];   
        var translatedTileX =  thisTile.xcor + (column + columnOffset) * TILEWIDTH;
        var translatedTileY = thisTile.ycor + (row + rowOffset) * TILEHEIGHT;  
        return { tilex: translatedTileX, tiley: translatedTileY};
    }


    // draw grid tiles
    // the outer loop
    function drawTheGrid(){
        //console.log('drawing the grid of tiles');        
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row<TOTALROWS; row++) {
                        drawTile(row,column);                    
                }
            }
    }

    // for new games
    function regenerateTiles(){
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row<TOTALROWS; row++) {
                        level.tiles[column][row].Regenerate();
                }
            } 
    }


    function drawTile(x,y){
        //console.log(`drawing tile x:${x} y:${y}`);
        var myCoordinates = getTileCoordinate(x, y, 6, 3);     
        if (level.tiles[x][y].tileType  == myTileTypes.plainTile)
        {
            var thisTile = level.tiles[x][y];            
            var redValue = tilecolors[thisTile.tileColor][0];
            var blueValue = tilecolors[thisTile.tileColor][1];
            var greenValue = tilecolors[thisTile.tileColor][2];
            
            context.fillStyle = "rgb(" +  redValue  + "," + blueValue + "," + greenValue + ")"; 
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }
        else if (level.tiles[x][y].tileType == myTileTypes.empty){
            //console.log(`empty `);
            context.fillStyle = BACKGROUNDCOLOR; //  "#d0d0d0"; // change to constant
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
            level.tiles[thisColumn] = []; // fresh row init(mandatory)
            for (var thisRow=0; thisRow<TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] =  new gameTile(thisColumn,thisRow); 
                //level.tiles[thisColumn][thisRow].tileColor = returnRandomTileColor();
            }
        }        

        //regenerateTiles(); // fresh board
        drawGUI(); // works
        gameState = gameStates.ready;
    }




    // CLICK FUNCTION EVENT
    // branches between button clicks or tile clicks, or nothing
    function onMouseDown(event){
        var mousePos = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePos);

        // TILE CLICK
        if (mt.valid) {
            console.log(`valid tile click detected: ${mt.x}  ${mt.y} `); // WORKS
            // check neighbors of tile
            checkNeighbors(mt.x,mt.y);
        }

        // BUTTON CLICK
        for (var aGameButton=0; aGameButton<Buttons.length; aGameButton++) {
            if (mousePos.x >= Buttons[aGameButton].x && mousePos.x < Buttons[aGameButton].x+Buttons[aGameButton].width &&
                mousePos.y >= Buttons[aGameButton].y && mousePos.y < Buttons[aGameButton].y+Buttons[aGameButton].height)
                 {
                    if (aGameButton == 0) {
                        startNewGame();
                    } else if (aGameButton == 1) {
                        drawTheGrid();
                    } 
            }
        }

        // TODO:
        // you can refresh things here, refreshes each click


    }
    

    // Get the tile under the mouse
    // keep this one
    function getMouseTile(position) {
        var mouseX = Math.floor((position.x - level.x) / TILEWIDTH);
        var mouseY = Math.floor((position.y - level.y) / TILEHEIGHT);
        // Check if the tile is valid
        if (mouseX >= 0 && mouseX < TOTALCOLUMNS && mouseY >= 0 && mouseY < TOTALROWS) {
            // Tile is valid
            playTile(mouseX,mouseY); // might move elsewhere
            return {
                validTileClick: true,
                x: mouseX,
                y: mouseY
            };
        }
        return {            
            valid: false,
            x: 0,
            y: 0
        };
    }

    // actually do something
    function playTile(x, y){
        level.foundMatchedTiles = 0; //reset
        if (level.tiles[x][y].tileType == myTileTypes.plainTile)
        {
            //checkNeighbors(x,y); // check neighbors
            if (level.foundMatchedTiles>0){
                eraseMarkedPieces();
                fallDownPieces(); // gravity        
                // refresh screen
                drawTheGrid();                 
            }
        }
        else
        {
            console.log('non-tile clicked');
        }
        // update score
        document.title = `moves:${level.totalTurns} score:${level.score}`;
    }

    // the big function
    //
    function checkNeighbors_old(x,y){
        level.foundMatchedTiles = 0; 
        level.colorInPlay = level.tiles[x][y].tileColor;
        console.log(`${x},${y}   color in play: ${level.colorInPlay}`); // so far so good

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


    function initGameplayClick(x,y){
        level.foundMatchedTiles = 0;  // reset
        level.colorInPlay = level.tiles[x][y].tileColor;
        console.log(`${x},${y}   color in play: ${level.colorInPlay}`); // so far so good        
        var selfMatchedTiles = 0; 
                
    }


    // checks if the tile has any neighbors
    // but doesn't set off the ball
    // deterines if it is a valid move
    // just 1-square NESW match
    function passiveCheckNeighbors(x,y){
        level.colorInPlay = level.tiles[x][y].tileColor;
        console.log(`${x},${y}  passive check neighbors /n color in play: ${level.colorInPlay}`); // so far so good        
        var selfMatchedTiles = 0; 
        var foundAnyNeighbor = false;
        //east
        // left edge case
        if (x==0)
            {
                if (level.tiles[1][y].tileColor == level.colorInPlay)
                {
                    foundAnyNeighbor = true; 
                }    
            }                    
        else if (x>0 && x<TOTALCOLUMNS)
            {
            console.log(`got color back: ${level.tiles[x+1][y].tileColor}`);
            if ( level.tiles[x+1][y].tileColor == level.colorInPlay)
                {
                    foundAnyNeighbor = true; 
                }                           
            }
        else if (x==TOTALCOLUMNS)  // right edge case
        {
            // check west only
            if ( level.tiles[x-1][y].tileColor == level.colorInPlay)
            {
                foundAnyNeighbor = true; 
            } 
        }

        // topmost, south match
        if (y==0)
        {
            if ( level.tiles[x][1].tileColor == level.colorInPlay)            
            {   
                foundAnyNeighbor = true;   
            }
        }
        else if (y>0 && y<TOTALROWS)
        {       
            if ( level.tiles[x][y+1].tileColor == level.colorInPlay)            
            {   
                foundAnyNeighbor = true;   
            }
        }

        if (foundAnyNeighbor==false)
        {
            level.colorInPlay = -1; // -1 is no matches
        }

        // just return it back
        return foundAnyNeighbor; 
    }

    // need to recursively run this function
    // on all the marked tiles
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


    function checkExtraNeighbors(x,y)
    {
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {

            }
        }     
    }


    // 2. erase the tiles(same as 1?)
    // works so far
    // pre-drop
    function eraseMarkedPieces(){
        console.log('about to erase marked pieces');
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

   
   
    // super buggy
    function fallDownPieces()
    {
        console.log(`about to fall down pieces`);
        var safety=TOTALROWS; // recursive function
        do {

            for (let col = 0; col < TOTALCOLUMNS-1; col++) {

            // if we have any missing the top row, go ahead and set a fresh tile
            // will need to elaborate this
            if (level.tiles[0][col].tileType == myTileTypes.empty)
            {
                console.log(`regenerating top row empty, col ${col}`);
                level.tiles[0][col].Regenerate(); 
            }

            if (countEmptiesPerColumn(col)>0) {
                for (let row = 1; row > TOTALROWS-1; row++) {
                    if (level.tiles[row][col].tileType != myTileTypes.empty && 
                        level.tiles[row+1][col].tileType == myTileTypes.empty)
                        {
                            console.log(`swap-falling tile ${row} ${col}`);                            
                            var fallingTile = level.tiles[row][col];  // grab original tile
                            level.tiles[row][col].eraseTile(); // do last
                            fallingTile = level.tiles[row+1][col];
                        }

                             
                    }

                }
            }
      safety--;
    } 
    while(safety>0 || countMarkedTiles()==0); // TODO: do better
    console.debug(`fall pieces done`);
}


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

    function swapTwoTiles(alphaX,alphaY,betaX,betaY){
        var firstTile = level.tiles[alphaX][alphaY];
        var secondTile = level.tiles[betaX][betaY];
        level.tiles[betaX][betaY] = firstTile;
        level.tiles[alphaX][alphaY] = secondTile; 
    }

    // primary entry point
    init();
}    