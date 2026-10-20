
VHEIGHT = 9; //Height of game coordinates
VWIDTH = 16; //Width of game coordinates
VSIZE = [VWIDTH, VHEIGHT] //Size of game screen as an [x,y] tuple

//Pixel size of image resources for high quality mode
HHEIGHT_HIQ = 675;
HWIDTH_HIQ = 1200;

//Pixel size of image resources for low quality mode
HHEIGHT_LOQ = 450;
HWIDTH_LOQ = 800;

SQUARE_SIZE = [1, 1]; //Size of squares in the level collision grid
NUMBER_SQUARES = [VWIDTH / SQUARE_SIZE[0], VHEIGHT / SQUARE_SIZE[1]]; //Number of squares in the level collision grid

LOCKED_IMAGE = "url(/images/Locked.png)"; //Resource of lock image

TARGET_TD = 1/60; //Amount of time per call of controller.advance_outer. Technically our framerate is 30fps because we only update the screen every other call.

STAR_IMAGES = ["/images/1star.png", "/images/2star.png", "/images/3star.png", "/images/4star.png", "/images/5star.png"]; //Images of stars

STAR_IMAGES_WHITE = ["/images/1star-white.png", "/images/2star-white.png", "/images/3star-white.png", "/images/4star-white.png", "/images/5star-white.png"]; //...and in white

BALL_MAXVEL = 50; //Maximum velocity
BALL_MAXDISP = 0.30; //Maximum per-frame displacement

DEFAULT_MUSIC = "/audio/play.mp3"; //Default level music

//PHYSICS VARIABLES
ACCEL_MULTIPLIER = 45 //Speed of the ball (AKA value of gravity in game coordinates)
COLLISION_MOMENTUMLOSS = 0.82 //Fraction of momentum lost when colliding with wall
RUBBER_VELGAIN = 3 //Velocity gain when colliding with rubber wall
FRICTION_MULTIPLIER = 0 //Amount of friction
MINVEL_SLIPPERY = 1

/// <summary>
///     Convert time in seconds into string
/// </summary>
/// <param name="time">
///     Time in seconds
/// </param>
/// <returns>
///     A string corresponding to the time.
/// </returns>
function handleTime(time) {
    var padDigits= function(num) {
	    num = "" + num; 
	    if (num.length === 1) num = "0" + num;
	    return num;
    }

    var hours = Math.floor(time / 3600);
    var minutes = Math.floor((time % 3600) / 60);
    var seconds = Math.floor(time % 60);
    if (hours) {
        return hours + ":" + padDigits(minutes) + ":" + padDigits(seconds);
    }
    else {
        return minutes + ":" + padDigits(seconds);
    }
}


/// <summary>
///     Convert color in tuple form into a CSS color string
/// </summary>
/// <param name="c">
///     Color as a tuple [red,green,blue] of integers from 0 to 255
/// </param>
/// <returns>
///     A string that can be used as a CSS color.
/// </returns>
var colorify = function (c) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",1)";
}