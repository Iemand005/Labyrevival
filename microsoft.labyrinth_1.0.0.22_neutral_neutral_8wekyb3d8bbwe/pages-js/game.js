//debugger; 
(function ()
	{
        //Cheatcode system
        var cheatCode = null;
        var cheatCodes = { "redpill": function () { controller.playSound("hole", 1, false); }, "jupiter": function () { controller.accelmult = ACCEL_MULTIPLIER * 16; },
        "moon": function () { controller.accelmult = ACCEL_MULTIPLIER * 0.2; },
        "turtles": function () { controller.gameTimer.timeSpent += 24 * 3600 * 1000; },
        "mute" : function() { 
            gameStateManager.setVolume(0, "music"); gameStateManager.setVolume(0, "sfx"); 
            controller.changeVolGroup("music");  controller.changeVolGroup("sfx");
         },
         "control" : function() {
            document.getElementById("supersecretsettings").style.display = "block";
         },
         "unlock" : function() {
            gameStateManager.unlockMax = gameStateManager.leveldesc.length - 1;
         }   }

        function advanceCheatcode(e) {
            if (e.char == "/") 
            {
                cheatCode = "";
            }
            else if (cheatCode !== null) {
                if (e.keyCode == 13) {
                    if (!!cheatCodes[cheatCode]) cheatCodes[cheatCode]();
                    cheatCode = null;
                }
                else {
                    cheatCode += e.char;
                }
            }
        }

        //Lets the controller register the keys pressed by the user
        //for arrow control
		var gameKeyDown = function (e) {
			controller.keys[e.keyCode] = true;
		}

		var gameKeyUp = function (e) {
			controller.keys[e.keyCode] = false;

			//Debugging code -- "step through" the frames.

            /*
			if (e.ctrlKey) {
				
				if (e.keyCode === 81) {
					if (controller.timer) 
						controller.unregister_timer();
					else 
						controller.register_timer();
				}
				else if (e.keyCode === 70) {
					controller.advance(TARGET_TD);
				}
				else if (e.keyCode === 88) {
					controller.model.ball.vel[0] = 0;
				}
				else if (e.keyCode === 90) {
					controller.model.ball.vel[1] = 0;
				}
			}
            */
		}

        //Pause the game and show "pause overlay"
		var ABPause = function () { 
				controller.pause();
                controller.pauseAllSound();
                document.getElementById("gameOverlay").style.display = "-ms-grid";
                OLFixTime();
		}
	    
        //Read time from controller and put it in the DOM
        function OLFixTime() {
				var timePlayed = controller.getGameTime();
				document.getElementById("curtime").innerText = handleTime(timePlayed);
        }

        //Resume game
		var ABResume = function () { 
				controller.unpause(); 
                controller.playSound("game", 1, true);
                document.getElementById("gameOverlay").style.display = "none";
		}

        
        //MATT: This is the method that controls page-visibility pausing. Please uncomment and test this once pagevis works
        var hidePause = function () {
                //WinJS.UI.getControl(document.getElementById("appBar")).show();
        }

        //Reload the view (and thus resize it) if we switch between snap and fill view.        
        var gameRerender  = function (e) {
              if (e.layout != Windows.UI.ViewManagement.ApplicationLayoutState.snapped)
                controller.reloadView();
        }

		var fragmentAdded = function(elem, data) {
			if (data)
			{
				gameStateManager.readLevel().then(function (level) {
                    controller.loadLevel(level);
				    controller.register_timer();
                    controller.playSound("game", 1, true);
                    gameAddEvents();
				})
			}
			else {
                document.getElementById("mainGame").style.display = "block";
				controller.reloadView(); 
				controller.register_timer();
                controller.view.render(controller.model);

                //HACK: Ensure animation is not glitchy
                document.getElementById("appBar").style.visibility = "hidden";
                

                WinJS.UI.getControl(document.getElementById("appBar")).show();

                
                ABPause();
			    gameAddEvents();
            }



		}

        //Attach a bunch of event handlers
        var gameAddEvents = function () {
            document.addEventListener("keydown", gameKeyDown, false);
			document.addEventListener("keyup", gameKeyUp, false);
            document.addEventListener("keyup", advanceCheatcode, false);
			document.getElementById("appBar").addEventListener("beforeshow", ABPause, false);
			document.getElementById("appBar").addEventListener("beforehide", ABResume, false);
            //document.getElementById("settingsPane").addEventListener("beforeshow", ABPause, false);
			//document.getElementById("settingsPane").addEventListener("beforehide", ABResume, false);
            document.addEventListener("msvisibilitychange", hidePause);
        
            Windows.UI.ViewManagement.ApplicationLayout.getForCurrentView().addEventListener("layoutchanged", gameRerender, false);

          
        }

		var fragmentRemoved = function() {
			document.removeEventListener("keydown", gameKeyDown, false);
			document.removeEventListener("keyup", gameKeyUp, false);
            document.removeEventListener("keyup", advanceCheatcode, false);
			document.getElementById("appBar").removeEventListener("beforeshow", ABPause, false);
			document.getElementById("appBar").removeEventListener("beforehide", ABResume, false);
            //document.getElementById("settingsPane").removeEventListener("beforeshow", ABPause, false);
			//document.getElementById("settingsPane").removeEventListener("beforehide", ABResume, false);
            document.removeEventListener("msvisibilitychange", hidePause);
			Windows.UI.ViewManagement.ApplicationLayout.getForCurrentView().removeEventListener("layoutchanged", gameRerender, false);

			controller.unregister_timer();
            controller.pauseAllSound();
		}

		WinJS.Namespace.define("gamePage", {
			fragmentAdded: fragmentAdded,
			fragmentRemoved: fragmentRemoved
		});
	}
)();

