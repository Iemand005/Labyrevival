View = WinJS.Class.define(function () {
	this.renderer = new Renderer();
	this.dirty = true;
}

, {
    	init: function (model) {
			var self=this;
            this.backgroundURL = model.level.levelBackground; //hack? Maybe figure out shouldbes
			this.prepareLevelCache(model.level).then(function (){
                self.render(model);
			    });
			this.previousRenderedCenter = [0, 0];
    },

    render: function (model) {
            
            
            var fluffPosDim = calcPosDim(model.ball.center, 3*model.ball.radius);
            var fluffPos = fluffPosDim[0];
            var fluffDim = fluffPosDim[1];

            var fluffPosDimOld = calcPosDim(this.previousRenderedCenter, 3 * model.ball.radius);
            var fluffPosOld = fluffPosDimOld[0];
            var fluffDimOld = fluffPosDimOld[1];

            if (!model.blockingAnimation) {
                this.renderer.featherRadialBlit("sat", "composite", fluffPos, fluffDim);
            }
            else {
                this.dirty = true;
            }
            
            if (!model.blockingAnimation || !model.blockingAnimation.overtakeRender) {
                if (this.dirty)
                {
		            this.renderer.clearCanvas("screen");
		            this.renderer.blitCanvas("composite", "screen");
                    this.dirty = false;
                }
                else 
                {
                    
                    this.renderer.clearRect("screen", fluffPosOld, fluffDimOld);
                    this.renderer.blitRect("composite", "screen", fluffPosOld, fluffDimOld);
                    this.renderer.clearRect("screen", fluffPos, fluffDim);
                    this.renderer.blitRect("composite", "screen", fluffPos, fluffDim);
                    
                }
			    
                if (model.ball.visible) {
                    this.renderer.renderBall(model.ball.pos, model.ball.dim);
                    this.previousRenderedCenter = model.ball.center;
                }

                for (var animHandle in model.nonBlockingAnimations) {
                    model.nonBlockingAnimations[animHandle].render(this);
                }
            }

			if (model.blockingAnimation) {
				model.blockingAnimation.render(this);
			}

          


   },
    reload : function() {
        this.renderer.reload("screen", "mainGame");
        this.renderer.setBg("screen", this.backgroundURL);
        this.dirty = true;
    },
    reloadAllResources : function(model) {
        this.renderer.clearCanvas("compositeCache");
        this.renderer.reload("compositeCache", "compositeCache");
        this.renderer.blitCanvas("composite", "compositeCache");

        this.renderer.reload("composite", "compositeLevelImage");
        this.renderer.reload("sat", "satLevelImage");
        if (document.getElementById("mainGame")) this.reload();
        var self = this;
        this.dirty = true;
        this.prepareLevelCache(model.level).then(function() {
            self.renderer.blitCanvas("compositeCache", "composite");
            if (document.getElementById("mainGame")) self.render(model);
        })
        
        
    },
	prepareLevelCache: function(level)
	{
		this.renderer.clearCanvas("composite");
        if (document.getElementById("mainGame")) this.renderer.setBg("screen", this.backgroundURL);
		return this.renderer.urlImageToCanvas("sat",[0,0], VSIZE, level.levelBackgroundSat);
    }
});
	

