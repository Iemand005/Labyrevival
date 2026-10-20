//debugger;



(function ()
{
       

		var resetGame = function() {
				gameStateManager.go("pages/game.html");
		}
		
		var nextLevel = function () {
				gameStateManager.nextLevel();
				gameStateManager.go("pages/game.html");
                document.getElementById("WINnextBtn").removeEventListener("click", nextLevel, false);
		}
		

        var totalWin = function () {
				gameStateManager.go("pages/totalwin.html");
        }
        

        var fadeIn = function () {
            

            document.getElementById("winPage").style.msTransitionProperty = "opacity";
            document.getElementById("winPage").style.msTransitionDuration = "2s";
            document.getElementById("winPage").style.msTransitionDelay = "0.5s";
            document.getElementById("winPage").style.opacity = 1;
        }

        var fadeOut = function () {
            document.getElementById("winPage").style.msTransitionProperty = "opacity";
            document.getElementById("winPage").style.msTransitionDuration = "1s";
            document.getElementById("winPage").style.msTransitionDelay = "0s";
            document.getElementById("winPage").style.opacity = 0;
        }
        
        var handleBestTime = function(isForward)
        {
            var bestTime = gameStateManager.getBestTime();
            var oldBestTime = gameStateManager.recentlyUsurpedTime;
            if (!oldBestTime)
            {
                document.getElementById("bestTime").innerText = handleTime(bestTime);
            }
            else if (!isForward)
            {
                WinJS.Utilities.addClass(document.querySelector(".winscreen-bestold"), "winscreen-bestnew-return");
                document.getElementById("bestTime").innerText = handleTime(bestTime);
            }
            else {
                document.getElementById("bestTimeNew").innerText = handleTime(bestTime);
                document.getElementById("bestTime").innerText = handleTime(oldBestTime);
                document.querySelector(".winscreen-bestnew").style.opacity = 1;
                document.querySelector(".winscreen-bestold").style.opacity = 0;
            }
        }


		var fragmentAdded = function(frag, state) {

				var time = controller.getGameTime();
                var bestTime = gameStateManager.getBestTime();
                handleBestTime(state);
                document.getElementById("yourTime").innerText = handleTime(time);
                


                document.getElementById("levelName").innerText = gameStateManager.getLevelName();

                if (state) {
                    fadeIn();
                }
                else {
                    document.getElementById("winPage").style.opacity = 1;
                }

                document.getElementById("WINstars").src = STAR_IMAGES_WHITE[gameStateManager.getNumStars(time)];
				

				if (gameStateManager.currentLevel == gameStateManager.maxLevel) document.getElementById("WINnextBtn").addEventListener("click", totalWin, false);
                else document.getElementById("WINnextBtn").addEventListener("click", nextLevel, false);

                controller.resetAllSound();

                controller.model.ball.visible = false;
                controller.reloadView();
                controller.view.render(controller.model);


                
		}
        
		var fragmentRemoved = function () {
		    if (gameStateManager.curaddr === "pages/game.html") {
		        fadeOut();
		        return 1000;
		    }
        }
	
		WinJS.Namespace.define("winPage", {
				fragmentAdded: fragmentAdded,
                fragmentRemoved: fragmentRemoved
			});	
	}	
)();