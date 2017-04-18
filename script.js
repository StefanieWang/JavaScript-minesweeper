//Board Constructor
function Board(width=9, height=9, numberOfMines=10){
	this.board = $(".board");
	this.width = width;
    this.height = height;
	this.numberOfMines = numberOfMines;
    this.minesCountDown = numberOfMines;
    this.gameOverMessage = "Game Over!"
    this.isGameOver = false;
    $(".gameOver").hide();
    this.timepassed = 0;
    this.timer = null;
};

Board.prototype={
    constructor: Board,

	render: function(){	
        this.board.empty();	
	    for (var i=0; i<this.height; i++){
		    for(var j=0; j<this.width; j++){
			    var square = $("<div class=\"square\"></div>");
			    square.attr({
				    "data-i": i,
				    "data-j": j                   
			    });
                var boardHeight = 20*this.height;
                var boardWidth = 20*this.width; 
                this.board.css({
                    width: boardWidth+"px",
                    height: boardHeight+"px"
                })
			    this.board.append(square);
		    };
	    };
        $(".mines").html("Mines: "+ this.minesCountDown);
        this.displayTimePassed();
    },

    displayTimePassed: function(){        
            var timeText;
            var time = this.timepassed;
            if (time<10){
                timeText = "Time: 00"+time;
            }
            else if(time<100){
                timeText = "Time: 0" +time;
            }
            else if (time < 900){
                timeText = "Time: "+ time;
            }
            else if(time>999){
                timeText = "Time: 999";
                this.time = 0;
                clearInterval(this.timer);
            };
           $(".time").html(timeText);
           this.timepassed++;
           console.log(this.timepassed);
        },

    setTimer: function(){       
        this.timer = setInterval(this.displayTimePassed.bind(this), 1000);      
    },    
    
    clearTimer: function(){
        clearInterval(this.timer);
        this.timepassed = 0;
    },

    placeMines: function(){
    	var minesPositions=[];
    	//generate the desired number of random mines 
    	while(minesPositions.length<this.numberOfMines){
    	    var i=Math.floor(Math.random()*this.height);
    	    var j=Math.floor(Math.random()*this.width);
    	    var mine = $('[data-i='+i+'][data-j='+j+']');
    	    if (mine.hasClass("mine")==false){
    	    	mine.addClass("mine");
    	    	minesPositions.push([i,j]);
    	    }
        };      
    },

    findAdjacentPositions: function(position){
        var i = position[0];
        var j = position[1];
        var adjacent;
        //square on the top left corner
        if (i===0&&j===0){
            adjacent = [[i,j+1],[i+1, j],[i+1,j+1]];
        }
        //square on the top right corner
        else if (i===0&&j===this.width-1){
            adjacent = [[i,j-1],[i+1, j],[i+1,j-1]];
        }
        //square on the bottom left corner
        else if (i===this.width-1 && j===0){
            adjacent = [[i,j+1],[i-1, j],[i-1,j+1]];
        }
        //square on the bottom right corner
        else if (i===this.width-1 && j===this.width-1){
            adjacent = [[i,j-1],[i-1, j],[i-1,j-1]];
        }
        //square on the top border
        else if(i===0){
            adjacent = [[i,j-1],[i,j+1],[i+1, j-1],[i+1, j],[i+1,j+1]];
        }
        //square on the bottom border
        else if (i===this.width-1){
            adjacent = [[i,j-1],[i,j+1],[i-1, j-1],[i-1, j],[i-1,j+1]];
        }
                //square on the left border
        else if (j===0){
            adjacent = [[i,j+1],[i+1,j+1],[i-1,j+1],[i+1, j],[i-1, j]];
        }
        //square on the right border
        else if (j===this.width-1){
            adjacent = [[i,j-1],[i+1,j-1],[i-1,j-1],[i+1, j],[i-1, j]];
        }
            //square in the middle part
        else {
            adjacent = [[i,j-1],[i+1,j-1],[i-1,j-1],[i+1, j],[i-1, j],[i-1, j+1],[i,j+1],[i+1,j+1]];
        };

        return adjacent;
    },

    countAdjacentMines: function(){
        for (var i=0; i<this.height; i++){
        	for(var j=0; j<this.width; j++){
        		var count=0;
        		var adjacent = this.findAdjacentPositions([i,j]);
                adjacent.forEach(function(element){
                    var adjacentSquare = $('[data-i='+element[0]+'][data-j='+element[1]+']');
                    if(adjacentSquare.hasClass("mine")){
                        count++;
                    }
                });
                $('[data-i='+i+'][data-j='+j+']').attr("data-mines", count);
        	};
        };
    },

    checkWin: function(){
        var notAllChecked = false;
        $(".square").each(function(index,element){
            if(!$(element).hasClass("checked")){
                notAllChecked = true;
            }
        });

        if(!notAllChecked){
            this.isGameOver = true;
            this.gameOverMessage = "You Win!";
        };
    },

    play: function(){
        var theUserObject = this;
        var minesCountDown = this.numberOfMines;
        var revealSquares = function(target){    
            // when the square was not revealed or flagged previoulsy             
            if (!$(target).hasClass("checked")){
                //reveal number of adjacent mines
                if ($(target).attr("data-mines") != 0){
                    $(target).html($(target).attr("data-mines")).addClass("blank checked");
                    $(target).off("mousedown");
                }
                //if square not directly touching mines, reveal nearby squares
                else {
                    $(target).addClass("blank checked");
                    $(target).off("mousedown");
                    var i = parseInt($(target).attr("data-i"));
                    var j = parseInt($(target).attr("data-j"));
                    var adjacent = theUserObject.findAdjacentPositions([i,j]);
                    adjacent.forEach(function(element){
                        var adjacentTarget = '[data-i='+element[0]+'][data-j='+element[1]+']';
                        revealSquares(adjacentTarget);
                    });
                };
            };
        };

       var placeAFlag = function(target){
            if($(target).html()==="F"){
                $(event.target).html("").removeClass("checked");
                theUserObject.minesCountDown++;
            }
            else{
                $(event.target).html("F").addClass("checked");
                theUserObject.minesCountDown--;
            }
            $(".mines").html("Mines: "+ theUserObject.minesCountDown);
       }
        //set up timer   
       $(".square").click(function(){
        theUserObject.setTimer();
        $(".square").off("click");
       })

       $(".square").mousedown(function(event){
        //disable the right click context menu
        $(document).bind("contextmenu",function(event){
            event.preventDefault();
        })
             
        switch(event.which){   
            //Left Mouse button pressed
            case 1:
            if ($(event.target).hasClass("mine")){
                theUserObject.isGameOver = true;
            }
            else{                
                revealSquares(event.target);
            }
            break;  

            //Right Mouse button pressed
            case 3:
            placeAFlag(event.target);
            break;          
        };
        
        theUserObject.checkWin();
        //show game-over message
        if (theUserObject.isGameOver == true){
            $(".mine").css("background","red");
            $(".gameOver").html(theUserObject.gameOverMessage).show();
            $(".square").off("mousedown");
            theUserObject.clearTimer();
        }
       });
    },

}


$(document).ready(function(){
    var width = 9,
        height = 9,
        numberOfMines = 10,
        board;

    var playGame = function(){
        board = new Board(width, height, numberOfMines);
        board.render();
        board.placeMines(); 
        board.countAdjacentMines();
        board.play();
    };

    playGame();
    //choose difficulty level
    $(".difficulty").click(function(event){
        console.log("clicked");
        var userChoice = $(event.target).html();
        if (userChoice=="Easy"){
            width = 9;
            height = 9;
            numberOfMines = 10;
        }
        else if (userChoice=="Intermediate"){
            width = 16;
            height = 16;
            numberOfMines = 40;
        }
        else if (userChoice == "Expert"){
            width = 30;
            height =16;
            numberOfMines = 99;
        };
        board.clearTimer();
        playGame();
    });
    //restart game
    $(".restart").click(function(){
        board.clearTimer();
        playGame();
    });
    
})