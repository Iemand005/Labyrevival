//---------------------------------------------------------------------------
// <copyright file="test_levelpicker.js" company="Microsoft Corp">
// Copyright (c) Microsoft 2010. All rights reserved.
// </copyright>
// <summary>
// The test case simulates the click event on the list view control in the level picker.
// This is needed in order to test working links in the different list view elements.
// </summary>
//-----------------------------------------------------------------------------

TestLevelPicker = WinJS.Class.define(function () {
},
{
        /// <summary>
        ///  Throw click event from element.
        /// </summary>
        /// <param name="element" type="object">
        ///  Handle to element to throw click from
        /// </param>
        click: function (element) {

            var event;

            if (element) {

                this.mouseDown(element);

                this.mouseUp(element);

                event = document.createEvent("MouseEvents");
                event.initMouseEvent("click", true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, element);
                element.dispatchEvent(event);
            }
    },

        /// <summary>
        ///  Throw mousedown event from element.
        /// </summary>
        /// <param name="element" type="object">
        ///  Handle to element to throw mousedown from
        /// </param>
        mouseDown: function (element) {
            if (element) {
                var event = document.createEvent("MSPointerEvent");
                // pointerType = 4 (mouse event)
                event.initPointerEvent("MSPointerDown", true, true, window, 0, 0, 0, 0, 0,
                    false, false, false, false, 0, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0);
                element.dispatchEvent(event);

                // This is simply for backwards compatibility for our tests.  This should be removed once our tests and dev code are updated.
                event = document.createEvent("MouseEvents");
                event.initUIEvent("mousedown", true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, element)
                element.dispatchEvent(event);
            }
        },

       /// <summary>
       ///  Throw mouseup event from element.
       /// </summary>
       /// <param name="element" type="object">
       ///  Handle to element to throw mouseup from
       /// </param>
       mouseUp: function (element) {
            if (element) {
                var event = document.createEvent("MSPointerEvent");
                event.initPointerEvent("MSPointerUp", true, true, window, 0, 0, 0, 0, 0,
                    false, false, false, false, 0, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0);
                element.dispatchEvent(event);

                // This is simply for backwards compatibility for our tests.  This should be removed once our tests and dev code are updated.
                event = document.createEvent("MouseEvents");
                event.initUIEvent("mouseup", true, true, window,
                    0, 0, 0, 0, 0, false, false, false, false, 0, element)
                element.dispatchEvent(event);
            }
        },

        /// <summary>
        ///  This function fires the click event on the first element.
        ///  This test function is called from LevelPickerDataVerification test from the file ProfileAndMaps.cs
        /// </summary>
        clickFirstElement: function () {
            var tile = document.getElementById("levelList_0");
            testLevelPicker.click(tile);
        }
});

