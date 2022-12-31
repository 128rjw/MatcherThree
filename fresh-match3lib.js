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

    // are we using this?
    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        Unknown: Symbol("unknown")
    }

    var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [255, 255, 255]];    




    // trying to incorporate
    class gameTile
     {
        constructor(xcor,ycor){
            this.xcor = xcor;  // fraw ints(0,1,2,3)
            this.ycor = ycor;            
            var wilbeDeleted = false; // mark when it will be eliminated
            var tileType = myTileTypes.plainTile;
            this.tileColor  = returnRandomTileColor(); 
            //console.log(`fresh tile color ${this.tileColor}`);
        }

        markTileToDelete()
        {
            wilbeDeleted = true;
        }


    }

    function startNewGame(){
        console.log('starting new game');
        drawTheGrid(); 
        gamestate = gamestates.inprogress;
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
        console.log('drawing grid frame');
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


    // get exact function coordinates
    // NOW WORKS
    // old code:
    //  var tilex = level.x + (column + columnoffset) * level.tilewidth;
    // var tiley = level.y + (row + rowoffset) * level.tileheight;
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
                        var thisColor = level.tiles[row][column].tileColor;
                        //console.log(`Color I will be drawing: ${thisColor}`); // works                        
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, thisColor);                    
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
    function drawTile(x, y, tileColor) {
        //console.log(`incoming tile color value: ${tileColor} output: ${tilecolors[tileColor]}`);
        var snapColor = tilecolors[tileColor];
        var Reddie = snapColor[0];
        var bluie = snapColor[1];
        var greenie  = snapColor[2];
        //console.log(`>>drawing tile ${x} ${y} red:${Reddie} green:${greenie} blue:${bluie}`);
        context.fillStyle = "rgb(" + Reddie + "," + greenie + "," + bluie + ")";
        context.fillRect(x + 2, y + 2, TILEWIDTH - 4, TILEHEIGHT - 4);
    }


    // graphics library
    
    function returnRandomTileColor() {
        var myValue = Math.floor(Math.random() * tilecolors.length); 
        //console.log(`returnrandomtilecolor: myvalue: ${myValue}`);
        return myValue;
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
    function playTile(xVal, yVal){
        // check neighbors
                


    }

    function checkNeighbors(xval,yVal){
        var foundMatches = 0; // if >0, we got neighbors
        var playTile = level.tiles[xval][yVal];
        var playTileColor = level.tiles[xval][yVal].tileColor // TODO; tile TYPE!!
        // check horizontally
        
        // leftmost tile(check 1 right)


        // rightmost tile(check one left)
        

    }
    
    // primary entry point
    init();
}    