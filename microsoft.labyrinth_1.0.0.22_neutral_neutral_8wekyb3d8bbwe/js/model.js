//debugger;


WALLAUDIO_NAMES = ["wall1", "wall2", "wall3",
                    "wall1-2", "wall2-2", "wall3-2"]

Model = WinJS.Class.define( function (level) {
	try {
		this.ball = new Ball();
		this.paused = false;
		var self = this;
		this.level = level;
		this.blockingAnimation = null;
		this.winning = false;
        this.movementMod = null;
        this.nonBlockingAnimations = [];
	}
	catch (e)
	{
			console.log(e);
	}


},

//let it be noted: collision detection fails at high speeds in this prototype
{
    /// <summary>
    ///     Initialize the model
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	init: function () {
        this.ball.visible = false;
        this.blockingAnimation = new CountdownAnimation(this, function (model) { model.spawn(); });
		this.winning = false;
        this.alreadyColoredWalls = {};
        
	},

    /// <summary>
    ///     Add a non-blocking animation to the set of non-blocking animations being played
    /// </summary>
    /// <param name="animation">
    ///     An animation object.
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    addNonBlockingAnim : function (animation) {
        this.nonBlockingAnimations.push(animation);
    },

    /// <summary>
    ///     Remove a non-blocking animation from the set of non-blocking animations being played
    /// </summary>
    /// <param name="animHandle">
    ///     A number representing the animation object in the nonblocking animation set
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    removeNonBlockingAnim : function (animHandle) {
        delete this.nonBlockingAnimations[animHandle];
    },
	
    /// <summary>
    ///     Spawn the  ball
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    spawn: function () {
		this.blockingAnimation = new SpawnAnimation(this, function(model) { model.ball.center = model.level.getSpawnPoint(); model.ball.vel = [0,0];});
        this.alreadyColoredWalls = {};
        this.wallAudioCurrent = 0;
	},
    /// <summary>
    ///     Advance the game by a certain amount of time
    /// </summary>
    /// <param name="controller">
    ///     The game controller
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time in seconds by which to advance
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    advance: function (controller, timeDelta) {
        for (var animHandle in this.nonBlockingAnimations)
        {
            var anim = this.nonBlockingAnimations[animHandle];
                    
            anim.advance(this, timeDelta);
			if (anim.done())
			{
				anim.cleanup(this);
                this.removeNonBlockingAnim(animHandle);
			}
        }
                
		if (this.blockingAnimation)
		{
			this.blockingAnimation.advance(this, timeDelta);
			if (this.blockingAnimation.done())
			{
				var blocker = this.blockingAnimation;
				this.blockingAnimation = null;
						
				blocker.cleanup(this);
				blocker.after(this);
			}
		}
		else
		{
			this.advanceGame(controller, timeDelta);
		}
    },

    /// <summary>
    ///     Advance the game by a certain amount of time, without regard to blocking or non-blocking animations
    /// </summary>
    /// <param name="controller">
    ///     The game controller
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time in seconds by which to advance
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	advanceGame : function (controller, timeDelta)
	{
				var acc = controller.getAcceleration();
                var veclen;
				switch (this.movementMod)
				{
					case "reverse":
						acc = vectorScale(acc, -1);
						break;
					case "sticky":
						this.ball.vel = vectorScale(this.ball.vel, Math.pow(10, -3*timeDelta));
						acc = vectorScale(acc, Math.pow(10, -20*timeDelta))
						break;
					case "slippery":
						acc = [0, 0];
                        veclen = vectorLen(this.ball.vel);
                        if (veclen < MINVEL_SLIPPERY && veclen != 0) {
                            this.ball.vel = vectorScale(this.ball.vel, MINVEL_SLIPPERY/veclen);
                        }
						break;
				}
                this.movementMod = null;

				
				this.ball.kinematics(acc, timeDelta);
				this.CollisionDetection();
				
	},
	

    /// <summary>
    ///     Detect collisions with objects in the game and handle them appropriately
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	CollisionDetection : function()
	{
		var self = this;
		var touchedSquares = this.getTouchedSquares();
		var collisionDetector = { wall: function(wallObj)
									{
										return self.ball.collDetectRect(wallObj.pos, wallObj.dim);
									},
								  hole: function(holeObj)
									{
										return (self.ball.collDetectCircle(holeObj.center, holeObj.radius) < 0.75);
									},
									area: function(areaObj)
									{
										return self.ball.collDetectArea(areaObj.pos, areaObj.dim);
									}
								}

		var collisionHandler = { wall: function (wallObj, collisionObj)
									{
										self.handleWallCollision(wallObj,collisionObj);
										return false;
									},
								 hole: function (holeObj, collisionObj)
								   {
									   self.handleHoleCollision(holeObj);
									   return true;
							       },
								area: function (areaObj, collisionObj)
								   {
									   switch (areaObj.type) {
										   case "win":
											self.blockingAnimation = new WinAnimation(self, function(model) { model.winning = true; });
                                            controller.pauseAllSound();
                                            controller.playSound("win");
											return true;
                                           case "reverse":
                                           case "sticky":
                                           case "slippery":
                                                self.movementMod = areaObj.type;
										}
							       }
							  }
		var collisionCompare = function (a, b) {
			if (a.object.objectType === "wall" && b.object.objectType === "hole") return -1;
			if (a.object.objectType === "hole" && b.object.objectType === "wall") return 1;

            if (a.object.objectType === "wall" && a.object.objectType === "wall") {
                return b.result.dist - a.result.dist;
            } 
			return 0;
		}

		this.collisionDetectionWrapper(collisionDetector, collisionHandler, collisionCompare, touchedSquares);
	},

    /// <summary>
    ///     A functional wrapper for a collision detection engine
    /// </summary>
    /// <param name="collisionDetector">
    ///     An object mapping game-object types to functions that detect whether or not the ball collides with them and returns
    ///     an object that does not map to false if they do collide.
    /// </param>
    /// <param name="collisionHandler">
    ///     An object mapping game-object types to functions that handle a collision of the ball with an object of that type
    /// </param>
    /// <param name="collisionCompare">
    ///     Comparison for collisions of different types so they can be sorted and more likely collisions can be handled first (this is to avoid overlapping collisions cases)
    /// </param>
    /// <param name="touchedSquares">
    ///     Game-grid squares whose objects need to be checked for collisions
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	collisionDetectionWrapper : function (collisionDetector, collisionHandler, collisionCompare, touchedSquares)
	{
		

		 var objectsChecked = {};
		 var collisions = [];
		 
		 
		 for (var squareIndex in touchedSquares) {
			var currentSquare = touchedSquares[squareIndex];
			var currentCollision = null;
            var objects = this.level.getObjects(currentSquare);
				
			for (var objectIndex in objects)
			{
				if (!objectsChecked[objects[objectIndex]]) {
					var currentObject = this.level.getObjectFromHandle(objects[objectIndex]);

					currentCollision = collisionDetector[currentObject.objectType](currentObject);
					if (currentCollision) collisions.push({object: currentObject, result: currentCollision});
					
				}
				objectsChecked[objects[objectIndex]] = true;
			}
		 }

			if (collisionCompare) collisions.sort(collisionCompare);
			for (var i = 0; i < collisions.length; i++)
			{
                    var collision = collisions[i];
                    if (collision = collisionDetector[collision.object.objectType](collision.object))
					    collisionHandler[collisions[i].object.objectType](collisions[i].object, collisions[i].result);
			}
    },

    /// <summary>
    ///     Bounce the ball of a wall it collides with and play a sound
    /// </summary>
    /// <param name="wallObj">
    ///     The wall (position, size, and type)
    /// </param>
    /// <param name="collisionObj">
    ///     Details regarding the collision.
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	handleWallCollision: function (wallObj, collisionObj) {
        
        if (!wallObj.doNotColor && !this.alreadyColoredWalls[[wallObj.pos, wallObj.dim]]) 
        {
            this.addNonBlockingAnim(new ColorWallAnimation(this, wallObj));
            var volume = 0.45;
            controller.playSound(WALLAUDIO_NAMES[this.wallAudioCurrent], volume);
            this.wallAudioCurrent = (this.wallAudioCurrent+1) % WALLAUDIO_NAMES.length;
        }
        this.alreadyColoredWalls[[wallObj.pos, wallObj.dim]] = true;
		var wallType = wallObj.type;
		var momloss = (wallType === "rubber") ? 0 : COLLISION_MOMENTUMLOSS;
		this.ball.center = vectorAdd(this.ball.center, collisionObj.vector);
		this.ball.vel[collisionObj.axis] = (momloss - 1) * this.ball.vel[collisionObj.axis];
		if (wallType === "rubber")
        {
            this.ball.vel[collisionObj.axis] += sign(this.ball.vel[collisionObj.axis]) * RUBBER_VELGAIN;
        }
    },

    /// <summary>
    ///     Drop the ball down a hole
    /// </summary>
    /// <param name="holeObj">
    ///     The hole (center, radius, type)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	handleHoleCollision: function(holeObj) {
		switch (holeObj.type)
		{
			case "deathtrap":
				this.nonBlockingAnimations = [];
				this.blockingAnimation = new HoleAnimation(this, holeObj.center, function (model) { model.spawn();  });
                controller.playSound("hole");
				break;
		}
	},

    /// <summary>
    ///     Return the squares in the collision grid that the ball is currently on
    /// </summary>
    /// <returns>
    ///     An object in which the key is a string representing the collision grid square and the value is the square itself. This allows us to avoid
    ///     repetition and still use proper arrays internally.
    /// </returns>
    getTouchedSquares: function () {
        var returnValue = {};
        var self = this;

        var setSq = function (pos) {
			var squareVal = self.level.squareFromPosition(pos);
            returnValue[squareVal] = squareVal;
		}
        
		setSq(vectorAdd(this.ball.center, vectorScale([-1,-1], this.ball.radius)));
		setSq(vectorAdd(this.ball.center, vectorScale([-1,1], this.ball.radius)));
		setSq(vectorAdd(this.ball.center, vectorScale([1,-1], this.ball.radius)));
		setSq(vectorAdd(this.ball.center, vectorScale([1,1], this.ball.radius)));
        return returnValue;
    },
    

    /// <summary>
    ///     Move the ball to the spawnpoint
    /// </summary>
    /// <returns>
    ///     Nothing.
    /// </returns>
    moveBallToSpawnPoint: function() {
           this.ball.pos = this.level.getSpawnPoint();
    }
	
});