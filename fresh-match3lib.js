// fresh match 3 lib

// The function gets called when the window is fully loaded
window.onload = function() {
    // Get the canvas and context
    console.log('window onload loaded');
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");


    var gameRound = {
        totalMoves: 0,
        totalMatchesFound: 0,
        zorp: 0
    }

    // Level object
    var level = {
        x: 250,         // X position of canvas?
        y: 113,         // Y position
        tiles: [],      // The two-dimensional tile array
        selectedtile: { selected: false, column: 0, row: 0 }  // change this a bit, for selected click tile?
    };

    // constants
    var XCANVASOFFSET=  250         // X position of canvas?(for coords 0,0)
    var YCANVASOFFSET=  113         // Y position
    var TOTALCOLUMNS=  8     // Number of tile columns
    var TOTALROWS=  8        // Number of tile rows
    var TILEWIDTH=  40  // Visual width of a tile
    var TILEHEIGHT=  40 // Visual height of a tile    

    var Buttons = [ { x: 30, y: 270, width: 150, height: 50, text: "New Game"},
                    { x: 30, y: 330, width: 150, height: 50, text: "Show Moves"}];    


    // Game states
    var gamestates = { init: 0, ready: 1, resolve: 2, inprogress: 3 };
    var gamestate = gamestates.init;       

    
    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        Unknown: Symbol("unknown")
    }

    var tilecolors = [[255, 255, 255],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [0, 0, 0]];    




    // any tile on the grid
    class gameTile
     {
        constructor(initalXCor,initialYCor){
            this.xcor = initalXCor;  // raw ints(0,1,2,3)
            this.ycor = initialYCor;            
            this.wilbeDeleted = false; // mark when it will be eliminated
            this.tileType = myTileTypes.plainTile;
            this.tileColor  = returnRandomTileColor(); 
            console.log(`*** tile constructor initted  ${this.tileType.toString()}    ****`);
        }
    }

    function startNewGame(){
        console.log('starting new game');
        drawTheGrid(); 
        gamestate = gamestates.inprogress;        
        gameRound.totalMatchesFound = 0; 
        gameRound.totalMoves = 0; 
    }


    //outer function
    function drawGUI(){
        console.log("drawing GUI(whole thing)");        
        drawGridFrame();
        drawButtons();  // works   
        drawTheGrid(); // draw tiles
    }



    // Draw a frame with a border
    // blanks it all out
    // fun first?
    function drawGridFrame() {
        console.log('drawing grid frame');
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
        context.fillText("Match 3 Game", 10, 30);
        console.log('drawing grid frame done');
    }

    // Draw buttons
    // runs quite often
    function drawButtons() {
        console.log("drawing buttons");
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


    // get exact  coordinates
    function getTileCoordinate(column, row, columnOffset, rowOffset) {
        var thisTile = level.tiles[column][row];   
        //console.log(` (getTileColor) x: ${thisTile.xcor} y:${thisTile.ycor}`);
        var translatedTileX =  thisTile.xcor + (column + columnOffset) * TILEWIDTH;
        var translatedTileY = thisTile.ycor + (row + rowOffset) * TILEHEIGHT;  // new
        //console.log(` (getTileColor2) x: ${translatedTileX} y:${translatedTileY}`);
        return { tilex: translatedTileX, tiley: translatedTileY};
    }


    // draw grid tiles
    function drawTheGrid(){
        console.log('drawing the grid of tiles');        
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row<TOTALROWS; row++) {
                        var myCoordinates = getTileCoordinate(column, row, 6, 3);     
                        var Zobject = level.tiles[row][column];
                        console.log(`Color I will be drawing: ${Zobject.tileType.toString()}`); // works                         
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, Zobject);                    
                }
            }
    }

    // Draw a tile with a color
    function drawTile_old(x, y, redValue, greenValue, blueValue) {
        //console.log(`>>drawing tile ${x} ${y} red:${redValue} green:${greenValue} blue:${blueValue}`);
        context.fillStyle = "rgb(" + redValue + "," + greenValue + "," + blueValue + ")";
        context.fillRect(x + 2, y + 2, TILEWIDTH - 4, TILEHEIGHT - 4);
    }

    // Draw a tile with a color
    // don't forget the gamegrid    
    function drawTile(x, y, tileObject) {
        var Reddie = 0;
        var bluie = 0;
        var greenie = 0;
        console.log(`draw tile type: ${tileObject.tileType.toString()}`); // UNDEFINED!?!?
        if (tileObject.tileType == myTileTypes.plainTile )
        {
            var tileob = tilecolors[tileObject.tileColor];
            console.log(`drawing plain tile: ${tileob.tileColor}`);            
            Reddie = tileob[0];
            bluie = tileob[1];
            greenie  = tileob[2];
        }
        else if (tileObject.tileType == myTileTypes.empty)
        {
            console.log(`drawing empty`);
            Reddie = 0; 
            bluie = 0;
            greenie = 0;
        }
        else
        {
            console.log(` UNKNOWN TILE TYPE ${tileObject.tileType} `);
        }
        console.log(`>>drawing tile ${x} ${y} red:${Reddie} green:${greenie} blue:${bluie} type:${tileObject.tileType.toString()}`); // borked anyway
        context.fillStyle = "rgb(" + Reddie + "," + greenie + "," + bluie + ")";
        context.fillRect(x + 2, y + 2, TILEWIDTH - 4, TILEHEIGHT - 4);
    }


    // graphics library
    
    function returnRandomTileColor() {
        var myValue = Math.floor(Math.random() * tilecolors.length-1); 
        //console.log(`returnrandomtilecolor: myvalue: ${myValue}`);
        return myValue+1;
    }    


    // ENTRY POINT
    function init()
    {   
        console.clear(); 
        console.log("MAIN INIT");
        console.log("*** initting events ***");
        canvas.addEventListener("mousedown", onMouseDown);  // keep
        // mandatory
        for (var thisColumn=0; thisColumn<TOTALCOLUMNS; thisColumn++) {
            level.tiles[thisColumn] = [];
            for (var thisRow=0; thisRow<TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] =  new gameTile(thisColumn,thisRow);
                //console.log(`setting TILE ${thisColumn}  ${thisRow}`);
                //var  x = level.tiles[thisColumn][thisRow];
                level.tiles[thisColumn][thisRow].tileColor = returnRandomTileColor();
            }
        }        
        console.log('init FINISHED');
        drawGUI(); // works
        gamestate = gamestates.ready;
        //drawGridFrame();
        // draw gme board
    }




    // CLICK FUNCTION EVENT
    function onMouseDown(event){
        //console.log('onmousedown set');
        var mousePos = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePos);
        // GAME BUTTON CLICK(META)
        for (var aGameButton=0; aGameButton<Buttons.length; aGameButton++) {
            if (mousePos.x >= Buttons[aGameButton].x && mousePos.x < Buttons[aGameButton].x+Buttons[aGameButton].width &&
                mousePos.y >= Buttons[aGameButton].y && mousePos.y < Buttons[aGameButton].y+Buttons[aGameButton].height)
                 {
                    // play the tile
                        console.log(`TILE CLICKED`);

                        // Button i was clicked
                    if (aGameButton == 0) {
                        startNewGame();
                    } else if (aGameButton == 1) {
                        // presently not used
                        console.log('show moves button clicked');
                    } 
            }
        }


    }
    

    // Get the tile under the mouse
    // keep this one
    function getMouseTile(position) {
        var mouseX = Math.floor((position.x - level.x) / TILEWIDTH);
        var mouseY = Math.floor((position.y - level.y) / TILEHEIGHT);
        // Check if the tile is valid
        if (mouseX >= 0 && mouseX < TOTALCOLUMNS && mouseY >= 0 && mouseY < TOTALROWS) {
            // Tile is valid
            console.log(`(getmousetile) tile is clicked  x:${mouseX}  ${mouseY}`);
            playTile(mouseX,mouseY); // might move elsewhere
            return {
                validTileClick: true,
                x: mouseX,
                y: mouseY
            };
        }

        console.log("(getmousetile) no  valid tiles(clicked outside)");
        return {            
            valid: false,
            x: 0,
            y: 0
        };
    }

    // actually do something
    // this constitutes a whole move
    function playTile(xVal, yVal){        
        // check neighbors
        checkNeighbors(xVal,yVal);                                            
        document.title = "total moves " + gameRound.totalMoves.toString(); // only add moves when successful move
        if (countTobeDeletedPieces>0)
            { 
                eraseMarkedTiles();
            }
        gameRound.totalMoves+=1; // rough implementation


    }

    function eraseMarkedTiles(){
        console.log('erasing marked tiles');
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row<TOTALROWS; row++) {
                        level.tiles[row][column].tileType = myTileTypes.empty;
                        console.log(`Color I will be drawing: ${level.tiles[row][column].tileType}`); 
                        drawTile(row, column, level.tiles[row][column]);
                }
            }         
    }


    // do we even need to FallPiecesDown()?
    function countTobeDeletedPieces(){
        var totalFound =0;
        for (var column=0; column<TOTALCOLUMNS; column++) {
            for (var row=0; row>TOTALROWS; row++) {
                        if (level.tiles[row][column].wilbeDeleted == true)
                            {
                                totalFound+=1;
                            }        
                }
        }
        return totalFound;         
    }


    // go column by column 
    function fallPiecesDown(){
        for (var column=0; column<TOTALCOLUMNS; column++) {
            console.log(`falling pieces for column ${column}`);

            // scan UP to DOWN                        
            for (var row=0; row>TOTALROWS; row++) {
                        if (level.tiles[row+1][column].type = tileType.empty)
                        level.tiles[row][column].  type = empty;
                        var thisColor = level.tiles[row][column].tileColor;
                        //console.log(`Color I will be drawing: ${thisColor}`); // works                        
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, thisColor);                    
                }
            }         
    }



    function checkNeighbors(xval,yVal){
        var foundMatches = 0; // if >0, we got neighbors
        var playTile = level.tiles[xval][yVal]; // original clicker
        console.log(`play tile's tile color: ${playTile.tileColor}`);
        var playTileColor = level.tiles[xval][yVal].tileColor // TODO; tile TYPE!!
        // check horizontally    
        if (xval<TOTALCOLUMNS){  // leftmost
            // EAST MATCH
            if (level.tiles[xval+1][yVal].tileColor == playTile.tileColor)
                {
                    console.log(`east match found ${xval} ${yVal}`);
                    foundMatches+=1;  // mark trip up
                    // mark neighbor tile for deletion
                    level.tiles[xval+1][yVal].markTileToDelete = true; 
                }
        }

        // check west(if rightmost)
        // wow this is bad
        if (xval<=(TOTALCOLUMNS))
        {
            // WEST MATCH
            if (level.tiles[xval-1][yVal].tileColor == playTile.tileColor)
                {
                    console.log(`east match found ${xval} ${yVal}`);
                    foundMatches+=1;  // mark trip up
                    level.tiles[xval-1][yVal].markTileToDelete = true; 
                }            
        }

        // if any match was found, mark ITSELF to be deleted
        if (foundMatches>0){
            console.log(`\tself marking for del ${foundMatches}`);
            level.tiles[xval][yVal].markTileToDelete = true; 
        }
        
        // rightmost tile(check one left)
        

    }
    
    // primary entry point
    init();
}    