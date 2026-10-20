//---------------------------------------------------------------------------
// <copyright file="test_collision.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// Collision Dectection Test Cases for the physics engine
// </summary>
//-----------------------------------------------------------------------------

TestCollisionDetection = WinJS.Class.define(function () {
    // constructor
},
{
    /// <summary>
    /// Create the test environment.
    /// This method loads a test maze level in the game with just one wall
    /// </summary>
    init: function () {
                
        // this the level generated from the LabyrinthDesigner on the image simple.png
        var level = { "walls": [{ "pos": [0, 0], "dim": [0, 9] }, { "pos": [0, 0], "dim": [16, 0] }, { "pos": [16, 0], "dim": [0, 9] }, { "pos": [0, 9], "dim": [16, 0] }, { "pos": [6.374930050363738, 2.6860660324566314], "dim": [1.2534974818130946, 3.8052602126468944] }], "holes": [], "areas": [], "background": "test/images/simple.png", "backgroundColor": "test/images/simple.png" };
        // load the level
        testHook.loadLevel(level);
        // stop the timer to prevent auto game advancement
        controller.unregister_timer();
                
        // initializes the wall under test
        testCollisionDetection.testWall = { "pos": [6.374930050363738, 2.6860660324566314], "dim": [1.2534974818130946, 3.8052602126468944] };
    },

    // ---------------- senario 1-------------------------------
    /*
     *    Case1: ball on right side of the wall
     *           The test senario passes if the ball bounces back from the wall and test case fails if the ball passes through the wall
     */   
     
    /// <summary>
    /// This method place the ball on the right side of the wall and gives it some velocity towards the wall
    /// this method is called by senario1()
    /// 1 and 0.5 number are just placing the ball at some distance away from the wall
    /// be careful, if you place it too far from the wall than ball might be placed outside the screen and this test would go into infinite loop
    /// but the co-ordinates and vitual co-ordinates, hence do not depend on the screen resolution 
    /// </summary>
    changePosVel_scenario1: function () {
        // placing the ball on the right side of the test wall
        controller.model.ball.center[0] = testCollisionDetection.testWall.pos[0] - 1;
        controller.model.ball.center[1] = testCollisionDetection.testWall.pos[1] + 0.5;
        // some velocity in the forward deirection
        controller.model.ball.vel[0] = 1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    /// This method moves the ball farward and checks when the ball hits the wall. 
    /// After the ball hits the wall the method checks if the ball bounces back<test successful> or goes into the wall<failure case>.
    /// controller.advances(0.03) advances the game by 30 milisecs.
    /// </summary>
    scenario1: function () {
        // give the ball initial position and velocity
        testCollisionDetection.changePosVel_scenario1();
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
    
        while (ball_prev_pos <= ball_curr_pos & ball_curr_pos <= testCollisionDetection.testWall.pos[0]) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }

        // if ball velovity is negative, the bounced back
        if (ball_prev_pos > ball_curr_pos) { 
            //console.log("scenario 1: passed"); 
            return "testCollisionDetection scenario 1: passed"; 
        }
        else { 
            //console.log("scenario 1: failed"); 
            return "testCollisionDetection scenario 1: failed"; 
        }
        
    },

    // ---------------- senario 2-------------------------------
    /*
     *    scenario 2: ball on left side of wall
     *    The test senario passes if the ball bounces back from the wall and test case fails if the ball passes through the wall
     */  
    
    /// <summary>
    /// This method place the ball on the left side of the wall
    /// this method is called by senario2()
    /// 1 and 0.5 number are just placing the ball at some distance away from the wall
    /// </summary>
	changePosVel_scenario2: function () {
        // left side of the wall is (top left corner + width of the wall)
        var left_edge = testCollisionDetection.testWall.pos[0] + testCollisionDetection.testWall.dim[0];
        // initializing ball position to left of the left edge of the wall
        controller.model.ball.center[0] = left_edge + 1;
        controller.model.ball.center[1] = testCollisionDetection.testWall.pos[1] + 0.5;
        // initializing ball velocity to wards left edge of the wall
        controller.model.ball.vel[0] = -1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    /// This method moves the ball backwards horizontally and checks when the ball hits the wall. 
    /// After the ball hits the wall the method checks if the ball bounces back<test successful> or goes into the wall<failure case>.
    /// controller.advances(0.03) advances the game by 30 milisecs.
    /// </summary>
    scenario2: function () {
        // give the ball initial position and velocity
        testCollisionDetection.changePosVel_scenario2();
        var left_edge = testCollisionDetection.testWall.pos[0] + testCollisionDetection.testWall.dim[0];
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
            
        while (ball_prev_pos >= ball_curr_pos & ball_curr_pos >= left_edge) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }
        // advances the state of the ball a little bit to make the result of the test case more visible
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }

        // if ball velovity changed to positive, the ball bounced back
        if (ball_prev_pos < ball_curr_pos) { 
            console.log("scenario 2: passed");
            return "testCollisionDetection scenario 2: passed"; 
        }
        else if (ball_curr_pos <= left_edge) { 
            console.log("scenario 2: failed");
            return "testCollisionDetection scenario 2: failed"; 
        }
    },

    // ---------------- senario 3-------------------------------
    /*
     *    scenario 3: ball on top of the wall
     *    The test senario passes if the ball bounces back from the wall and test case fails if the ball passes through the wall
     */  

    /// <summary>
    /// This method place the ball on the top of the wall and give it some velocity towards the wall
    /// this method is called by senario3()
    /// 1 and 0.5 number are just placing the ball at some distance away from the wall
    /// </summary>
	
    changePosVel_scenario3: function () {
        var top_edge = testCollisionDetection.testWall.pos[1];
        controller.model.ball.center[0] = testCollisionDetection.testWall.pos[0] + 0.5;
        controller.model.ball.center[1] = top_edge - 1;
        controller.model.ball.vel[0] = 0;
        controller.model.ball.vel[1] = 1;
    },

    /// <summary>
    /// This method moves the ball forward vertically and checks when the ball hits the wall. 
    /// After the ball hits the wall the method checks if the ball bounces back<test successful> or goes into the wall<failure case>.
    /// controller.advances(0.03) advances the game by 30 milisecs.
    /// </summary>
    
    scenario3: function () {
	    // give the ball initial position and velocity
        testCollisionDetection.changePosVel_scenario3();
        // this time we are considering vertical position
        var top_edge = testCollisionDetection.testWall.pos[1];
        var ball_prev_pos = controller.model.ball.center[1];
        var ball_curr_pos = controller.model.ball.center[1];
            
        while (ball_prev_pos <= ball_curr_pos & ball_curr_pos <= top_edge) {
            ball_prev_pos = controller.model.ball.center[1];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[1];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }

        // if ball velovity changed to negative vertically, the ball bounced back
        if (ball_prev_pos > ball_curr_pos) { 
            console.log("scenario 3: passed");
            return "testCollisionDetection scenario 3: passed"; 
        }
        else if (top_edge <= ball_curr_pos) { 
            console.log("scenario 3: failed");
            return "testCollisionDetection scenario 3: failed"; 
        }
    },

    // ---------------- senario 4-------------------------------
    /*
     *    scenario 4: ball below the wall
     *    The test senario passes if the ball bounces back from the wall and test case fails if the ball passes through the wall
     */  

    /// <summary>
    /// This method place the ball on the top of the wall and give it some velocity towards the wall
    /// this method is called by senario3()
    /// 1 and 0.5 number are just placing the ball at some distance away from the wall
    /// be careful, if you place it too far from the wall than ball might be placed outside the screen and this test would go into infinite loop
    /// </summary>
	
    changePosVel_scenario4: function () {
        var bottom_edge = testCollisionDetection.testWall.pos[1] + testCollisionDetection.testWall.dim[1];
        controller.model.ball.center[0] = testCollisionDetection.testWall.pos[0] + 0.5;
        controller.model.ball.center[1] = bottom_edge + 0.1;
        controller.model.ball.vel[0] = 0;
        controller.model.ball.vel[1] = -1;
    },

    /// <summary>
    /// This method moves the ball backward vertically and checks when the ball hits the wall. 
    /// After the ball hits the wall the method checks if the ball bounces back<test successful> or goes into the wall<failure case>.
    /// controller.advances(0.03) advances the game by 30 milisecs.
    /// </summary>

    scenario4: function () {
	    // give the ball initial position and velocity
        testCollisionDetection.changePosVel_scenario4();
        var bottom_edge = testCollisionDetection.testWall.pos[1] + testCollisionDetection.testWall.dim[1];
        var ball_prev_pos = controller.model.ball.center[1] + 1;// careful center[1]
        var ball_curr_pos = controller.model.ball.center[1];
            
        while (ball_prev_pos >= ball_curr_pos & ball_curr_pos >= bottom_edge) {
            ball_prev_pos = controller.model.ball.center[1];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[1];
        }
        for (var i = 0; i < 10; i++) {
            controller.advance(0.03);
        }
        
        // if ball velovity changed to positive vertically, the ball bounced back
        if (ball_prev_pos < ball_curr_pos) { 
            console.log("scenario 4: passed");
            return "testCollisionDetection scenario 4: passed"; 
        }
        else if (ball_curr_pos >= bottom_edge) { 
            console.log("scenario 4: failed");
            return "testCollisionDetection scenario 4: failed"; 
        }
    },

    // ---------------- senario 5-------------------------------
    /*
     *    scenario 5: 
     *    Two walls are places adjacently. There ball might get stuck at the junction point.
     *    Ball then hits the exact center of the junction of the walls
     */  

    /// <summary>
    /// This method places the ball on the left side of the wall, horizontally at the junction of the walls
    /// and give it some velocity horizontally towards the junction of the wall
    /// this method is called by senario5()
    /// 1 and 0.5 number are just placing the ball at some distance away from the wall
    /// be careful, if you place it too far from the wall than ball might be placed outside the screen and this test would go into infinite loop
    /// </summary>
    changePosVel_scenario5: function (testWall, centerY) {
        controller.model.ball.center[0] = testWall.pos[0] - 1;
        controller.model.ball.center[1] = testWall.pos[1] + centerY;
        controller.model.ball.vel[0] = 1;
        controller.model.ball.vel[1] = 0;
    },

    /// <summary>
    /// This method moves the ball horizontally towards the junction of two walls.
    /// After the ball hits the wall the method checks if the ball bounces back<test successful> or goes into the wall<failure case>.
    /// controller.advances(0.03) advances the game by 30 milisecs.
    /// This method loads it own different level and image in the game.
    /// </summary>

    scenario5: function () {
        var level = { "walls": [{ "pos": [0, 0], "dim": [0.05, 9], "doNotColor": true }, { "pos": [0, 0], "dim": [16, 0.05], "doNotColor": true }, { "pos": [15.95, 0], "dim": [0.05, 9], "doNotColor": true }, { "pos": [0, 8.95], "dim": [16, 0.05], "doNotColor": true }, { "pos": [5.4874371859296485, 1.2462311557788945], "dim": [2.733668341708542, 2.3115577889447234] }, { "pos": [5.4874371859296485, 3.557788944723617], "dim": [2.733668341708542, 2.2311557788944727] }], "holes": [], "areas": [], "background": "test/images/level_CD_test_5.png", "backgroundColor": "test/images/level_CD_test_5.png" };
        testHook.loadLevel(level);
        controller.unregister_timer();
                
        // initializes the wall under test
        var testWalls = { "pos": level.walls[4].pos, "dim": level.walls[4].dim };
        
		// give the ball initial position and velocity
        testCollisionDetection.changePosVel_scenario5(testWalls, level.walls[5].pos[1]);
        var ball_prev_pos = controller.model.ball.center[0];
        var ball_curr_pos = controller.model.ball.center[0];
            
        while (ball_prev_pos <= ball_curr_pos & ball_curr_pos <= testWalls.pos[0]) {
            ball_prev_pos = controller.model.ball.center[0];
            controller.advance(0.03);
            ball_curr_pos = controller.model.ball.center[0];
        }

        // if the ball velocity is negative than the ball bounced back
        if (ball_prev_pos > ball_curr_pos) { 
            console.log("scenario 5: passed");
            return "testCollisionDetection scenario 5: passed"; 
        }
        else if (ball_curr_pos >= testWalls.pos[0]) { 
            console.log("scenario 5: failed");
            return "testCollisionDetection scenario 5: failed"; 
        }
    },

    

}
)
