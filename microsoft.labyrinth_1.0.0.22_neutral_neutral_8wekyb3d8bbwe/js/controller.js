//debugger;



Controller = WinJS.Class.define( function () {
    this.model = null;
	this.view = null;
    this.keys = {};
	this.acc = [0, 0];
	this.gameTimer = new Timer();
    this.sounds = {};
    //hack: advance every other frame
    this.frameAdvance = true;
    this.accelmult = ACCEL_MULTIPLIER;
    this.registered = false;

    var self = this;
    /// <summary>
    ///     Advance the controller 1 frame
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    this.advance_outer = function () {
        

        if (self.frameAdvance)
        {
            self.advance(TARGET_TD*2);
        
            //WORKAROUND HACK: Fix problems with image not showing
            if (document.getElementById("mainGame") && document.getElementById("mainGame").style.display == "none")
                document.getElementById("mainGame").style.display = "block";
        }
        if (self.registered != false) this.timer = msRequestAnimationFrame(self.advance_outer);
        self.frameAdvance = !self.frameAdvance;
    }
	this.accelerometer  = Windows.Devices.Sensors.Accelerometer.getDefault();


    
},

{

    /// <summary>
    ///     Additional initialization logic for the controller
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    init: function () {
        this.loadSound("hole", "audio/hole.wav", "sfx");
        this.loadSound("win", "audio/winning.wav", "sfx");
        this.loadSound("wall1", "audio/wall1.wav", "sfx");
        this.loadSound("wall2", "audio/wall2.wav", "sfx");
        this.loadSound("wall3", "audio/wall3.wav", "sfx");
        
        this.loadSound("wall1-2", "audio/wall1.wav", "sfx");
        this.loadSound("wall2-2", "audio/wall2.wav", "sfx");
        this.loadSound("wall3-2", "audio/wall3.wav", "sfx");
        this.loadSound("totalwin", "audio/totalwin.mp3", "music");
	},

    /// <summary>
    ///     Reload hardware resources
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    reloadHardware: function() {
        this.accelerometer = Windows.Devices.Sensors.Accelerometer.getDefault();
    },
    
    /// <summary>
    ///     Load a sound into the controller's sound bank
    /// </summary>
    /// <param name="soundName">
    ///     Name of sound
    /// </param>
    /// <param name="sound">
    ///     URL of sound
    /// </param>
    /// <param name="type">
    ///     type of sound ("group") 
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    loadSound : function(soundName, sound, type) {
        this.sounds[soundName] = new Audio();
        this.sounds[soundName].src = sound;
        this.sounds[soundName].dataSoundType = type;
        this.sounds[soundName].load();
        this.sounds[soundName].volume = gameStateManager.getVolume(type);
        this.sounds[soundName].dataLocalVolume = 1;
    },

    /// <summary>
    ///     Play a sound from the controller's sound bank
    /// </summary>
    /// <param name="soundName">
    ///     Name of sound
    /// </param>
    /// <param name="volume">
    ///     Volume to play sound in (only for this run of the sound)
    /// </param>
    /// <param name="loop">
    ///     True: Loop the sound forever
    ///     False: Play sound once
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    playSound : function(soundName, volume, loop)
    {
        if (this.sounds[soundName] !== undefined) this.sounds[soundName].pause();
        if (loop === undefined) loop = false;
        if (volume === undefined) volume = 1;
        this.sounds[soundName].dataLocalVolume = volume;
        this.sounds[soundName].volume = volume *  gameStateManager.getVolume(this.sounds[soundName].dataSoundType)
        this.sounds[soundName].loop = loop;
        this.sounds[soundName].play();
    },

    /// <summary>
    ///     Pause all sounds that are currently playing
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    pauseAllSound : function() {
      for (soundName in this.sounds) {
          if (!isNaN(this.sounds[soundName].duration)) {
              this.sounds[soundName].pause();
          }
      }  
    },
    
    /// <summary>
    ///     Reset a given sound to its starting point
    /// </summary>
    /// <param name="soundName">
    ///     Name of sound
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    resetSound : function(soundName) {
      this.sounds[soundName].currentTime = 0;
    },


    /// <summary>
    ///     Reset all sounds to their starting point
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    resetAllSound : function() {
        for (soundName in this.sounds) {
            if (!isNaN(this.sounds[soundName].duration)) {
                this.sounds[soundName].currentTime = 0;
            }
        }
    },

    /// <summary>
    ///     Change the volume of all sounds of a given type
    /// </summary>
    /// <param name="type">
    ///     Type of sounds
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    changeVolGroup : function(type) {
        var volume = gameStateManager.getVolume(type);
        for (soundName in this.sounds) {
            if (this.sounds[soundName].dataSoundType == type)
            {
                this.sounds[soundName].volume = volume * this.sounds[soundName].dataLocalVolume;
            }
        }
    },

    /// <summary>
    ///     Load a level and initialize it.
    /// </summary>
    /// <param name="level">
    ///     Level object
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	loadLevel: function(level)
	{
		
		try {
			this.model = new Model(level);
			this.model.init();
			this.loadSound("game", gameStateManager.getLevelMusic(), "music");
			this.resetGameTime();
			this.reloadHardware();
		}
		catch (e) { console.log(e); }

        this.view = new View(); //FIXME: Load the view somewhere else
        this.view.init(this.model);
	},

    /// <summary>
    ///     Reload the view
    /// </summary>
    /// <param name="name">
    ///     DOM ID of screen canvas
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>

	reloadView: function(name) {
		this.view.reload(name);
	},

    /// <summary>
    ///     Return the acceleration caused by the keyboard
    /// </summary>
    /// <returns>
    ///     Tuple [x,y] corresponding to keyboard-based acceleration
    /// </returns>
    getKeyboardAccel: function() {
        
            var keyacc = 8;
            var acc = [0,0];
            if (this.keys[37]) acc[0] -= keyacc;
            if (this.keys[38]) acc[1] -= keyacc;
            if (this.keys[39]) acc[0] += keyacc;
            if (this.keys[40]) acc[1] += keyacc;
            return acc;

    },

    /// <summary>
    ///     Advance the game by a given amount of time (in seconds) and render a frame
    /// </summary>
    /// <param name="timeDelta">
    ///     Amount of time
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    advance: function (timeDelta) {

			var REFRESH_NUM = 2;

            
			for (var i = 0; i < REFRESH_NUM; i++)
			{
				this.model.advance(this, timeDelta / REFRESH_NUM);
				if (this.model.winning)
				{
					this.win();
					return;
				}
			}
			this.view.render(this.model);

            
			//DEBUG CODE PLEASE REMOVE
		    //var myacc = this.getAcceleration();
			//document.getElementById("accvals").innerHTML = myacc[0] + "<br />" + myacc[1];
              
    },


    /// <summary>
    ///     Pause game
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	pause: function() { 
		this.unregister_timer();
	},


    /// <summary>
    ///     Unpause game
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	unpause: function() { 
		this.register_timer();
	},

    /// <summary>
    ///     Get amount of time the current level has been played
    /// </summary>
    /// <returns>
    ///     Game time in seconds
    /// </returns>
	getGameTime: function() {
		return this.gameTimer.check();
	},

    /// <summary>
    ///     Register the game timer, allowing the game to run.
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	register_timer: function () {
		if (!this.registered)
		{
            try{
                this.gameTimer.resume();
                this.timer = msRequestAnimationFrame(this.advance_outer);
                this.registered = true;
            }
            catch (e) {
                console.log(e);
            }
		}
	},

    /// <summary>
    ///     Unregister the game timer, stopping the game.
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	unregister_timer: function() {
		if (this.registered)
		{
            try {
			    this.gameTimer.pause();
		        if (this.timer) msCancelRequestAnimationFrame(this.timer);
			    this.registered = false;
            }
            catch (e) {
                console.log(e);
            }
		}
	},

    /// <summary>
    ///     Return current acceleration.
    /// </summary>
    /// <returns>
    ///     A tuple [x,y] of acceleration
    /// </returns>
	getAcceleration: function() {

		var inputAccel = [0,0];
		if (this.accelerometer) {
			var reading = this.accelerometer.getCurrentReading();
			inputAccel = [reading.accelerationX, reading.accelerationY*-1];
		}
		return vectorAdd(this.getKeyboardAccel(), vectorScale(inputAccel, this.accelmult));
	},

    /// <summary>
    ///     Handles the winning of the game.
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	win: function()
	{
        gameStateManager.advanceAchievement();
        this.unregister_timer(); 
        gameStateManager.setBestTime(this.getGameTime());
        gameStateManager.go("pages/winner.html");
	},
	
    /// <summary>
    ///     Reset the played time for the level.
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	resetGameTime: function() {
		this.gameTimer.start();
	}
});

//Timer object - represent a pausable timer to measure aspects of the game
Timer = WinJS.Class.define( function() { 
		this.timeStart = (new Date()).getTime();
		this.timeSpent = 0;
	},
	{
        /// <summary>
        ///     Start / restart the time
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
		start: function () {
			this.timeStart = (new Date()).getTime();
			this.timeSpent = 0;
		},
		
        /// <summary>
        ///     Get the current time
        /// </summary>
        /// <returns>
        ///     Time in seconds
        /// </returns>
        check: function () {
			var t = this.timeSpent;
			if (this.timeStart)
				t += ((new Date()).getTime() - this.timeStart);
			return t / 1000;
		},

        /// <summary>
        ///     Pause the timer
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
		pause: function () {
		if (this.timeStart)
			this.timeSpent += (new Date()).getTime() - this.timeStart;
		this.timeStart = null;
		},

        /// <summary>
        ///     Resume the timer
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
		resume: function () {
			this.timeStart = (new Date()).getTime();
		}
})

