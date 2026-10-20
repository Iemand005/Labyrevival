//---------------------------------------------------------------------------
// <copyright file="testhook.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
//      This is the commons file. This file initialises all the other test cases and is responsible to test case integration with the app.
//      It is responisble to attach the test objects to DOM so that are accessible from the WWAHelper or DOMAccess libraries.
// </summary>
//-----------------------------------------------------------------------------

// Generic test class which other test objects use to call common functions
TestHook = WinJS.Class.define(function () {
    // constructor
},
{
    /// <summary>
    /// Create the test environment.
    /// This method loads a given test maze level in the game
    /// </summary>
    loadLevel: function (level) {
        controller.loadLevel(new Level(level));
        controller.init();
        controller.reloadView(); 
        controller.model.ball.visible = true;
        controller.model.moveBallToSpawnPoint();
        controller.model.blockingAnimation = null;
        controller.model.wallAudioCurrent = 0;
    },
});

// Create an object of test Hook and attaches it to the DOM for DOMACCESS
testHook = new TestHook();
document.testHook = testHook;

// Create an object of collision detection tests and attaches it to the DOM for DOMACCESS
testCollisionDetection = new TestCollisionDetection();
document.testCollisionDetection = testCollisionDetection;

// Create an object of Death Hole tests and attaches it to the DOM for DOMACCESS
testDeathHole = new TestDeathHole();
document.testDeathHole = testDeathHole;

// Create an object of game win tests and attaches it to the DOM for DOMACCESS
testGameWin = new testGameWin();
document.testGameWin = testGameWin;

// Create an object of ball inside frame test and attaches it to the DOM for DOMACCESS
testBallInFrame = new TestBallInFrame();
document.testBallInFrame = testBallInFrame;

// Create an object of game pause and attaches it to the DOM for DOMACCESS
testGamePause = new testGamePause();
document.testGamePause = testGamePause;

// Attach the gamestatemanager to the dom to know the linked page
testNavLinks = new TestNavLinks();
document.testNavLinks = testNavLinks;

// This class simulates handles the click event on the elements in the level picker(list view)
testLevelPicker = new TestLevelPicker();
document.testLevelPicker = testLevelPicker;