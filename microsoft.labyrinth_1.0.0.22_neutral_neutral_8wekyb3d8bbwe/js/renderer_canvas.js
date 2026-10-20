//debugger;

/// <summary>
///     Round in a deterministic way that allows for smooth rendering
/// </summary>
/// <param name="num">
///     A number
/// </param>
/// <returns>
///     The number, rounded (approximately) to the nearest integer)
/// </returns>
function unfairRound(num) {
    var floor = Math.floor(num);
    if (num - floor < 0.499) return floor;
    else return floor+1;
}

globalImageCache = {}


Screen = WinJS.Class.define( function (display) {
	if (typeof (display) === "string") {
         this.elementdisp = document.getElementById(display);
    }
	else { 
        this.elementdisp = display;
    }
	this.ctxdisp = this.elementdisp.getContext("2d");
	
	this.getHardwareCharacteristics();

}

,{
    /// <summary>
    ///     Change a vector in game coordinates to one in screen coordinates
    /// </summary>
    /// <param name="vector">
    ///     A vector (in game coordinates)
    /// </param>
    /// <returns>
    ///     The same vector in screen coordinates
    /// </returns>
	worldToScreen: function (vector) {
		return vectorMult(vector, this.hardwareScale);
	},
    
    /// <summary>
    ///     Change the screen's underlying canvas's DOM background
    /// </summary>
    /// <param name="backgroundURL">
    ///     A URL of an image
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    setBg : function(backgroundURL) {
        this.elementdisp.style.backgroundImage = "url(" + backgroundURL + ")";
        this.elementdisp.style.backgroundSize = "100% 100%";
    },
    
    /// <summary>
    ///     Store the canvas's DOM characteristics in the screen object, and adjust some of them
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
	getHardwareCharacteristics : function() {
        var qualityMode = gameStateManager.getQualityMode();


		var parent = this.elementdisp.parentElement;
		var displayHeight = parent.offsetHeight;
		var displayWidth = parent.offsetWidth;

        if (qualityMode == 1) {
            this.hardwareWidth = HWIDTH_HIQ;
            this.hardwareHeight = HHEIGHT_HIQ;
        }
        else {
            this.hardwareWidth = HWIDTH_LOQ;
            this.hardwareHeight = HHEIGHT_LOQ;
        }
		//Adjust width/height aspect ratio
		if (displayHeight < displayWidth * VHEIGHT / VWIDTH) displayWidth = unfairRound(displayHeight * VWIDTH / VHEIGHT);
		else displayHeight = unfairRound(displayWidth * VHEIGHT / VWIDTH);

		this.hardwareScale = [this.hardwareWidth / VWIDTH, this.hardwareHeight / VHEIGHT];
		this.elementdisp.height = this.hardwareHeight;
		this.elementdisp.width = this.hardwareWidth;

        this.elementdisp.style.height = displayHeight + "px";
        this.elementdisp.style.width = displayWidth + "px";

	},

    /// <summary>
    ///     Render an object to the screen.
    /// </summary>
    /// <param name="img">
    ///     Image object
    /// </param>
    /// <param name="pos">
    ///     Position (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size (game coordinates)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	render: function (img, pos, dim) {
		hpos = this.worldToScreen(pos);
		hdim = this.worldToScreen(dim);
		this.ctxdisp.drawImage(img, hpos[0], hpos[1], hdim[0], hdim[1]);
	},

    /// <summary>
    ///     Render an object to the screen. (round the resulting pixel coordinates)
    /// </summary>
    /// <param name="img">
    ///     Image object
    /// </param>
    /// <param name="pos">
    ///     Position (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size (game coordinates)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	renderWithRounding: function (img, pos, dim) {
		hpos = this.worldToScreen(pos);
		hdim = this.worldToScreen(dim);
		this.ctxdisp.drawImage(img, unfairRound(hpos[0]), unfairRound(hpos[1]), unfairRound(hdim[0]), unfairRound(hdim[1]));
	},

	/// <summary>
    ///     Render an image from a URL.
    /// </summary>
    /// <param name="url">
    ///     Image URL
    /// </param>
    /// <param name="pos">
    ///     Position (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size (game coordinates)
    /// </param>
    /// <returns>
    ///     A promise that executes once the image renders.
    /// </returns>
	renderFromUrl: function (url, pos, dim) {
        var self = this; 
        return new WinJS.Promise( function(c,e,p) {
		        if (!globalImageCache[url]) {
			        globalImageCache[url] = new Image();
			        globalImageCache[url].src = url;
		        }

		        if(!globalImageCache[url].complete) { 
			        globalImageCache[url].addEventListener("load", function () { self.render(globalImageCache[url], pos, dim); if (c) c(); }, false);
                    globalImageCache[url].addEventListener("error", function () { console.log("IMAGE COULD NOT BE LOADED"); if (e) e(); }, false);
		        }
		        else {
			        self.render(globalImageCache[url], pos, dim);
			        if (c) c();
		        }
            })
	
	},

    
    /// <summary>
    ///     Color a rectangular portion of the screen a solid color
    /// </summary>
    /// <param name="pos">
    ///     Position (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size (game coordinates)
    /// </param>
    /// <param name="color">
    ///     Any CSS color.
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	color: function (pos, dim, color) 
	{
		var hpos = this.worldToScreen(pos);
		var hdim = this.worldToScreen(dim);

		this.ctxdisp.save();
		this.ctxdisp.fillStyle = color;
		this.ctxdisp.fillRect(unfairRound(hpos[0]), unfairRound(hpos[1]), unfairRound(hdim[0]), unfairRound(hdim[1]));
		this.ctxdisp.restore();
	},

    /// <summary>
    ///     Clear the screen
    /// </summary>  
    /// <returns>
    ///     Nothing.
    /// </returns>
	clear: function () {
		this.ctxdisp.clearRect(0, 0, this.hardwareWidth, this.hardwareWidth);
	},

    /// <summary>
    ///     Clear a rectangular part of the screen
    /// </summary>
    /// <param name="pos">
    ///     Position of colored rectangle (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size of colored rectangle (game coordinates)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	clearRect: function (pos, dim) {
		var hpos = this.worldToScreen(pos);
		var hdim = this.worldToScreen(dim);
		this.ctxdisp.clearRect(unfairRound(hpos[0]), unfairRound(hpos[1]), unfairRound(hdim[0]), unfairRound(hdim[1]));
	},

    /// <summary>
    ///     Copy another screen onto this one
    /// </summary>
    /// <param name="otherscren">
    ///     Other screen object
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	blit: function (otherscreen) {
		this.ctxdisp.drawImage(otherscreen.elementdisp, 0, 0, this.hardwareWidth, this.hardwareHeight);
	},

    /// <summary>
    ///     Clear a rectangular part of the screen
    /// </summary>
    /// <param name="pos">
    ///     Position of copied rectangle (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size of copied rectangle (game coordinates)
    /// </param>
    /// <param name="otherscren">
    ///     Other screen object
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
	blitRect: function (otherscreen, pos, dim) {
		var hposSelf = this.worldToScreen(pos);
		var hdimSelf = this.worldToScreen(dim);
        this.coerceRect(hposSelf,hdimSelf);
        
        var hposOther = otherscreen.worldToScreen(pos);
		var hdimOther = otherscreen.worldToScreen(dim);
        this.coerceRect(hposOther,hdimOther);

        if (hdimSelf[0] == 0 || hdimSelf[1] == 0 || hdimOther[0] == 0 || hdimOther[1] == 0) return; //HACK
		this.ctxdisp.drawImage(otherscreen.elementdisp, unfairRound(hposOther[0]), unfairRound(hposOther[1]), unfairRound(hdimOther[0]), unfairRound(hdimOther[1]), 
                            unfairRound(hposSelf[0]), unfairRound(hposSelf[1]), unfairRound(hdimSelf[0]), unfairRound(hdimSelf[1]));
	},

    /// <summary>
    ///     Set a rectangle as the clipping region for the canvas
    /// </summary>
    /// <param name="pos">
    ///     Position of clipped rectangle (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size of clipped rectangle (game coordinates)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    clipRect : function(pos, dim)
    {
        var hpos = this.worldToScreen(pos);
		var hdim = this.worldToScreen(dim);

        this.ctxdisp.save();
        this.ctxdisp.beginPath();
        this.ctxdisp.rect(unfairRound(hpos[0]), unfairRound(hpos[1]), unfairRound(hdim[0]), unfairRound(hdim[1]));
        this.ctxdisp.clip()
    },

    /// <summary>
    ///     Reset the clipping region
    /// </summary>
    /// <returns>
    ///     Nothing
    /// </returns>
    unclip : function() {
        this.ctxdisp.restore();
    },

    /// <summary>
    ///     Coerce a rectangle in virtual coordinates into one the can be rendered without giving me an INDEX_SIZE_ERR
    /// </summary>
    /// <param name="pos">
    ///     Position of rectangle (game coordinates)
    /// </param>
    /// <param name="dim">
    ///     Size of rectangle (game coordinates)
    /// </param>
    /// <returns>
    ///     Another rectangle that does not exist the screen bounds to the negative but has the same bounds otherwise
    /// </returns>
    coerceRect: function(pos, dim)
    {
           if (pos[0] < 0) {
               dim[0] = dim[0] + pos[0];
               pos[0] = 0;
            }

           if (pos[1] < 0) {
               dim[1] = dim[1] + pos[1];
               pos[1] = 0;
            }   
    },


    /// <summary>
    ///     Render text to the screen
    /// </summary>
    /// <param name="text">
    ///     The text
    /// </param>
    /// <param name="pos">
    ///     Text position (game coordinates)
    /// </param>
    /// <param name="size">
    ///     Text size (game coordinates)
    /// </param>
     /// <param name="color">
    ///     Text color (CSS color)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>
    renderText : function (text, pos, size, color) {
        hpos = this.worldToScreen(pos);
        this.ctxdisp.save();
        this.ctxdisp.fillStyle = color;
        this.ctxdisp.font = size * this.hardwareScale[0] + "px \"Segoe UI\"";
        this.ctxdisp.fillText("" + text, hpos[0], hpos[1]);
        this.ctxdisp.restore();
    },

    /// <summary>
    ///     Switch the canvas's global composite operation
    /// </summary>
     /// <param name="opearation">
    ///     A global composite operation (look up the globalCompositeOperation property of the CanvasRenderingContext2D object for more details)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>    
    switchGlobalComposite: function(operation) {
        this.ctxdisp.globalCompositeOperation = operation;
    },

    /// <summary>
    ///     Switch the canvas's global alpha
    /// </summary>
     /// <param name="alpha">
    ///     A number between 0 and 1 representing the canvas's alpha (see CanvasRenderingContext2D.globalAlpha for more details)
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>  
    setGlobalAlpha: function(alpha) {
        this.ctxdisp.globalAlpha = alpha;
    },

    save: function() { this.ctxdisp.save(); },
    restore: function() { this.ctxdisp.restore(); }
});




Renderer = WinJS.Class.define( function ()
{		
        this.canvases = {
            "screen" : new Screen("mainGame"),
            "sat" : new Screen("satLevelImage"),
            "composite" : new Screen("compositeLevelImage"),
            "compositeCache" : new Screen("compositeCache")
        }
        

        this.images = { "ball" : document.getElementById("ballimage"),
        "winglow": document.getElementById("winglowimage"),
        "glowball": document.getElementById("glowball"),
            "brush" : document.getElementById("brush"),
		}
},

{
    
    /// <summary>
    ///     Reload a canvas's Screen object
    /// </summary>
    /// <param name="name">
    ///     Name used to refer to the canvas from outside the renderer
    /// </param>
    /// <param name="domname">
    ///     ID of DOM elemet
    /// </param>
    /// <returns>
    ///     Nothing
    /// </returns>  
    reload : function(name, domname) {
        this.canvases[name] = new Screen(domname);
    },

    /// <summary>
    ///     Render an image from a URL onto a canvas
    /// </summary>
    /// <param name="name">
    ///     Name used to refer to the canvas from outside the renderer
    /// </param>
    /// <param name="pos">
    ///     Position of rendered object
    /// </param>
    /// <param name="dim">
    ///     Size of rendered object
    /// </param>
    /// <param name="URL">
    ///     Image URL
    /// </param>
    /// <returns>
    ///     A promise that executes when the image finishes rendering
    /// </returns>  
	urlImageToCanvas : function (name, pos, dim, URL)
	{
		if (URL) {
			return this.canvases[name].renderFromUrl(URL, pos, dim);
		}
        else {
            return new WinJS.Promise ( function (c,e,p) { c(); } );
        }
	},

    //TRADEOFF: Only works on transparent-bg canvases now
    featherRadialBlit : function(from, to, pos, dim) {
        this.canvases[to].renderWithRounding(this.images["brush"], pos, dim);
        this.canvases[to].switchGlobalComposite("source-in");
        this.canvases[to].clipRect(pos,dim);
        this.blitRect(from, to, pos, dim);
        this.canvases[to].unclip();
        this.canvases[to].switchGlobalComposite("source-over");
    },

	clearCanvas : function (name)
	{
		this.canvases[name].clear();
	},
	
	clearRect : function (name,pos,dim)
	{
		this.canvases[name].clearRect(pos,dim);
	},

	colorRect: function (name, pos, dim, color) {
	    this.canvases[name].color(pos, dim, color);
	},

	blitCanvas: function(from, to)
	{
		this.canvases[to].blit(this.canvases[from]);
	},
	blitRect: function(from, to, pos,dim)
	{
		this.canvases[to].blitRect(this.canvases[from], pos, dim);
	},
	blitRectWithAlpha: function(from, to, pos,dim, alpha)
	{
        this.canvases[to].setGlobalAlpha(alpha);
		this.canvases[to].blitRect(this.canvases[from], pos, dim);
        this.canvases[to].setGlobalAlpha(1);
	},
    blitCircle: function(from, to, center, radius)
	{
		this.canvases[to].blitCircle(this.canvases[from], center, radius);
	},
    imageToCanvas: function (cname, iname, pos, dim)
	{
		this.canvases[cname].render(this.images[iname], pos, dim);
	},
    imageToCanvasWithAlpha: function (cname, iname, pos, dim, alpha)
	{
        this.canvases[cname].setGlobalAlpha(alpha);
		this.canvases[cname].render(this.images[iname], pos, dim);
        this.canvases[cname].setGlobalAlpha(1);
	},
	renderBall: function(pos, dim) //TODO: Should this really be here?
	{
	    var newPos = vectorSub(pos, vectorScale(dim, 0.08333));
	    var newDim = vectorScale(dim, 1.1666667);
	    this.imageToCanvas("screen", "ball", newPos, newDim);
	},
    save: function (name) { this.canvases[name].save(); },
    restore: function (name) { this.canvases[name].restore(); },
    setBg: function (name, bgURL) {
        this.canvases[name].setBg(bgURL);
    },
    setGlobalAlpha: function(name, alpha) {
        this.canvases[name].setGlobalAlpha(alpha);
    },
	
    switchGlobalComposite: function(name, operation) {
        this.canvases[name].switchGlobalComposite(operation);
    }
});