/**
 *@module animation
*/
CLC = (function(clc) {
CLC.animation = (function() {
	
	if (!$.support.transition){
		$.fn.transition = $.fn.animate;
	}
	
	var anim = {};
	/**
	 *@method translate
	 *@memberOf module:animation
	 *@param elem un élément jQuery
	 *@param x {Number} coordonnées x de l'élément
	 *@param y {Number} coordonnées y de l'élément
	 *@param z {Number} coordonnées y de l'élément
	 *@param duree {Number} durée de l'animation en ms
	 *@param easing {String} le nom d'une fonction de lissage jQuery 
	 *@param callback {Function} le nom d'une fonction qui sera exécutée une fois l'animation terminée.
	 */
	anim.translate = function (elem,x,y,z,duree,easing,callback) {
		
		//detection des capacites du navigo
		var has3d,
		transforms = {
			'webkitTransform':'-webkit-transform',
			'OTransform':'-o-transform',
			'msTransform':'-ms-transform',
			'MozTransform':'-moz-transform',
			'transform':'transform'
		},
		el = elem[0];
		for(var t in transforms){
			if( el.style[t] !== undefined ){
				el.style[t] = 'translate3d(1px,1px,1px)';
				has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			}
		}
		if (has3d !== undefined && has3d.length > 0 && has3d !== "none") {
            console.log("use translate3d");
            if (x !== 0) 
                x =  x - elem.position().left;
            if (y !== 0)
                y = y - elem.position().top;
			elem.off("webkitTransitionEnd msTransitionEnd transitionend");
			elem.on("webkitTransitionEnd msTransitionEnd transitionend",callback);
            elem.css({
                WebkitTransition:'-webkit-transform '+duree+'ms '+easing,
                WebkitTransform: 'translate3d('+x+'px, '+y+'px, '+z+'px)',
				msTransition:'-ms-transform '+duree+'ms '+easing,
				msTransform: 'translate3d('+x+'px, '+y+'px, '+z+'px)',
				transition:'transform '+duree+'ms '+easing,
                transform: 'translate3d('+x+'px, '+y+'px, '+z+'px)'
            });
        } else {
            if(Modernizr.csstransitions) {
                console.log("use csstransitions");
                if(x===0)
                    x=elem.position().left;
                if(y===0)
                    y = elem.position().top;
                elem.on("transitionend",callback);
                elem.css({
                    MozTransition:'all '+duree+'ms '+easing,
                    //MozTransform: 'translateY('+y+'px)'
                }); 
                elem.css({left:x,top:y});
            }
            else {
                console.log("use animate");
                if(x===0)
                    x=elem.position().left;
                if(y===0)
                    y = elem.position().top;
                elem.animate({left:x,top:y},duree,easing,callback);
            }
        }
    };
	
	anim.translateStop = function (elem) {
		if (Modernizr.csstransforms) {
			var posX = elem.position().left;
			var posY = elem.position().top;
			elem.css({
				WebkitTransition:'-webkit-transform 0s',
				WebkitTransform: 'translate(0,0)',
				MsTransition:"-ms-transform 0s linear",
				MsTransform:'translate3d('+0+'px,'+0+'px,0)',
				MozTransition:'-moz-transform 0s linear',
				MozTransform:'translate3d('+0+'px,'+0+'px,0)',
				transition:'transform 0s linear',
				transform: 'translate3d('+0+'px,'+0+'px,0)',
			});
			elem.css({left:posX,top:posY});
			elem.off("transitionend transitionEnd oTransitionEnd webkitTransitionEnd MsTransitionEnd");	
		}
		else {
			elem.stop();
		}
    };
	
	anim.spin = function(elem,angle,duree,callback) {
	
		elem.on("webkitTransitionEnd transitionend",function(e){
			elem.off("webkitTransitionEnd transitionend");
			elem.css({
				WebkitTransition : 'none',
				MozTransition : 'none',
				WebkitTransform : 'none',
				MozTransform : 'none'
			});
			if(typeof callback === "function" ) callback(e);
		});
		
        elem.css({
            WebkitTransition : '-webkit-transform '+duree+'ms linear',
            MozTransition : '-moz-transform '+duree+'ms linear',
            WebkitTransform : 'rotate('+angle+'deg)',
            MozTransform : 'rotate('+angle+'deg)'
        });
    };
	
	anim.rotate = function(elem,angle) {
        elem.css({
            WebkitTransform : 'rotate('+angle+'deg)',
            MozTransform : 'rotate('+angle+'deg)'
        });
    };
	
	anim.glow = function (elem,couleur,epaisseur,blur) {
        if(arguments[1] == 'none') {
            elem.css({
                MozBoxShadow: 'none',
                WebkitBoxShadow: 'none',
                boxShadow: 'none'
            });
        } else {
            elem.css({
                MozBoxShadow: '0 0 ' + blur + 'px ' + epaisseur + 'px '+ couleur,
                WebkitBoxShadow: '0 0 ' + blur + 'px ' + epaisseur + 'px '+ couleur,
                boxShadow: '0 0 ' + blur + 'px ' + epaisseur + 'px '+ couleur
            });
        }
    };
	
	//Alias pour MINIDAEMON
	anim.creerDemon =  function(oContexte,fTache,nFrequence,nTotal){
		return new MiniDaemon (oContexte, fTache, nFrequence, nTotal);
	};
	
	/*\
	|*|
	|*|  MiniDaemon - Mozilla Developer Network - ver. 1.0 rev. 1
	|*|
	|*|  https://developer.mozilla.org/en-US/docs/Web/API/window.setInterval
	|*|  https://developer.mozilla.org/User:fusionchess
	|*|
	|*|  This framework is released under the GNU Public License, version 3 or later.
	|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
	|*|
	\*/
	
	// Enable the passage of the 'this' object through the JavaScript timers

	var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
	
	window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
		var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
		return __nativeST__(vCallback instanceof Function ? function () {
			vCallback.apply(oThis, aArgs);
		} : vCallback, nDelay);
	};
	
	window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
		var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
		return __nativeSI__(vCallback instanceof Function ? function () {
			vCallback.apply(oThis, aArgs);
		} : vCallback, nDelay);
	};
	 
	function MiniDaemon (oOwner, fTask, nRate, nLen) {
		if (!(this && this instanceof MiniDaemon)) { return; }
		if (arguments.length < 2) { throw new TypeError("MiniDaemon - not enough arguments"); }
		if (oOwner) { this.owner = oOwner; }
		this.task = fTask;
		if (isFinite(nRate) && nRate > 0) { this.rate = Math.floor(nRate); }
		if (nLen > 0) { this.length = Math.floor(nLen); }
	}
	 
	MiniDaemon.prototype.owner = null;
	MiniDaemon.prototype.task = null;
	MiniDaemon.prototype.rate = 100;
	MiniDaemon.prototype.length = Infinity;
	 
	/* These properties should be read-only */
	 
	MiniDaemon.prototype.SESSION = -1;
	MiniDaemon.prototype.INDEX = 0;
	MiniDaemon.prototype.PAUSED = true;
	MiniDaemon.prototype.BACKW = true;
	 
	/* Global methods */
	 
	MiniDaemon.forceCall = function (oDmn) {
		oDmn.INDEX += oDmn.BACKW ? -1 : 1;
		if (oDmn.task.call(oDmn.owner, oDmn.INDEX, oDmn.length, oDmn.BACKW) === false || oDmn.isAtEnd()) {
			oDmn.pause();
			return false;
		}
		return true;
	};
	 
	/* Instances methods */
	 
	MiniDaemon.prototype.isAtEnd = function () {
		return this.BACKW ? isFinite(this.length) && this.INDEX < 1 : this.INDEX + 1 > this.length;
	};
	 
	MiniDaemon.prototype.synchronize = function () {
		if (this.PAUSED) { return; }
		clearInterval(this.SESSION);
		this.SESSION = setInterval(MiniDaemon.forceCall, this.rate, this);
	};
	 
	MiniDaemon.prototype.pause = function () {
		clearInterval(this.SESSION);
		this.PAUSED = true;
	};
	 
	MiniDaemon.prototype.start = function (bReverse) {
		var bBackw = Boolean(bReverse);
		if (this.BACKW === bBackw && (this.isAtEnd() || !this.PAUSED)) { return; }
		this.BACKW = bBackw;
		this.PAUSED = false;
		this.synchronize();
	};
	/* FIN MINIDAEMON */

	/* POLYFILL pour requestAnimationFrame et cancelAnimationFrame */

	(function(){
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || 
			window[vendors[x]+'CancelRequestAnimationFrame'];
		}

	    if (!window.requestAnimationFrame || !cancelAnimationFrame){
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	    }	
	 
	    if (!window.cancelAnimationFrame){
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	    }

	}());
	/* FIN POLYFILL */
	return anim;
}());
return clc;
}(CLC));
