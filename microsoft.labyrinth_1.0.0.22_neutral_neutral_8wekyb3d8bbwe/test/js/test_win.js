
//---------------------------------------------------------------------------
// <copyright file="test_win.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// Test Cases to verify that the winnign area feature is working. These test cases are a part of the physics engine test cases.
// Since we have tested collision detection, we need to test that once collision with a win area is detected than
// game must proceed to winning screen. However, proper display of win imformations is a different test case.
// </summary>
//-----------------------------------------------------------------------------

testGameWin = WinJS.Class.define(function () {}, {
    
    /// <summary>
    /// Create the test environment.
    /// This method loads a test maze level in the game with only a win area.
    /// The test image loaded is test_winning.png
    /// </summary>  
    init: function () {
                
        var level = { "walls": [{ "pos": [0, 0], "dim": [0.05, 9] }, { "pos": [0, 0], "dim": [16, 0.05] }, { "pos": [15.95, 0], "dim": [0.05, 9] }], "areas": [{ "pos": [14.88924218335983, 7.902490726020138], "dim": [1.0937996820349767, 1.085320614732379], "type": "win" }], "background": "test/images/test_winning.png" };
        // load the level
        testHook.loadLevel(level);
        // stop the timer to prevent auto game advancement
        controller.unregister_timer();
                
        // initializes the win area under test
        testGameWin.winArea = level.areas[0];
                
        // starts the test scenarioario1
        return testGameWin.scenario1();
    },

    // ---------------- senario 1-------------------------------
    /*
     *    ball moving towards a win area.
     *    The test senario passes if the ball fall in a win area than game transitions to winning screen
     */   
     
    /// <summary>
    /// This method place the ball on the right side of the win area and gives it some velocity towards the right
    /// this method is called by senario1()
    /// </summary>
    changePosVel_scenario1: function () {
        controller.model.ball.center[0] = testGameWin.winArea.pos[0] - 1;
        controller.model.ball.center[1] = testGameWin.winArea.pos[1] + 0.5;
        controller.model.ball.vel[0] = 1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    /// Either ball will surpass the win area or ball will just past through it
    /// </summary>
    scenario1: function () {
        // initialize the ball position and velocity
        testGameWin.changePosVel_scenario1();
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
        // box below is described by two properties
        // 1. boxPos is the top left corner of a box containing both the ball and the win area
        // 2. boxDim is the dimensions of the such a box in terms of width and height respectively
        var boxPos = [controller.model.ball.center[0] - 1, controller.model.ball.center[1] - 1];
        var boxDim = [2, 2];
            
        // ball moving forward and ball is behind win area
        while (controller.model.winning == false && testGameWin.insideOfBox(boxPos, boxDim)) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }

        if (controller.model.winning == true) {
            console.log("scenario1: game winning passed"); 
            return "scenario1: game winning passed";
        }
        else {
            console.log("scenario 1: game winning failed "); 
            return "test winning scenario 1: game winning failed"; 
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

    /// <summary>
    /// This method simulates winning
    /// </summary>
    immediateWin: function () {
        controller.model.winning = true;
    },

}
)

