
//---------------------------------------------------------------------------
// <copyright file="test_frame.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// Test Cases to verify that the ball remain with the bounds of the screen. These test cases are a part of the physics engine test cases.
// </summary>
//-----------------------------------------------------------------------------

TestBallInFrame = WinJS.Class.define(function () {
    // constructor
},
{
    /// <summary>
    /// Create the test environment.
    /// This method loads a test maze level in the game with just one wall.
    /// The test image loaded is test_frame.png
    /// </summary>
    
    init: function () {
        // level definition
        var level = { "walls": [{ "pos": [0, 0], "dim": [0, 9] }, { "pos": [0, 0], "dim": [16, 0] }, { "pos": [16, 0], "dim": [0, 9] }, { "pos": [0, 9], "dim": [16, 0] }], "background": "test/images/test_frame.png", "backgroundColor": "test/images/test_frame.png" };
        // level load
        testHook.loadLevel(level);
        // stop the timer to prevent auto game advancement
        controller.unregister_timer();
    },

    // ---------------- senario 1-------------------------------
    /*
     *    Case1: ball on left side of the right end of the screen
     *           The test senario passes if the ball bounces back from the wall and test case fails if the ball passes through the wall
     */   
     
    /// <summary>
    /// This method place the ball on the left side of the screen and gives it some velocity towards the right
    /// this method is called by senario1()
    /// The game is meant for the 16:9 ratio of screen resolution. Hence the the numbers below.
    /// but the co-ordinates and vitual co-ordinates, hence do not depend on the screen resolution 
    /// </summary>

    changePosVel_scenario1: function () {
        controller.model.ball.center[0] = 16 - 1;
        controller.model.ball.center[1] = 9 - 1;
        controller.model.ball.vel[0] = 1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    ///    ball on left side of the right end of the screen scenario
    /// <summary>
    scenario1: function () {
        testBallInFrame.changePosVel_scenario1();
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
            
        while (ball_prev_pos <= ball_curr_pos & ball_curr_pos <= 16) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }
        // if ball velocity is negative implies that ball bounced back
        if (ball_prev_pos >= ball_curr_pos) { 
            console.log("scenario 1: passed"); 
            return "testBallInFrame scenario 1: passed"; 
        }
        else if (ball_curr_pos > 16) { 
            console.log("scenario 1: failed"); 
            return "testBallInFrame scenario 1: failed"; 
        }
        
    },

    // ---------------- senario 2-------------------------------
    /*
     *    ball on right side of the left screen
     */

    /// <summary>
    /// This method place the ball on the right side of the screen and gives it some velocity towards the left
    /// this method is called by senario2()
    /// The game is meant for the 16:9 ratio of screen resolution. Hence the the numbers are based on that.
    /// </summary>
    changePosVel_scenario2: function () {
        controller.model.ball.center[0] = 0 + 1;
        controller.model.ball.center[1] = 0 + 1;
        // ball moving to the wall
        controller.model.ball.vel[0] = -1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    ///    ball on right side of the left screen scenario
    /// <summary>
    
    scenario2: function () {
        testBallInFrame.changePosVel_scenario2();
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
            
        while (ball_prev_pos >= ball_curr_pos & ball_curr_pos >= 0) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }
        // if ball velocity is positive implies that ball bounced back
        if (ball_prev_pos <= ball_curr_pos) { 
            console.log("scenario 2: passed");
            return "testBallInFrame scenario 2: passed"; 
        }
        else if (ball_curr_pos < 0) { 
            console.log("scenario 2: failed");
            return "testBallInFrame scenario 2: failed"; 
        }
    },

    // ---------------- senario 3-------------------------------
    /*
     *    ball going to the bottom of the screen
     */

    /// <summary>
    /// This method place the ball on the top side of the screen and gives it some velocity towards the bottom
    /// this method is called by senario3()
    /// The game is meant for the 16:9 ratio of screen resolution. Hence the the numbers are based on that.
    /// </summary>
    changePosVel_scenario3: function () {
        controller.model.ball.center[0] = 8; // 16/2, mid of the screen
        controller.model.ball.center[1] = 8; // 9 - 1, above the bottom 
        controller.model.ball.vel[0] = 0;
        controller.model.ball.vel[1] = 1; // towards the bottom velocity
    },

     /*
     *    ball going to the bottom of the screen scenario
     */

    scenario3: function () {
        testBallInFrame.changePosVel_scenario3();
        var ball_prev_pos = controller.model.ball.center[1];
        var ball_curr_pos = controller.model.ball.center[1];
            
        while (ball_prev_pos <= ball_curr_pos & ball_curr_pos <= 9) {
            ball_prev_pos = controller.model.ball.center[1];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[1];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }
        // if ball velocity is negative implies that ball bounced back
        if (ball_prev_pos >= ball_curr_pos) { 
            console.log("scenario 3: passed");
            return "testBallInFrame scenario 3: passed"; 
        }
        else if (16 < ball_curr_pos) { 
            console.log("scenario 3: failed");
            return "testBallInFrame scenario 3: failed"; 
        }
    },

    // ---------------- senario 4-------------------------------
    /*
     *    ball at the top edge of the frame
     */

    /// <summary>
    /// This method place the ball on the below the top edge of the screen and gives it some velocity towards the top
    /// this method is called by senario4()
    /// The game is meant for the 16:9 ratio of screen resolution. Hence the the numbers are based on that.
    /// </summary>
    changePosVel_scenario4: function () {
        controller.model.ball.center[0] = 8; // 16/2, mid of the screen 
        controller.model.ball.center[1] = 1; // a little ahead from the top edge of the screen
        controller.model.ball.vel[0] = 0;
        controller.model.ball.vel[1] = -1; // velocity towards the top edge
    },

    /*
     *    ball going towards the top of the screen scenario
     */
    scenario4: function () {
        testBallInFrame.changePosVel_scenario4();
        var ball_prev_pos = controller.model.ball.center[1];
        var ball_curr_pos = controller.model.ball.center[1];
            
        while (ball_prev_pos >= ball_curr_pos & ball_curr_pos >= 0) {
            ball_prev_pos = controller.model.ball.center[1];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[1];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }
        // if ball velocity is positive implies that ball bounced back
        if (ball_prev_pos <= ball_curr_pos) { 
            console.log("scenario 4: passed");
            return "testBallInFrame scenario 4: passed"; 
            }
        else if (ball_curr_pos < 0) { 
            console.log("scenario 4: failed");
            return "testBallInFrame scenario 4: failed"; 
            }
        
    },

    // ---------------- senario 5-------------------------------
    /*
     *   Hitting two screen simulatneously <right and bottom>
     */

    /// <summary>
    /// This method place give the ball equal velocity towards right and bottom corner of the screen
    /// this method is called by senario4()
    /// The game is meant for the 16:9 ratio of screen resolution. Hence the the numbers are based on that.
    /// </summary>
    changePosVel_scenario5: function () {
        controller.model.ball.center[0] = 16 - 1;
        controller.model.ball.center[1] = 9 - 1;
        controller.model.ball.vel[0] = 1;
        controller.model.ball.vel[1] = 1;
    },

    /*
     *    ball going to hipe two frames at the same time
     */
    scenario5: function () {
        testBallInFrame.changePosVel_scenario5();
        var ball_prev_pos_x = controller.model.ball.center[0];
        var ball_curr_pos_x = controller.model.ball.center[0];
        var ball_prev_pos_y = controller.model.ball.center[1];
        var ball_curr_pos_y = controller.model.ball.center[1];
            
        while (ball_prev_pos_x <= ball_curr_pos_x && ball_prev_pos_y <= ball_curr_pos_y && ball_curr_pos_x <= 16 && ball_curr_pos_y <= 9) {
            ball_prev_pos_x = controller.model.ball.center[0];
            ball_prev_pos_y = controller.model.ball.center[1];
            controller.advance(0.03);
            ball_curr_pos_x = controller.model.ball.center[0];
            ball_curr_pos_y = controller.model.ball.center[1];
        }

        // if ball velocity is negative in both direction implies that ball bounced back properly
        if (ball_prev_pos_x > ball_curr_pos_x && ball_prev_pos_y > ball_curr_pos_y) { 
            console.log("scenario 5: passed");
            return "testBallInFrame scenario 5: passed"; 
            }
        else { 
            console.log("scenario 5: failed");
            return "testBallInFrame scenario 5: failed"; 
            }
    },
}
)
