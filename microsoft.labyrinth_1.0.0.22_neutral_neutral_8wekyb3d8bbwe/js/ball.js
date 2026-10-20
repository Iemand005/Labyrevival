

Ball = WinJS.Class.define(function() {
    this.center = [0,0]; //Will be replaced by spawn point

    this.disp_last = [0, 0];
	

    this.dim = [0.4, 0.4];
	this.radius = this.dim[0] / 2;

    this.vel = [0, 0];
	this.visible = true;
	}, 
	
	{
    /// <summary>
    ///     Run the kinematics equations on the ball
    /// </summary>
    /// <param name="acc">
    ///     Accelleration of ball
    /// </param>
    /// <param name="timeDelta">
    ///     Time difference in seconds
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    kinematics: function (acc, timeDelta) {
        if (FRICTION_MULTIPLIER != 0 && vectorLen(this.vel) > FRICTION_MULTIPLIER * timeDelta)
          this.vel = vectorSub(this.vel, vectorScale(vectorUnit(this.vel), FRICTION_MULTIPLIER * timeDelta));

        this.vel = vectorAdd(this.vel, vectorScale(acc, timeDelta));
        

        if (Math.abs(this.vel[0]) > BALL_MAXVEL) {
            this.vel[0] = BALL_MAXVEL * sign(this.vel[0]);
        }
        if (Math.abs(this.vel[1]) > BALL_MAXVEL){
            this.vel[1] = BALL_MAXVEL * sign(this.vel[1]);
        }

        var disp = vectorAdd(vectorScale(this.vel, timeDelta), vectorScale(acc, timeDelta * timeDelta * 0.5));
        this.disp_last = disp;

    	if (Math.abs(disp[0]) > BALL_MAXDISP) {
    	    disp[0] = BALL_MAXDISP * sign(disp[0]);
        }
        if (Math.abs(disp[1]) > BALL_MAXDISP){
            disp[1] = BALL_MAXDISP * sign(disp[1]);
        }

        this.center = vectorAdd(this.center, disp);
    },


    /// <summary>
    ///     Returns the line corresponding to the side of the rectangle that should be tested for collision with the circle based on the direction of the ball's displacement on a given axis.
    /// </summary>
    /// <param name="pos">
    ///     Position of tested rectangle
    /// </param>
    /// <param name="dim">
    ///     Size of tested rectangle
    /// </param>
    /// <param name="axis">
    ///     Axis tested (0=x, 1=y)
    /// </param>
    /// <returns>
    ///     A 2-tuple of points [A,B]
    /// </returns>
	getSideForCollision: function(pos,dim,axis)
	{
		var A = vectorCpy(pos);
		var B = vectorCpy(pos);
		A[1 - axis] += dim[1 - axis];
		if (this.disp_last[axis] === 0) return null;
			
		if (this.disp_last[axis] < 0)
		{
			A[axis] += dim[axis];
			B[axis] += dim[axis];
		}
		return [A,B]
	},

	/// <summary>
    ///     Detects a collision of the ball with a rectangle
    /// </summary>
    /// <param name="pos">
    ///     Position of tested rectangle
    /// </param>
    /// <param name="dim">
    ///     Size of tested rectangle
    /// </param>
    /// <returns>
    ///     A collision object representing the collision
    /// </returns>
    collDetectRect: function (pos, dim) {
		var self = this;
		 var resolveDim = function (axis) {

			var line = self.getSideForCollision(pos, dim, axis);
			if (line === null) return { dist: 0, move: 0 };
			var coll = lineCircleIntersect(line[0], line[1], self.center, self.radius);
			
			//Fuzzfactor
			if (coll < 0.0001) return { dist: 0, move: 0 };
			

			var realColl = coll;

			if (sign(self.center[axis] - line[0][axis]) === sign(self.disp_last[axis])) 
				realColl += self.radius;
			
			return {dist: coll, move: realColl};
		}

		
		var coll = [resolveDim(0), resolveDim(1)];
		
		if (coll[0].dist != 0 || coll[1].dist != 0) {
			var axis = (Math.abs(coll[0].dist) > Math.abs(coll[1].dist)) ? 0 : 1; //?
			var vector = [0, 0];
			vector[axis] = coll[axis].move * -1 * sign(this.disp_last[axis]);
			return { axis: axis, dist: coll[axis].dist, vector: vector };
		}
		
		return null;
    },

    /// <summary>
    ///     Detects a collision of the ball with a circle
    /// </summary>
    /// <param name="center">
    ///     Center of tested circle
    /// </param>
    /// <param name="radius">
    ///     Radius of tested circle.
    /// </param>
    /// <returns>
    ///     The fraction of the ball that is inside the circle
    /// </returns>
	collDetectCircle: function(center, radius)
	{
		var raddiff = vectorDist(this.center, center) + this.radius - radius;
		if (raddiff <= 0) return 0;
		return raddiff / this.radius;
	},

    /// <summary>
    ///     Detects whether a ball is inside an area
    /// </summary>
    /// <param name="pos">
    ///     Position of tested rectangle
    /// </param>
    /// <param name="dim">
    ///     Size of tested rectangle
    /// </param>
    /// <returns>
    ///     True if the ball is inside the area, false if it isn't.
    /// </returns>
	collDetectArea: function (pos, dim)
	{
		return pointInRect(pos, dim, this.center);
	},

    
	pos : { get: function() { return vectorSub(this.center, vectorScale(this.dim, 0.5));}, set: function(value) { this.center = vectorAdd(value, vectorScale(this.dim, 0.5));} } ,
	right : { get: function() { return this.center[0] + this.radius }},
	bottom : { get: function() { return this.center[1] + this.radius }},
	top : { get: function() { return this.pos[1] }},
	left : { get: function() { return this.pos[0] }},
	end : { get: function() { return [this.right, this.bottom]; } },
});
