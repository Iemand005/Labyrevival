//debugger;



(function ()
{
    
    var interval = null;
    var timeout = null;
    var lastlocMouse = {};
    var lastlocLog = {};
    var startedScrolling = false;
    var pointerID = null;
    var numFingers = 0;
    var scroll;

    var startScrolling = function() {
        startedScrolling = true;
        continueScrolling();
        timeout = null;
    }
    
    var continueScrolling = function() {
        if (!interval && numFingers == 0 && startedScrolling) interval = setInterval(totalWinScroll, 25);
    }
    
    var pauseScrolling = function() {
        if (interval) clearInterval(interval);
        interval = null;
    }

    var ABVidPause = function () {
        //document.getElementById("winvid").pause();
        controller.pauseAllSound();
        pauseScrolling()
    }

    var ABVidResume = function () {
        //document.getElementById("winvid").play();
        controller.playSound("totalwin", 1, false);
        continueScrolling();
    }

    var totalWinScroll = function() {
        document.getElementById("totalwinTextScroll").scrollTop += 2;
    }

    var mouseDown = function(e) {
        numFingers++;
        pauseScrolling();
        lastlocMouse[e.pointerId] = e.clientY;
        lastlocLog[e.pointerId] = document.getElementById("totalwinTextScroll").scrollTop;
        
    }

    var mouseMove = function(e)
    {
            if (numFingers > 0 && startedScrolling)
            {
                document.getElementById("totalwinTextScroll").scrollTop += lastlocMouse[e.pointerId] - e.clientY;
                lastlocMouse[e.pointerId] = e.clientY;
            }
    }

    var mouseUp = function(e) {
        if (numFingers > 0) numFingers--;
        continueScrolling();
    }

    var populateScores = function()
    {
        var template = WinJS.UI.getControl(document.getElementById("totalwinScoretemp"));
        var promises = [];
        var levels= gameStateManager.leveldesc;
        for (levelIndex in levels)
        {
          var levelData = levels[levelIndex];
          var levelTime = gameStateManager.getBestTime(levelIndex);
          var levelDataMod = {levelimg: levelData.displayImageColor, levelname: levelData.name, leveltime : handleTime(levelTime), levelstarimg: STAR_IMAGES_WHITE[gameStateManager.getNumStars(levelTime, levelIndex)]}
          promises.push(template.render(levelDataMod, document.getElementById("totalwinScores")));
        }
        return WinJS.Promise.join(promises);
        
        
    }

    var fragmentAdded = function (elem, isEnter) {
            document.getElementById("appBar").addEventListener("beforeshow", ABVidPause, false);
            document.getElementById("appBar").addEventListener("beforehide", ABVidResume, false);
            document.getElementById("totalwinTextScroll").addEventListener("MSPointerUp", mouseUp, false);
            document.getElementById("totalwinTextScroll").addEventListener("MSPointerDown", mouseDown, false);
            document.getElementById("totalwinTextScroll").addEventListener("MSPointerMove", mouseMove, false);
            document.getElementById("ABrestartBtn").style.display = "none";
		    
            populateScores().then( function () {
                if (isEnter)
                {
                    interval = null;
                    lastlocMouse = {};
                    lastlocLog = {};
                    startedScrolling = false;
                    numFingers = 0;

                    timeout = setTimeout(startScrolling, 3000);
                    document.querySelector(".totalwin-textcont").style.opacity = 1;
                    controller.resetSound("totalwin");
                }
                else {
                    document.getElementById("totalwinTextScroll").scrollTop = scroll;
                    startScrolling();
                    document.querySelector(".totalwin-textcont").style.msTransitionDuration = "0";
                    document.querySelector(".totalwin-textcont").style.opacity = 1;
                }
                controller.playSound("totalwin", 1, false);
            })
		}
        
    var fragmentRemoved = function () {
		        document.getElementById("appBar").removeEventListener("beforeshow", ABVidPause, false);
		        document.getElementById("appBar").removeEventListener("beforehide", ABVidResume, false);
                document.getElementById("ABrestartBtn").style.display = "-ms-grid";
                if (interval) clearInterval(interval);
                pauseScrolling();
                scroll = document.getElementById("totalwinTextScroll").scrollTop;
                controller.pauseAllSound();
        }
	    
		WinJS.Namespace.define("totalWinPage", {
				fragmentAdded: fragmentAdded,
                fragmentRemoved: fragmentRemoved
			});	
	}	
)();