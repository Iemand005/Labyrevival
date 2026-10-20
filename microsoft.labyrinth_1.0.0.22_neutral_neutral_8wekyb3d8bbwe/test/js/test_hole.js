
//---------------------------------------------------------------------------
// <copyright file="test_hole.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// Test Cases to verify that the hole feature is working. These test cases are a part of the physics engine test cases.
// Since we have tested collision detection, we need to test that once collision with a hole is detected than 
// ball spawn at the spawn point and game resets.
// </summary>
//-----------------------------------------------------------------------------

TestDeathHole = WinJS.Class.define(function () {}, {
        
    /// <summary>
    /// Create the test environment.
    /// This method loads a test maze level in the game with just one wall.
    /// The test image loaded is simple.png
    /// </summary>
    init: function () {
                
        var level = { "walls": [{ "pos": [0, 0], "dim": [0, 9] }, { "pos": [0, 0], "dim": [16, 0] }, { "pos": [16, 0], "dim": [0, 9] }, { "pos": [0, 9], "dim": [16, 0] }, { "pos": [6.374930050363738, 2.6860660324566314], "dim": [1.2534974818130946, 3.8052602126468944] }], "holes": [{ "center": [2.3985161632220456, 3.6120826709062004], "radius": 0.40717183944183877 }], "areas": [], "background": "test/images/simple.png", "backgroundColor": "test/images/simple.png" };
        // load the level
        testHook.loadLevel(level);
        // stop the timer to prevent auto game advancement
        controller.unregister_timer();
                
        // initializes the hole under test
        testDeathHole.hole = level.holes[0];
                
        // starts the test scenarioario1
        return testDeathHole.scenario1();
    },

    // ---------------- senario 1-------------------------------
    /*
     *    ball moving towards a death hole.
     *    The test senario passes if the ball fall in a death hole and spawn at spawn poin
     */   
     
    /// <summary>
    /// This method place the ball on the right side of the death hole and gives it some velocity towards the left
    /// this method is called by senario1()
    /// </summary>
    changePosVel_scenario1: function () {
        controller.model.ball.center[0] = testDeathHole.hole.center[0] + 1;
        controller.model.ball.center[1] = testDeathHole.hole.center[1];
        controller.model.ball.vel[0] = -1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    /// Either ball will surpass the death hole or ball will just past through it
    /// </summary>
    scenario1: function () {
        // initialize the ball position and velocity
        testDeathHole.changePosVel_scenario1();
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
        // box below is described by two properties
        // 1. boxPos is the top left corner of a box containing both the ball and the hole
        // 2. boxDim is the dimensions of the such a box in terms of width and height respectively
        var boxPos = [controller.model.ball.center[0] - 1, controller.model.ball.center[1] - 1];
        var boxDim = [2, 2];
            
        // until our ball is inside this box it has not falling the death hole
        while (testDeathHole.insideOfBox(boxPos, boxDim)) {
            ball_prev_pos = controller.model.ball.center[0];
            // advances the game by 30 milisecs
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }

        // once the ball has come out of our hypothetical box, 
        // eithter the ball would spawn at spawn point which implies death <passed>
        // in the other case ball passes through the hole undamaged which implies no death <failed>
        var spawnSq = controller.model.level.getSpawnPoint();
        if (testDeathHole.insideOfBox(spawnSq, boxDim)) { 
            console.log("scenario 1: passed"); 
            return "test hole scenario 1: passed"; 
            }
        else { 
            console.log("scenario 1: failed "); 
            return "test hole scenario 1: failed"; 
            }
    },

    /// <summary>
    /// This method evaluates if our ball in the box passed as a parameter.
    /// </summary>
    insideOfBox: function (pos, dim) {
        var centerX = controller.model.ball.center[0];
        var centerY = controller.model.ball.center[1];
        if (centerX <= (pos[0] + dim[0]) && centerX >= pos[0] && centerY <= (pos[1] + dim[1]) || centerX > pos[0])
            return true;
        else
            return false;
    },

}
)

