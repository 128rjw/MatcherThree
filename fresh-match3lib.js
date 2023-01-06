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
    var old_tilecolors = [[255, 0, 0],
                      [0, 255, 0],
                      [0, 0, 255],
                      [128, 0, 0],
                      [0, 128, 125]];    


    var tilecolors = ["Blue",
                        "Crimson",
                        "DarkGreen",
                        "DarkOrange",
                        "Sienna"];


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
        //console.log('drawing grid frame');

        // Draw header block
        context.fillStyle = "green";
        context.fillRect(0, 0, canvas.width, 65);

        context.fillStyle = "darkgreen";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = BACKGROUNDCOLOR; 
        context.fillRect(1, 1, canvas.width-2, canvas.height-2); // the actual canvas



        // Draw title
        context.fillStyle = "red";
        context.font = "24px Verdana";
        context.fillText("Match 3 Game", 10, 30);
        //console.log('drawing grid frame FINISHED');
    }


    // mainly debug info
    // but can be used for debug stats
    function updateStats()
    {
        context.fillStyle = "Purple";
        context.font = "24px Verdana";
        context.fillText("Total Moves: "+ level.totalTurns.toString(), 10, 50);
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

        updateStats();
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
            context.fillStyle = tilecolors[level.tiles[x][y].tileColor]; 
            context.fillRect(myCoordinates.tilex + 2, myCoordinates.tiley + 2, TILEWIDTH - 4, TILEHEIGHT - 4); 
        }
        else if (level.tiles[x][y].tileType == myTileTypes.empty){
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
        if (mt.validTileClick) {
            //console.log(`valid tile click detected: ${mt.x}  ${mt.y} `); // WORKS
            // check neighbors of tile(valid move)
            if (passiveCheckNeighbors(mt.x,mt.y) == true)
            {
                // tile in play, let's do this
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
                        drawTheGrid();
                    } 
            }
        }

        // TODO:
        // you can refresh things here, refreshes each click


    }
    

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

    // the game turn
    // TODO: do this over. 
    function PlayTileTurn(x, y){
        console.log(`${x},${y}  -- color in play: ${tilecolors[level.tiles[x][y].tileColor]}`); // so far so good
        if (passiveCheckNeighbors(x,y)==true)
            {
        level.foundMatchedTiles = 0; //reset
        if (level.tiles[x][y].tileType == myTileTypes.plainTile) // switch for bomb, etc
        {
            //checkNeighbors(x,y); // check neighbors
            if (level.foundMatchedTiles>0){
                eraseMarkedPieces();
                fallDownPieces(); // gravity                        
                drawTheGrid(); // refresh screen
            }
        }
        else
        {
            console.log('non-tile clicked(future expansion)');
        }
        // update score
        //document.title = `moves:${level.totalTurns} score:${level.score}`;
        updateStats(); // use this instead
        }
    }

    



    // some debugging functions


    // returns # of tiles for selected color
    // on board. 
    function totalTilesOnBoardForColor(thisColor){
        foundTiles = 0; 
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].tileColor == thisColor)
                {           
                    foundTiles++;
                }
            }
        }         
        return foundTiles; 
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
        if (x==0) // left edge case
            {
                console.log(`(left edge case)east color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);                
                if (level.tiles[x][1].tileColor == level.colorInPlay)
                {
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }    
            }                    
        if (x>0 && x<TOTALCOLUMNS-1)
            {
            // check right      
            console.log(`(rightmost) raw x value: ${x}`);
            console.log(`(middle)east color: ${tilecolors[level.tiles[x+1][y].tileColor]}`);  // crashing
            if ( level.tiles[x+1][y].tileColor == level.colorInPlay)
                {
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }                                   
            // check west
            console.log(`west color: ${tilecolors[level.tiles[x-1][y].tileColor]}`);
            if ( level.tiles[x-1][y].tileColor == level.tiles[x][y].tileColor)
                {
                    pasvFoundMatches++;
                    foundAnyNeighbor = true; 
                }                           
           }
        if  (x==TOTALCOLUMNS)  // right edge case(double check this)
        {
            console.log(`right edge case!`);
            console.log(`(right edge case)west color: ${tilecolors[level.tiles[TOTALCOLUMNS][y-1].tileColor]}`);
            if ( level.tiles[TOTALCOLUMNS][y-1].tileColor == level.colorInPlay)
            {
                pasvFoundMatches++;
                foundAnyNeighbor = true; 
            }         
        }

        
        // topmost, south match
        if (y==0)
        {
            console.log(`south color: ${tilecolors[level.tiles[x][y+1].tileColor]}`);
            if ( level.tiles[x][y+1].tileColor == level.colorInPlay)            
            {                   
                pasvFoundMatches++;
                foundAnyNeighbor = true;                   
            }
        }
        else if  (y>0 && y<TOTALROWS-1)
        {       
            console.log(`south color: ${tilecolors[level.tiles[x][y+1].tileColor]}`);
            if ( level.tiles[x][y+1].tileColor == level.colorInPlay)            
            {               
                pasvFoundMatches++;
                foundAnyNeighbor = true;   
            }

            // check north
            console.log(`north color: ${tilecolors[level.tiles[x][y-1].tileColor]}`);
            if ( level.tiles[x][y-1].tileColor == level.colorInPlay)            
            {               
                pasvFoundMatches++;
                foundAnyNeighbor = true;   
            }            

        }
        else if  (y==TOTALROWS) // bottom edge case
        {
            console.log(`north color: ${tilecolors[level.tiles[x][y-1].tileColor]}`);
            if ( level.tiles[x][y-1].tileColor == level.colorInPlay)            
            {               
                pasvFoundMatches++;
                foundAnyNeighbor = true;   
            }
        }

        console.log(`matching neighbors Total ${pasvFoundMatches}`);

        if (foundAnyNeighbor==false)
        {
            level.colorInPlay = -1; // -1 is no matches
        }

        // just return it back(true)
        return foundAnyNeighbor; 
    }
    
    // check the whole board for matching neighbors
    // filter by color
    // filter by marked(needs tweaking beforehand)
    // TODO: not row-col check, but all colors check
    
    function recursiveCheckNeighbors(x,y){
        for (let row = 0; row < TOTALROWS-1; row++) {
            for (let col = 0; col < TOTALCOLUMNS-1; col++) {
                if (level.tiles[row][col].markedTile == true)
                {           
                    console.log(`found marked tile...${row}${col} `);
                    markCheckNeighbors(row,col); 
                }
            }
        }   
    }

    // part of the recursive function
    // marks matching nearby tiles.
    // potential for infinite loop. 
    function markCheckNeighbors(row,col){

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



    // primary entry point
    init();
}    