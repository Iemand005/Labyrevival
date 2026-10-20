//debugger;

 (function () {
    var app = WinJS.Application;


    function execCustomMethod(pageContainer, attrName)
    {
	    var pageElem = pageContainer.querySelector(".page-root");
	    if (pageElem) {
		    var faname = pageElem.getAttribute(attrName);
		    if (faname) {
			    var func = WinJS.Utilities.getMember(faname);
			    if (func) { return func(pageContainer.childNodes[0], WinJS.Navigation.history.current.state) }
		    }
	    }
    }



    //Adapted from intern lab
    WinJS.Navigation.addEventListener("navigated", function(e) {
	    var fill = function () {
            WinJS.UI.Fragments.clone(e.detail.location, e.detail.state).then(function(frag) {
	            pageContainer.innerHTML = "";
    		    pageContainer.appendChild(frag);

			    WinJS.UI.processAll(pageContainer).then(function() {
					    pageContainer.focus()
					    execCustomMethod(pageContainer, "data-fragmentadded");
			    });
	        });
	    }

        var pageContainer = document.getElementById("pageContainer");
        var wait = execCustomMethod(pageContainer, "data-fragmentremoved");

	    if (wait === undefined)
	        fill();
	    else
	        setTimeout(fill, wait);
    })




    function ABRestart() {
	        gameStateManager.go("pages/game.html");
	        WinJS.UI.getControl(document.getElementById("appBar")).hide();
            disableRestartButton();
            setTimeout( enableRestartButton, 500);
    }

    function disableRestartButton() {
        document.getElementById("ABrestartBtn").removeEventListener("click", ABRestart, false);
    }

    function enableRestartButton() {
        document.getElementById("ABrestartBtn").addEventListener("click", ABRestart, false);
    }

    function ABLevelPicker() {
	    gameStateManager.go("pages/levelPicker.html");
    }



    function onViewChange (e) {
        if (e.layout == Windows.UI.ViewManagement.ApplicationLayoutState.snapped) 
            gameStateManager.go("pages/snapped.html");
        else if (gameStateManager.curaddr == "pages/snapped.html") 
            gameStateManager.back();
    }



    function changeQualityMode()
    {
        var mode = (document.getElementById("lowResRendering").checked) ? 2 : 1;
        gameStateManager.setQualityMode(mode);
        controller.view.reloadAllResources(controller.model);
    }

    function changeMusicVolume() {
        gameStateManager.setVolume(document.getElementById("musicVolume").value/10, "music");
        controller.changeVolGroup("music", document.getElementById("musicVolume").value/10);
    }

    function changeSFXVolume() {
        gameStateManager.setVolume(document.getElementById("sfxVolume").value/10, "sfx");
        controller.changeVolGroup("sfx", document.getElementById("sfxVolume").value/10);
    }


    function changeColMomLoss() {
        COLLISION_MOMENTUMLOSS = parseFloat(document.getElementById("collmomloss").value)
    }

    function changeAccel() {
        controller.accelmult = parseFloat(document.getElementById("accel").value)
    }

    function changeVelGain() {
        RUBBER_VELGAIN = parseFloat(document.getElementById("rvelgain").value)
    }

    function changeFriction() {
        FRICTION_MULTIPLIER = parseFloat(document.getElementById("friction").value)
    }

    //Because of the way the "change" event works, we must make sure that events are not attached
    //while we programmatically set input values, so attach events while showing the settings pane
    function SPprepare() {
        var qualityMode = gameStateManager.getQualityMode();
        var musicVolume = gameStateManager.getVolume("music");
        var sfxVolume = gameStateManager.getVolume("sfx");

        if (qualityMode == 2) document.getElementById("lowResRendering").checked = true;
        document.getElementById("musicVolume").value = musicVolume * 10;
        document.getElementById("sfxVolume").value = sfxVolume * 10;

        document.getElementById("rvelgain").value = RUBBER_VELGAIN;
        document.getElementById("friction").value = FRICTION_MULTIPLIER;
        document.getElementById("accel").value = controller.accelmult;
        document.getElementById("collmomloss").value = COLLISION_MOMENTUMLOSS;
        
        document.getElementById("lowResRendering").addEventListener("change", changeQualityMode);
        document.getElementById("musicVolume").addEventListener("change", changeMusicVolume);
        document.getElementById("sfxVolume").addEventListener("change", changeSFXVolume);

        document.getElementById("collmomloss").addEventListener("change", changeColMomLoss);
        document.getElementById("accel").addEventListener("change", changeAccel);
        document.getElementById("rvelgain").addEventListener("change", changeVelGain);
        document.getElementById("friction").addEventListener("change", changeFriction);
    }

    
    function SPdetach() {
        document.getElementById("lowResRendering").removeEventListener("change", changeQualityMode);
        document.getElementById("musicVolume").removeEventListener("change", changeMusicVolume);
        document.getElementById("sfxVolume").removeEventListener("change", changeSFXVolume);

        document.getElementById("collmomloss").removeEventListener("change", changeColMomLoss);
        document.getElementById("accel").removeEventListener("change", changeAccel);
        document.getElementById("rvelgain").removeEventListener("change", changeVelGain);
        document.getElementById("friction").removeEventListener("change", changeFriction);
    }

    function SPShow() {
        WinJS.UI.getControl(document.getElementById("settingsPane")).show();
    }

    app.addEventListener("loaded", function () {
        Windows.Graphics.Display.DisplayProperties.autoRotationPreferences = Windows.Graphics.Display.DisplayOrientations.landscape;
	    controller = new Controller();
	    gameStateManager = new GameStateManager();
    
        gameStateManager.readLevelDesc().then ( function() {
            return gameStateManager.loadMazeFacts();
        }).then (function () {
            return WinJS.Promise.join([
                WinJS.UI.Fragments.load("pages/game.html"),
                WinJS.UI.Fragments.load("pages/levelPicker.html"),
                WinJS.UI.Fragments.load("pages/snapped.html"),
                WinJS.UI.Fragments.load("pages/totalwin.html"),
                WinJS.UI.Fragments.load("pages/winner.html")
            ])   
        }).then (function () {
       
	    
	        enableRestartButton();
	        document.getElementById("ABlevelPickerBtn").addEventListener("click", ABLevelPicker, false);

            // Settings pane related code removed for PDC
	        //document.getElementById("settingsPane").addEventListener("beforeshow", SPprepare, false); 
            //document.getElementById("settingsPane").addEventListener("beforehide", SPdetach, false); //HACK: Detach events because we must avoid "changed" event issue
        
        
            Windows.UI.ViewManagement.ApplicationLayout.getForCurrentView().addEventListener("layoutchanged", onViewChange, false);
            //Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView().applicationCommands.append(new Windows.UI.ApplicationSettings.SettingsCommand(Windows.UI.ApplicationSettings.SettingsCommand.preferences, SPShow))
        
        
	        WinJS.UI.processAll().then(function() { 
                    controller.init();
                    gameStateManager.go("pages/game.html");
	        });
        });
    }, false);

    Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function () {
        controller.reloadHardware();
    }, false);

    app.start();
})();