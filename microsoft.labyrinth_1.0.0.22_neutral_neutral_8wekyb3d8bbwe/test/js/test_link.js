//---------------------------------------------------------------------------
// <copyright file="test_links.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// Test Cases to verify that the winnign area feature is working. These test cases are a part of the physics engine test cases.
// Since we have tested collision detection, we need to test that once collision with a win area is detected than
// game must proceed to winning screen. However, proper display of win imformations is a different test case.
// </summary>
//-----------------------------------------------------------------------------

TestNavLinks = WinJS.Class.define(function () {}, {
    
    /// <summary>
    /// Reads the page displayed in the game
    /// </summary>  
    getState: function () {
        return gameStateManager.curaddr;
    },

    /// <summary
    /// This method attaches the 
    /// </summary>

    attachBackBtn: function () {
        document.testBackBtn = LPbackBtn;
    },

    /// <summary
    /// Move the ball a little from the spawn point, by giving it some velocity
    /// </summary>
    ballDisplace: function () {
        controller.model.ball.vel[0] = 1;
    },

    /// <summary
    /// Checks if the ball is at the spawn point
    /// </summary>
    checkBallAtSpawnPoint: function () {
        var x = controller.model.level.getSpawnPoint()[0];
        var y = controller.model.level.getSpawnPoint()[1];
        
        // when a game restarts ball is invisible for a while until the animations are running and then ball position is set to spawn point
        if ((x == controller.model.ball.center[0] && y == controller.model.ball.center[1]) || controller.model.blockingAnimation != null ){
            return "passed";
        } else {
            return "failed";
        }
    },

}
)

