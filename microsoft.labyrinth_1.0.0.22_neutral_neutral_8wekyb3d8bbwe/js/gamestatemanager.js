//debugger;

/// <summary>
///     Create a property proxy that transparently passes values to localSettings, so that
///             obj.prop = "val" sets the persistent store              and
///             obj.prop reads from the persistent store
/// </summary>
/// <returns>
///     An object representing the property
/// </returns>
function PersistProperty(name) {
    return  { get: function () { return Windows.Storage.ApplicationData.current.localSettings.values.lookup(name) }, 
                set: function(val) { Windows.Storage.ApplicationData.current.localSettings.values.insert(name, val)} }
}

GameStateManager = WinJS.Class.define(function() {
        this.leveldesc = null;
        this.initAchievement();
        this.currentLevel = this.returnLevel;
        
        this.levelAchievementContainer = Windows.Storage.ApplicationData.current.localSettings.createContainer("leveltimes", Windows.Storage.ApplicationDataCreateDisposition.always);

        this.backstack = []
        this.curaddr = "";
        this.recentlyUsurpedScore = null
	}
	, {
        /// <summary>
        ///     Initialize persistent properties related to level achievment (unlocking, etc) if they are not initialized
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
        initAchievement : function() {
                if (this.unlockMax  === null)
                {
                    this.unlockMax = 0;
                }
                 if (this.returnLevel  === null)
                {
                    this.returnLevel = 0;
                }
            },

        /// <summary>
        ///     Read the level data of a given level from a file
        /// </summary>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     A promise that returns a level description object
        /// </returns>
		readLevel: function(levelNum) {
            if (levelNum === undefined) levelNum = this.currentLevel;
            return this.readJsonFile(this.leveldesc[levelNum].fileName).then( function (data) {
                    return (new Level(data));
            });
		},

        /// <summary>
        ///     Read the level data of a given level from a file
        /// </summary>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     A level description object
        /// </returns>
		nextLevel: function() {
			this.currentLevel = Math.min(this.currentLevel + 1, this.maxLevel);
			this.won = false;
		},

        /// <summary>
        ///     Get the number of stars the user scored on the level.
        /// </summary>
        /// <param name="time">
        ///     Time for level.
        /// </param>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     A nuber between 0 and 4 (0 = 1 star, etc)
        /// </returns>
        getNumStars : function (time, levelnum) {
            if (levelnum === undefined) levelnum = this.currentLevel;
            var descObj = this.leveldesc[levelnum];
            var times = descObj.times || [40, 30, 20, 10];

            for (var rating = 0; rating < times.length && time < times[rating]; rating++);
            
            return rating;
        },

        /// <summary>
        ///     Get the best time for a level.
        /// </summary>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     Number of seconds.
        /// </returns>
        getBestTime: function(levelnum) {
            if (levelnum === undefined) levelnum = this.currentLevel;
            var time = this.levelAchievementContainer.values.lookup(levelnum);
            return time;
        },

        /// <summary>
        ///     Set the best time for the current level.
        /// </summary>
        /// <param name="time">
        ///     Time in seconds
        /// </param>
        /// <returns>
        ///     Nothing
        /// </returns>
        setBestTime : function(time) {
            var bestime = this.getBestTime();
            if (!bestime || Math.floor(time) < Math.floor(bestime)) {
               this.recentlyUsurpedTime = bestime;
               this.levelAchievementContainer.values.insert(this.currentLevel, time); 
            }
            else {
                this.recentlyUsurpedTime = null;
            }
        },

        /// <summary>
        ///     Read the data containing the list of levels into the gameStateManager object.
        /// </summary>
        /// <returns>
        ///     A promise that executes when the level description is loaded.
        /// </returns>
		readLevelDesc: function() {
              var self = this;
              return this.readJsonFile("leveldata.json").then(function(jsondata) { 
                        self.leveldesc = jsondata; 
            });
		},

        /// <summary>
        ///     Advance unlocking-related persistent variables after the current level has been won
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
        advanceAchievement: function() {
            if (!this.reachedMaxLevel && (this.currentLevel == this.unlockMax)) {               
                    this.unlockMax = this.unlockMax + 1;
            }
            
            if (this.isMaxLevel) {
                    this.returnLevel = 0;
            }
            else {
                    this.returnLevel = this.currentLevel + 1;
            }
        },

        /// <summary>
        ///     Set the current level number
        /// </summary>
        /// <param name="levelNum">
        ///     Number of level to set current level to
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
		setCurrentLevel: function(levelNum) {
			this.currentLevel = levelNum;
            this.returnLevel = this.currentLevel;
		},

        /// <summary>
        ///     Read a JSON file and parse its contents
        /// </summary>
        /// <param name="fname">
        ///     Filename
        /// </summary>
        /// <returns>
        ///     A promise that returns a parsed object
        /// </returns>
        readJsonFile: function(fname) {
            var reader;
            var size;

            return Windows.ApplicationModel.Package.current.installedLocationAsStorageFolder.getFolderAsync("leveldata").then(function(folder) {
                return folder.getFileAsync(fname);
            }).then(function(file) {
                        return file.openAsync(Windows.Storage.FileAccessMode.read)
            }).then(function(stream) {
                            size = stream.size;
                            reader = new Windows.Storage.Streams.DataReader(stream.getInputStreamAt(0));
                            return reader.loadAsync(size);
            }).then(function() {
                        var fileContents = reader.readString(size);
                        if (fileContents.charCodeAt(0) == 65279) fileContents = fileContents.slice(1);
                        var jsonContents = JSON.parse(fileContents);
                        return jsonContents;
            })
        },
        
        //The maximum level unlocked by the user
        unlockMax : PersistProperty("unlockMax"),

        //The level to which the user would return should they terminate the application
        returnLevel : PersistProperty("returnLevel"),

        //The highest level number in the game
        maxLevel : { get : function() { return this.leveldesc.length - 1 } },
        
        //Flag that shows whether or not the user has reached the maxiumum level
        reachedMaxLevel : { get : function() { return this.maxLevel === this.unlockMax; } },

        //Flag that shows whether or not the user's current level is the maxiumum level
        isMaxLevel : { get : function() { return this.maxLevel === this.currentLevel; } },

        /// <summary>
        ///     Move to a different screen (based on fragment loader)
        /// </summary>
        /// <param name="addr">
        ///     Fragment address
        /// </summary>
        /// <returns>
        ///     A promise that execute oonce you're done navigating
        /// </returns>
        go : function (addr) {
            if (addr != this.curaddr) {
                this.backstack.push(this.curaddr);
                this.curaddr = addr;
            }
            return WinJS.Navigation.navigate(addr, true);
        },

        /// <summary>
        ///     Move to the previous screen
        /// </summary>
        /// <returns>
        ///     A promise that execute oonce you're done navigating
        /// </returns>
        back : function() {
            var addr = this.backstack.pop();
            this.curaddr = addr;
            return WinJS.Navigation.navigate(addr, false);
        },

        /// <summary>
        ///     Checks whether going back would return you to the game state
        /// </summary>
        /// <returns>
        ///     A boolean representing whether going back would return to the game
        /// </returns>
        backIsGame : function() {
               return this.backstack[this.backstack.length - 1] == "pages/game.html";
        },

        /// <summary>
        ///     Checks whether going back would return you to the total win state
        /// </summary>
        /// <returns>
        ///     A boolean representing whether going back would return to the total win screen
        /// </returns>
        backIsTotalWin : function() {
               return this.backstack[this.backstack.length - 1] == "pages/totalwin.html" || 
                    (this.backstack[this.backstack.length - 1] == "pages/levelPicker.html" && this.backstack[this.backstack.length - 2] == "pages/totalwin.html");
        },
        
        /// <summary>
        ///     Get graphics quality mode
        /// </summary>
        /// <returns>
        ///     An integer representing the graphics quality mode (0= low quality; 1= high quality)
        /// </returns>
        getQualityMode: function() {
            var mode = Windows.Storage.ApplicationData.current.localSettings.values.lookup("qualityMode");
            if (mode === null) mode = 1;
            return mode;
        },

        /// <summary>
        ///     Set the graphics quality mode
        /// </summary>
        /// <param name="mode">
        ///     An integer representing the graphics quality mode (0= low quality; 1= high quality)
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>
        setQualityMode: function(mode) {
            Windows.Storage.ApplicationData.current.localSettings.values.insert("qualityMode", mode);
        },
        
        /// <summary>
        ///     Get the volume of a given sound group
        /// </summary>
        /// <param name="type">
        ///     Type of sound (a string)
        /// </summary>
        /// <returns>
        ///     A number between 0 and 1 representing the volume.
        /// </returns>
        getVolume: function(type) {
            var val = Windows.Storage.ApplicationData.current.localSettings.values.lookup("volume_" + type);
            if (val === null) val = 1.0; 
            return val;
        },

        /// <summary>
        ///     Set the volume of a given sound group
        /// </summary>
        /// <param name="val">
        ///     A number between 0 and 1 representing the volume.
        /// </summary>
        /// <param name="type">
        ///     Type of sound (a string)
        /// </summary>
        /// <returns>
        ///     Nothing
        /// </returns>

        setVolume: function(val, type) {
            Windows.Storage.ApplicationData.current.localSettings.values.insert("volume_" + type, val);
        },

        /// <summary>
        ///     Load the maze facts into the internal state
        /// </summary>
        /// <returns>
        ///     A promise that executes once the facts are done loading.
        /// </returns>

        loadMazeFacts : function() {
            var self = this;
            return this.readJsonFile("mazefacts.json").then(function(data) { 
                self.mazefacts = data 
           });
        },

        /// <summary>
        ///     Get a random maze fact
        /// </summary>
        /// <returns>
        ///     A random maze fact (a string).
        /// </returns>

        getMazeFact : function() {
            var factIndex = Math.floor(Math.random() * this.mazefacts.length);
            return this.mazefacts[factIndex];
        },

        /// <summary>
        ///     Get the name of a level (or of the current level)
        /// </summary>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     The level name.
        /// </returns>

        getLevelName : function(levelNum) {
            if (levelNum === undefined) levelNum = this.currentLevel;
            return this.leveldesc[levelNum].name;
        },

        /// <summary>
        ///     Get the address of the music file for a level.
        /// </summary>
        /// <param name="levelNum" optional="true">
        ///     Number of level. If not specified, defaults to current.
        /// </param>
        /// <returns>
        ///     Address of the music file.
        /// </returns>

        getLevelMusic: function (levelNum) {
            if (levelNum === undefined) levelNum = this.currentLevel;
            var music = this.leveldesc[levelNum].music;
            if (music === undefined) return DEFAULT_MUSIC;
            return music;
        }


       
      
})
