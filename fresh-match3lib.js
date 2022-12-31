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
    var x=  250         // X position of canvas?(for coords 0,0)
    var y=  113         // Y position
    var TOTALCOLUMNS=  8     // Number of tile columns
    var TOTALROWS=  8        // Number of tile rows
    var TILEWIDTH=  40  // Visual width of a tile
    var TILEHEIGHT=  40 // Visual height of a tile    
 


    // Game states
    var gamestates = { init: 0, ready: 1, resolve: 2 };
    var gamestate = gamestates.init;       

    // are we using this?
    const myTileTypes = {
        plainTile: Symbol("plainTile"),
        empty: Symbol("empty"),
        Bomb: Symbol("bomb"),
        Unknown: Symbol("unknown")
    }


    // const tileTypes = {
    //     RegularTile: "tile",
    //     DiscardTile: "discardTile",
    //     Empty: "empty",  // discarded tile hole
    //     Bomb: "bomb",
    //     HorizRocket: "horizRocket",
    //     VerticalRocket: "verticalRocket"
    // }

    var tilecolors = [[255, 128, 128],
                      [128, 255, 128],
                      [128, 128, 255],
                      [255, 255, 128],
                      [255, 128, 255],
                      [128, 255, 255],
                      [255, 255, 255]];    


    // graphics library
    
    function returnRandomTileColor() {
        var myValue = Math.floor(Math.random() * tilecolors.length); 
        return myValue;
    }    

    // trying to incorporate
    class gameTile
     {
        constructor(xcor,ycor){
            console.log("initting game tile");
            this.xcor = xcor;
            this.ycor = ycor;            
            var wilbeDeleted = false; // mark when it will be eliminated
            var tileType = myTileTypes.plainTile;
            var tileColor = returnRandomTileColor(); 
        }

        markTileToDelete()
        {
            wilbeDeleted = true;
        }


    }



    //outer function
    function drawGUI(){
        console.log("drawing GUI");        
        drawButtons();
        drawGridFrame();
        drawTheGrid(); // draw tiles
    }



    // Draw a frame with a border
    function drawGridFrame() {
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
    }

    // Draw buttons
    // runs quite often
    function drawButtons() {
        for (var i=0; i<gameButtons.length; i++) {
            // Draw button shape
            context.fillStyle = "#000000";
            context.fillRect(gameButtons[i].x, gameButtons[i].y, gameButtons[i].width, gameButtons[i].height);

            // Draw button text
            context.fillStyle = "#ffffff";
            context.font = "18px Verdana";
            var textdim = context.measureText(gameButtons[i].text);
            context.fillText(gameButtons[i].text, gameButtons[i].x + (gameButtons[i].width-textdim.width)/2, gameButtons[i].y+30);
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



    // just draw grid tiles
    function drawTheGrid(){
        for (var column=0; column<level.TOTALCOLUMNS; column++) {
            for (var row=0; row<level.TOTALROWS; row++) {
                        drawTile(myCoordinates.tilex, myCoordinates.tiley, 255, 0, 0);                    
                }
            }
    }

    // Draw a tile with a color
    // don't forget the gamegrid
    function drawTile(x, y, r, g, b) {
        context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        context.fillRect(x + 2, y + 2, level.TILEWIDTH - 4, level.TILEHEIGHT - 4);
    }




    // ENTRY POINT
    function init()
    {   
        console.log("MAIN INIT");
        console.log("*** initting events ***");
        canvas.addEventListener("mousedown", onMouseDown);  // keep
        //canvas.addEventListener("mouseout", onMouseOut); // not really needed
        level = [];

        // mandatory
        for (var thisColumn=0; thisColumn<TOTALCOLUMNS; thisColumn++) {
            level.tiles[thisColumn] = [];
            for (var thisRow=0; thisRow<TOTALROWS; thisRow++) {
                level.tiles[thisColumn][thisRow] =  new gameTile(column,row);
                console.log(`setting TILE ${thisColumn}  ${thisRow}`);
            }
        }        
        drawGUI();
        // draw gme board
    }




    // CLICK FUNCTION EVENT
    function onMouseDown(event){
        var mousePosition = getMousePosition(canvas, event); // Get the mouse position
        mt = getMouseTile(mousePosition);
        if (mt.valid) {
                console.log(`valid tile click detected: ${mt.x}  ${mt.y} `); // WORKS
                // check neighbors of tile
                checkNeighbors(mt.x,mt.y);
            }

        // GAME BUTTON CLICK(META)
        for (var i=0; i<gameButtons.length; i++) {
            if (mousePosition.x >= gameButtons[i].x && mousePosition.x < gameButtons[i].x+gameButtons[i].width &&
                mousePosition.y >= gameButtons[i].y && mousePosition.y < gameButtons[i].y+gameButtons[i].height) {

                // Button i was clicked
                if (i == 0) {
                    // New Game
                    startNewGame();
                } else if (i == 1) {
                    // Show Moves
                    //showMoves = !showMoves;
                    //gameButtons[i].text = (showMoves?"Hide":"Show") + " Moves";
                } 
            }
        }


    }
    

    init();
}    