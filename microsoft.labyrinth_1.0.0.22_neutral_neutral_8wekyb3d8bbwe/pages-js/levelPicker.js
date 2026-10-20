//debugger;


(function () {

    var treatLevelDesc = function (groups) {
            var levelsNew = [];
            var max = gameStateManager.unlockMax;
            var levels = gameStateManager.leveldesc;
            for (var levelIndex in levels) {
                var levelTreated = {};
                levelTreated.overlayClass = "levelpicker-overlay";
                levelTreated.playTime = "";
                levelTreated.playText = levels[levelIndex].name;
                var group = levels[levelIndex].group;
                if (group === undefined) group = 0;
                levelTreated.group = groups[group];

                var timeCompleted = gameStateManager.getBestTime(levelIndex);
                levelTreated.displayImage = "url(" + levels[levelIndex].displayImage + ")";
                if (levelIndex > max) {
                    levelTreated.overlayClass = "levelpicker-lockoverlay";
                    levelTreated.playText = "";
                }
                else 
                {
                    levelTreated.overlayImage = "";
                    if (timeCompleted == null)
                    {
                        levelTreated.starImage = "";
                    }
                    else {
                        levelTreated.displayImage = "url(" + levels[levelIndex].displayImageColor + ")";
                        levelTreated.playTime += handleTime(timeCompleted);
                        levelTreated.starImage = "url(" + STAR_IMAGES[gameStateManager.getNumStars(timeCompleted, levelIndex)] + ")";
                    }
                }
                levelsNew.push(levelTreated);
            }

            return levelsNew;
    }

    var makeGroups = function(numLevels) {
        /*groups = [];
        for (var i = 0; i < Math.ceil(numLevels/4); i++)
        {
            groups.push({
                key: 'group' + i,
                title: ''
            });
        }
        return groups;*/

        return [{key: "easy", title: "Easy"}, {key: "medium", title: "Medium"}, {key: "hard", title: "Hard"}]
    }

    var ABHide = function () {
         WinJS.UI.getControl(document.getElementById("appBar")).hide();
         controller.playSound("hole", 1, false);
    }

	var fragmentAdded = function (elem, state) {
            
		    var cont = WinJS.UI.getControl(document.getElementById("levelList"));
		    var elem = document.getElementById("levelList");
		    var backBtn = document.getElementById("LPbackBtn");

            var groups = makeGroups(gameStateManager.leveldesc.length);
		    var levels = treatLevelDesc(groups);

            
		    var groupDataSource = new WinJS.UI.GroupDataSource(
                    new WinJS.UI.ListDataSource(groups), function (item) {
		        return {
		            key: item.data.group.key,
		            data: {"title" : item.data.group.title}
		        };
		    });
            
		    cont.groupDataSource = groupDataSource;
			cont.dataSource = levels;
		    

		
		     cont.addEventListener("iteminvoked", function (eventObject) {
                                        if (gameStateManager.currentLevel === eventObject.detail.itemIndex && gameStateManager.backIsGame()) gameStateManager.back();
				    				    else if (gameStateManager.unlockMax >= eventObject.detail.itemIndex)
                                        {
                                            gameStateManager.setCurrentLevel(eventObject.detail.itemIndex);
									        gameStateManager.go("pages/game.html");
                                        }
		    })

            backBtn.addEventListener("click", function () {
			    gameStateManager.back(); 
                });
	        
            document.getElementById("appBar").style.display = "none";
            WinJS.UI.getControl(document.getElementById("appBar")).hide();
            document.getElementById("appBar").addEventListener("beforeshow", ABHide, false);

            cont.addEventListener("readystatechanged", function (e) {
                if (e.detail && !e.detail.scrolling) { //This element seems to send one extraneous event on occasion, so we ignore them.
                
                    //e.detail.addedItems[gameStateManager.currentLevel].element.scrollIntoView();
                    //document.querySelector(".win-viewport").scrollLeft -= 110;
                    if (gameStateManager.backIsGame())
                    {
                        WinJS.Utilities.addClass(e.detail.addedItems[gameStateManager.currentLevel].element, "currentLevel");
                        e.detail.addedItems[gameStateManager.currentLevel].element.querySelector(".levelpicker-image").innerHTML = "<canvas id=\"mainGame\"></canvas>";
                        controller.reloadView();
                        controller.view.render(controller.model);
                    }
                }
            }, false);
            

            
        }

    var fragmentRemoved  = function () {
        document.getElementById("appBar").style.display = "-ms-grid";
        document.getElementById("appBar").removeEventListener("beforeshow", ABHide, false);
    }

		
		

	WinJS.Namespace.define("pickerPage", {
		fragmentAdded: fragmentAdded,
        fragmentRemoved: fragmentRemoved
	});
})();