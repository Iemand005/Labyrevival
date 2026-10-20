
Level = WinJS.Class.define(function (descObj) {
    //initialize the grid
	var walls = descObj.walls || [];
	var holes = descObj.holes || [];
	var areas = descObj.areas || [];

    

	this.levelBackground = (descObj.background != undefined) ? descObj.background : null;
    this.levelBackgroundSat = (descObj.background != undefined) ? descObj.backgroundColor : this.levelBackground;

	this.spawnPoint = descObj.spawn || [0.5, 0.5];
	this.gameObjects = [];
    this.grid = [];
	for (var i = 0; i <= NUMBER_SQUARES[0]; i++) {
		this.grid.push([]);
			for (var j = 0; j <= NUMBER_SQUARES[1]; j++) {
				sqdesc = {};       
                sqdesc.objects = [];
				this.grid[i].push(sqdesc);
		}
	}
		
        
	   for (var wallIndex in walls)
	   {
			var wallDesc = walls[wallIndex];
			if (!wallDesc.pos || !wallDesc.dim) { console.log("INVALID WALL"); continue; }
			wallDesc.type = (!!wallDesc.type) ? wallDesc.type : "normal";
			this.addToSquares(wallDesc, "wall", this.rectBounds(wallDesc));
	   }

		for (var holeIndex in holes) {
			var holeDesc = holes[holeIndex];
			if (!holeDesc.center || !holeDesc.radius) { console.log("INVALID HOLE"); continue; }
			holeDesc.type = (!!holeDesc.type) ? holeDesc.type : "deathtrap";
			this.addToSquares(holeDesc, "hole", this.holeBounds(holeDesc));
	   }	

		for (var areaIndex in areas) {
			var areaDesc = areas[areaIndex];
			if (!areaDesc.pos || !areaDesc.dim) { console.log("INVALID AREA"); continue; }
			areaDesc.type = (!!areaDesc.type) ? areaDesc.type : "normal";
			this.addToSquares(areaDesc, "area", this.rectBounds(areaDesc));
	   }	
 
 
	},

	{
	
    /// <summary>
    ///     Add a game object to grid squares on which is should reside
    /// </summary>
    /// <param name="obj">
    ///     Object
    /// </param>
    /// <param name="objTypeName">
    ///     Name of object type
    /// </param>
    /// <param name="bounds">
    ///     An object {left:left, right:right, top:top, bottom:bottom} of the left, right, top and bottom edges of the bounding rectangle of the object
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	addToSquares: function(obj, objTypeName, bounds) {
		this.gameObjects.push(obj);
		obj.objectType = objTypeName;
		var objHandle = this.gameObjects.length - 1; //get the index of the wall in the wall list


		for (var i = bounds.left; i <= bounds.right; i++) {
			for (var j = bounds.top; j <= bounds.bottom; j++) {
				var sqObj=this.getSquareDesc([i,j])
				if (sqObj) 
					sqObj.objects.push(objHandle);

			}
		}
	},
	
    /// <summary>
    ///     Get the rectangle bounds of a wall or area
    /// </summary>
    /// <param name="desc">
    ///     The object descriptor, containing the attributes pos (top left corner) and dim (size)
    /// </param>
    /// <returns>
    ///     An object {left: left, right: right, top: top, bottom: bottom}
    /// </returns>
	rectBounds : function(desc) {
		return {
		 left : Math.floor(desc.pos[0]/SQUARE_SIZE[0]),
		 right : Math.floor((desc.pos[0]+desc.dim[0])/SQUARE_SIZE[0]),
		 top : Math.floor(desc.pos[1] / SQUARE_SIZE[1]),
		 bottom : Math.floor((desc.pos[1]+desc.dim[1])/SQUARE_SIZE[1])};

	},

	/// <summary>
    ///     Get the bounding rectangle of a hole
    /// </summary>
    /// <param name="holeDesc">
    ///     The object descriptor, containing the attributes center and radius
    /// </param>
    /// <returns>
    ///     An object {left: left, right: right, top: top, bottom: bottom}
    /// </returns>
	holeBounds: function (holeDesc) {
		return {
			left : Math.floor((holeDesc.center[0]-holeDesc.radius)/SQUARE_SIZE[0]),
			right : Math.floor((holeDesc.center[0] + holeDesc.radius) /SQUARE_SIZE[0]),
			top : Math.floor((holeDesc.center[1] - holeDesc.radius) / SQUARE_SIZE[1]),
			bottom : Math.floor((holeDesc.center[1] + holeDesc.radius) / SQUARE_SIZE[1])
			};
		
	},

    /// <summary>
    ///     Get the descriptor object for a square
    /// </summary>
    /// <param name="sq">
    ///     A tuple [x,y] containing the number of a square
    /// </param>
    /// <returns>
    ///     An square descriptor object
    /// </returns>
	getSquareDesc: function(sq)
	{
		if (sq[0] > NUMBER_SQUARES[0] || sq[0] < 0 || sq[1] > NUMBER_SQUARES[1] || sq[1] < 0) return null;
		return this.grid[sq[0]][sq[1]];
	},

    /// <summary>
    ///     Get the list of objects on a given square
    /// </summary>
    /// <param name="sq">
    ///     A tuple [x,y] containing the number of a square
    /// </param>
    /// <returns>
    ///     A list of objects
    /// </returns>
	getObjects: function (sq)
	{
		var sqObj = this.getSquareDesc(sq);
		if (sqObj === null) return [];
		return sqObj.objects;
	},


	/// <summary>
    ///     Get a tuple [pos, dim] corresponding to the game-coordinate of the collision grid square
    /// </summary>
    /// <param name="sq">
    ///     A tuple [x,y] containing the number of a square
    /// </param>
    /// <returns>
    ///     A tuple [pos,dim]
    /// </returns>
	getSquare: function(sq)
	{
		return [vectorMult(sq, SQUARE_SIZE), SQUARE_SIZE];
	},
	
    /// <summary>
    ///     Get the center point of a square
    /// </summary>
    /// <param name="sq">
    ///     A tuple [x,y] containing the number of a square
    /// </param>
    /// <returns>
    ///     The center point of the square as an [x,y] tuple
    /// </returns>
	getCenter: function(sq) {
		var screenSq = this.getSquare(sq);
		return vectorAdd(screenSq[0], vectorScale(screenSq[1], 0.5));
	},

    /// <summary>
    ///     Get the spawn point
    /// </summary>
    /// <returns>
    ///     The spawn point as an [x,y] tuple.
    /// </returns>
	getSpawnPoint: function() {
		return this.spawnPoint;
	},
    
    /// <summary>
    ///     Given a point, return the collision-grid square that contains it
    /// </summary>
    /// <param name="pos">
    ///     A tuple [x,y] corresponding to a point in game coordinates
    /// </param>
    /// <returns>
    ///     A tuple [x,y] that corresponds to a grid squre.
    /// </returns>
	squareFromPosition: function (pos) {
			return [Math.floor(pos[0] / SQUARE_SIZE[0]), Math.floor(pos[1] / SQUARE_SIZE[1])];
	},

    /// <summary>
    ///     Given an "object handle" (a number corresponding to that object), return the object.
    /// </summary>
    /// <param name="handle">
    ///     A number corresponding to the game object
    /// </param>
    /// <returns>
    ///     An actual game object
    /// </returns>
	getObjectFromHandle: function(handle) {
		return this.gameObjects[handle];
	},

    /// <summary>
    ///     Get a list of all objects in the game
    /// </summary>
    /// <returns>
    ///     A list of all objects in the game
    /// </returns>
	getAllObjects: function() {
		return this.gameObjects;
	}


});