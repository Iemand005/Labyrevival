
//---------------------------------------------------------------------------
// <copyright file="test_pause.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// The test case ensure that once the appbar is pulled the game state pauses.
// </summary>
//-----------------------------------------------------------------------------

testGamePause = WinJS.Class.define(function () {}, {
        
    /// <summary>
    /// This method pull up the appBar programmatically.
    /// </summary>
    pause: function () {
        WinJS.UI.getControl(document.getElementById("appBar")).show();
        },

    /// <summary>
    /// This method resumes the game after a pause event
    /// </summary>
    resume: function () {
        WinJS.UI.getControl(document.getElementById("appBar")).hide();
    },

    /// <summary>
    /// This method returns the game state as a long string separated by a #
    /// </summary>
    getState: function () {
        return controller.model.ball.center[0] + "#" + controller.model.ball.center[1] + "#" + controller.model.ball.vel[0] + "#" + controller.model.ball.vel[1];
    } 
}
)

