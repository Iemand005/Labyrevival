
Animation = WinJS.Class.define(null,
	{
		/// <summary>
		///     Update animation timer and call the derived class's animate method
		/// </summary>
		/// <param name="model">
		///     Game model
		/// </param>
		/// <param name="timeDelta">
		///     Amount of time passed
		/// </param>
		/// <returns>
		///     Nothing
		/// </returns>
		advance: function (model, timeDelta) {
			this.timer += timeDelta;
			this.animate(model, timeDelta);
		    },
		/// <summary>
		///     Constructor for animation object, called by derived class consturctors
		/// </summary>
		/// <param name="after">
        ///     Function to be called once animation is done
   		/// </param>
		/// <returns>
		///     Nothing
		/// </returns>
		construct: function (after) {
			this.timer = 0;
			this.doneFlag = null;
			this.after = after;
		} 
	})


WinAnimation = WinJS.Class.derive(Animation, function (model, after) {
		this.ballCenter = model.ball.center;
        this.ballPos = model.ball.pos;
        this.ballDim = model.ball.dim;
		this.size = 0;
        this.alpha = 0;
		this.construct(after);
        this.TIME_STAGE0 = 0.6;
        this.TIME_STAGE1 = 0.2;
        this.TIME_STAGE2 = 0.2;
        this.TIME_STAGE3 = 0.8;
        this.TIME_STAGE = [this.TIME_STAGE0, this.TIME_STAGE1, this.TIME_STAGE2,this.TIME_STAGE3,0];
        this.SIZE_MOD = model.ball.radius * 16/this.TIME_STAGE0;
        this.SIZE_FIN = model.ball.radius * 16;
        this.stage = 0;
        this.overtakeRender = true;
        this.ballAlpha = 1;
        this.glowBallAlpha = 0;
        this.blackAlpha = 0;
	},
{
    /// <summary>
    ///     Change the model and compute data relevant to animation
    /// </summary>
    /// <param name="model">
    ///     Game model
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time passed
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	animate: function (model, timeDelta) {
            if (this.timer >= this.TIME_STAGE[this.stage]) {
                this.stage++;
                this.timer = 0;
            }

            if (this.stage == 0) {
                this.size = this.timer * this.SIZE_MOD;
                this.alpha = this.glowBallAlpha = Math.min(1, this.timer/this.TIME_STAGE0);
            }
            else if (this.stage == 1)
            {
                this.size = this.SIZE_FIN;
                this.alpha = 1;
                this.ballAlpha = 0;
                this.glowBallAlpha = Math.max(0, 1 - 1.2 * this.timer / this.TIME_STAGE1);
                this.blackAlpha = Math.min(0.3, 0.3 * this.timer / this.TIME_STAGE1);
            }
            else if (this.stage == 2)
            {
                this.size = this.SIZE_FIN * Math.max(0, 1-this.timer/this.TIME_STAGE2);
                this.alpha = 1;
                this.ballAlpha = 0;
                this.glowBallAlpha = 0;
                this.blackAlpha = 0.3 + Math.min(0.7, 0.7 * this.timer / this.TIME_STAGE2);
            }
            else {
                this.alpha = 0;
                this.ballAlpha = 0;
                this.glowBallAlpha = 0;
                this.blackAlpha = 1;
            }
	},

	/// <summary>
	///     Revert or finalize changes to the model after animation is finishied
	/// </summary>
	/// <param name="model">
	///     Game model
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	cleanup: function (model) {
	},

	/// <summary>
	///     Check whether animation is done animating
	/// </summary>
	/// <returns>
	///     True if done, false if not done.
	/// </returns>
	done : function()
	{
		return (this.stage == 4);
	},

	/// <summary>
	///     Render animation to screen
	/// </summary>
	/// <param name="view">
	///     Game View
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	render : function(view)
	{
                view.renderer.clearCanvas("screen");
                view.renderer.blitRect("composite", "screen", [0,0], VSIZE);
                view.renderer.colorRect("screen", [0, 0], VSIZE, "rgba(0,0,0," + this.blackAlpha + ")");
                view.renderer.imageToCanvasWithAlpha("screen", "winglow", vectorSub(this.ballCenter, vectorScale([this.size, this.size], 0.5)), [this.size, this.size], this.alpha);
                if (this.ballAlpha) view.renderer.renderBall(this.ballPos, this.ballDim);
                view.renderer.imageToCanvasWithAlpha("screen", "glowball", this.ballPos, this.ballDim, this.glowBallAlpha);
	}
});




HoleAnimation = WinJS.Class.derive(Animation,
    //Construtor
    function (model, center, after) {
	    this.TIME_STAGE0 = 0.15;
	    this.TIME_STAGE1 = 0.5;
	    this.holeCenter = center;
	    this.ballCenter = model.ball.center;
	    this.dist = vectorScale(vectorSub(this.holeCenter, model.ball.center), 1/this.TIME_STAGE0);


	    this.ballDim = model.ball.dim;
	    this.dimStep = vectorScale(this.ballDim, 1 / this.TIME_STAGE1);

	    this.animationStage = 0;
	    this.construct(after);


    },
{
    //Methods

    /// <summary>
    ///     Change the model and compute data relevant to animation
    /// </summary>
    /// <param name="model">
    ///     Game model
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time passed
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	animate: function (model, timeDelta) {
		
		if (this.animationStage === 0)
		{
			if (this.timer >= this.TIME_STAGE0) { 
                this.animationStage = 1; 
                this.timer = 0; 
                this.overtakeRender = true;
            }
			else model.ball.center = vectorAdd(this.ballCenter, vectorScale(this.dist, this.timer));	
		}
		else if (this.animationStage === 1)
		{
			model.ball.visible = false;
			if (this.timer >= this.TIME_STAGE1) { 
                this.animationStage = 2; this.timer = 0; 
            }
			else {
                this.ballDim = vectorSub(model.ball.dim, vectorScale(this.dimStep,this.timer));
            }
		}
	},

	/// <summary>
	///     Revert or finalize changes to the model after animation is finishied
	/// </summary>
	/// <param name="model">
	///     Game model
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	cleanup: function (model) {
		model.ball.visible = true;
        this.view.renderer.clearCanvas("composite");
	},

	/// <summary>
	///     Check whether animation is done animating
	/// </summary>
	/// <returns>
	///     True if done, false if not done.
	/// </returns>
	done: function () {
		return (this.animationStage === 2);
	},

	/// <summary>
	///     Render animation to screen
	/// </summary>
	/// <param name="view">
	///     Game View
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	render: function (view) {
        this.view = view;
		if (this.animationStage === 1)
		{
            var newPos = vectorSub(this.holeCenter, vectorScale(this.ballDim,0.5));
            view.renderer.clearCanvas("screen");
            view.renderer.blitRectWithAlpha("composite", "screen", [0,0], VSIZE, 1-this.timer/this.TIME_STAGE1);
			view.renderer.imageToCanvas("screen", "ball", newPos, this.ballDim);
		}
	}
});

//SPAWN ANIMATION
SpawnAnimation = WinJS.Class.derive(Animation, function (model, after) {
	this.TIME = 0.5;
	this.spawnPoint = model.level.getSpawnPoint();
    
	this.ballDim = [0,0];
	this.dimStep = vectorScale(model.ball.dim, 1 / this.TIME);
	model.ball.visible = false;


	this.construct(after);

},
{
    /// <summary>
    ///     Change the model and compute data relevant to animation
    /// </summary>
    /// <param name="model">
    ///     Game model
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time passed
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	animate: function (model, timeDelta) {
			this.ballDim = vectorScale(this.dimStep, Math.min(this.timer, this.TIME));
	},

	/// <summary>
	///     Revert or finalize changes to the model after animation is finishied
	/// </summary>
	/// <param name="model">
	///     Game model
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	cleanup: function (model) {
		model.ball.visible = true;
	},

	/// <summary>
	///     Check whether animation is done animating
	/// </summary>
	/// <returns>
	///     True if done, false if not done.
	/// </returns>
	done: function () {
		return (this.timer > this.TIME);
	},

	/// <summary>
	///     Render animation to screen
	/// </summary>
	/// <param name="view">
	///     Game View
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	render: function (view) {
			var newPos = vectorSub(this.spawnPoint, vectorScale(this.ballDim, 0.5));
            
            var fluffPosDim = calcPosDim(this.spawnPoint, 3/2 * this.ballDim[0]);
            var fluffPos = fluffPosDim[0];
            var fluffDim = fluffPosDim[1];
            
            view.renderer.featherRadialBlit("sat", "composite", fluffPos,fluffDim)
			view.renderer.renderBall(newPos, this.ballDim);
	}
});


CountdownAnimation = WinJS.Class.derive(Animation, function (model, after) {
		model.moveBallToSpawnPoint();
        
		this.timePerNum = 0.5;
        this.timePerNumSq = this.timePerNum * this.timePerNum;
        this.curnum = 3;
        this.color = [200,0,0];
        this.construct(after);

	},
{

    /// <summary>
    ///     Change the model and compute data relevant to animation
    /// </summary>
    /// <param name="model">
    ///     Game model
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time passed
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	animate: function (model, timeDelta) {
			if (this.timer >= this.timePerNum) {
			    this.curnum--;
                this.timer = 0;
            }
	},

	/// <summary>
	///     Revert or finalize changes to the model after animation is finishied
	/// </summary>
	/// <param name="model">
	///     Game model
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	cleanup: function (model) {
	},


	/// <summary>
	///     Check whether animation is done animating
	/// </summary>
	/// <returns>
	///     True if done, false if not done.
	/// </returns>
	done : function()
	{
		return (this.curnum == 0);
	},
    /// <summary>
    ///     Render animation to screen
    /// </summary>
    /// <param name="view">
    ///     Game View
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	render : function(view)
	{
		if (this.curnum > 0) {
		    var num = this.curnum;
		    var size = 4 + 1 * (this.timePerNumSq - this.timer * this.timer);
		    var left = 8 - size / 4;
            var top = 4.5 + size / 4;
		    var achange = Math.min(1, Math.max(0.00001, 2 -  2* this.timer / this.timePerNum));
		    var colors = [38,95,99];
            view.renderer.canvases.screen.renderText(num, [left, top], size, "rgba(" + colors[0] + "," + colors[1] + "," + colors[2] + "," + achange + ")");

        }
	}
});

ColorWallAnimation = WinJS.Class.derive(Animation, function (model,wallObj) {
	this.TIME = 0.5;
	this.construct(null);
    this.pos = wallObj.pos;
    this.dim = wallObj.dim;
},
{
    /// <summary>
    ///     Change the model and compute data relevant to animation
    /// </summary>
    /// <param name="model">
    ///     Game model
    /// </param>
    /// <param name="timeDelta">
    ///     Amount of time passed
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	animate: function (model, timeDelta) {
	
	},

	/// <summary>
	///     Revert or finalize changes to the model after animation is finishied
	/// </summary>
	/// <param name="model">
	///     Game model
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	cleanup: function (model) {
        this.view.renderer.blitRect("sat", "composite", this.pos, this.dim);
        this.view.renderer.blitRect("sat", "screen", this.pos, this.dim);
	},

	/// <summary>
	///     Check whether animation is done animating
	/// </summary>
	/// <returns>
	///     True if done, false if not done.
	/// </returns>
	done: function () {
		return (this.timer > this.TIME);
	},

	/// <summary>
	///     Render animation to screen
	/// </summary>
	/// <param name="view">
	///     Game View
	/// </param>
	/// <returns>
	///     Nothing
	/// </returns>
	render: function (view) {
        //hack
        this.view = view;
        view.renderer.clearRect("screen", this.pos, this.dim);
        this.view.renderer.blitRect("composite", "screen", this.pos, this.dim);
        view.renderer.blitRectWithAlpha("sat", "screen", this.pos, this.dim, this.timer / this.TIME);
	}
});
