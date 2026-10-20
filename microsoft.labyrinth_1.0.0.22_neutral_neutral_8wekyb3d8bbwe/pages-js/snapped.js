(function () {
	var fragmentAdded = function () {
		    //HACK: Hide appBar to "disable" it
            WinJS.UI.getControl(document.getElementById("appBar")).hide();
            document.getElementById("mazeFact").innerHTML = gameStateManager.getMazeFact();
            if (!gameStateManager.backIsTotalWin())
            {
                controller.reloadView();
                controller.view.render(controller.model);
                var time = gameStateManager.getBestTime();
                document.getElementById("currentTime").innerHTML = handleTime(controller.getGameTime());
                if (time === null) 
                    document.getElementById("bestCont").style.opacity = 0;
                else 
                    document.getElementById("bestTime").innerHTML = handleTime(time); //??
                document.getElementById("levelName").innerHTML = gameStateManager.getLevelName();
            }
            else {
                document.getElementById("bestCont").style.display = "none";
                document.getElementById("levelName").style.display = "none";
                document.getElementById("currentTime").style.display = "none";
                document.getElementById("mainGame").style.display = "none";
                document.getElementById("thankyou").style.display = "block";
            }
	    }

	var fragmentRemoved = function () {
	    }
		

	WinJS.Namespace.define("snappedPage", {
		fragmentAdded: fragmentAdded,
        fragmentRemoved: fragmentRemoved,
	});
})();