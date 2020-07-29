CLC = (function(clc) {
clc.utils = (function() {
	var utils = {};
    
	// rajoute la methode indexOf
	//Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
	
	 
	utils.indexOf = function(needle, haystack ) {  
		if (haystack === null) {  
			throw new TypeError();  
		}  
		var t = Object(haystack);  
		var len = t.length >>> 0;  
		if (len === 0) {  
			return -1;  
		}  
		var n = 0;  
		if (arguments.length > 0) {  
			n = Number(arguments[2]);  
			if (n != n) { // shortcut for verifying if it's NaN  
				n = 0;  
			} else if (n !== 0 && n != Infinity && n != -Infinity) {  
				n = (n > 0 || -1) * Math.floor(Math.abs(n));  
			}  
		}  
		if (n >= len) {  
			return -1;  
		}  
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);  
		for (; k < len; k++) {  
			if (k in t && t[k] === needle) {  
				return k;  
			}  
		}  
		return -1;  
	};
	
	
	
	utils.shuffleArray = function(o){
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};
	
	
	// return true si deux array sont égaux;
	
	utils.compareArray = function(arrayA,arrayB) {
		if (arrayA.length != arrayB.length) return false;
		for (var i = 0; i < arrayB.length; i++) {
			if (arrayA[i].compare) { 
				if (!arrayA[i].compare(arrayB[i])) return false;
			}
			if (arrayA[i] !== arrayB[i]) return false;
		}
		return true;
	};
	
	
	// retourne la position de l'array aNeedle dans l'array aHaystack ou -1 si aNeedle n'est pas dans aHaystack
	utils.find = function(aNeedle,aHaystack){
		var max = aHaystack.length;
		var index = -1;
		for (var i = 0 ; i < max ;i++ ) {
			if( utils.compareArray(aNeedle,aHaystack[i])) {
				index=i;
			}
		}
		return index;
	};
	
	//retourne un tableau de nombres à partir d'un string sOption
	//du type  "min-max" ou "n1;n2;n3;n4" ou "n" ou min,max n sont des nombes
	//utile pour parametrer des plages numeriques
	utils.getArrayNombre = function(sOption) {
		var aNombre = [];
		if (sOption.indexOf(";")>0) {
			//une serie de nombres
			aNombre = sOption.split(";");
			aNombre.forEach(function(element,index,array){array[index]=Number(element);});
		} else if (sOption.indexOf("-") > 0) {
			//une plage de nombres
			var min = Number(sOption.split("-")[0]);
			var max = Number(sOption.split("-")[1]);
			for (var j = min; j <= max; j++) {
				aNombre.push(Number(j));
			}
		} else {
			//un nombre seul
			aNombre.push(Number(sOption));
		}
		return aNombre;
	};
	
	//transforme un nombre (int ou float) en chaîne formatée selon les normes françaises (virgule et espace);
	utils.numToStr = function(n) {
        var aE=[] ; var aD=[] ; var sD="" ; var sE="";
        aE = String(n).split('.').length == 2 ? String(n).split('.')[0].split('') : String(n).split('');
        if( String(n).split('.').length == 2 ) {
			aD = String(n).split('.')[1].split('');
        }
        else {
			sD = "";
        }
        for (var i = aE.length-1 ; i >=0 ; i-- ) {
                sE = ((aE.length - i)%3 === 0 && i > 0) ? " "+aE[i]+sE : aE[i]+sE;
        }
        if ( aD.length > 0) {
            for (var j = 0 ; j < aD.length ; j++ ) {
                sD = (j%3 === 0 && j > 0) ? sD+" "+aD[j] : sD+aD[j];
            }
            sD = ","+sD;
        }
        return sE+sD;
	};
	
	//transforme une chaine formatée selon les règles françaises (virgule espace) en nombre (Numeber)
	utils.strToNum = function(sExpre){
		return Number(sExpre.split(",").join(".").replace(" ",""));
	};
	
	utils.genUid = function genUid(){
		var uid = [];
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		for (var i=0;i<10;i++) {
			var index = 0 + Math.floor(Math.random()*(chars.length-1-0+1));
			uid[i] = chars[index];
		}
		return uid.join('');
	};
	
	utils.random = function(min,max){
		return min + Math.floor(Math.random()*(max-min+1));
	};
	
	/*
		fullscreenAPI 
	*/
	
    var fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];
 
            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreenApi.supportsFullScreen = true;
 
                break;
            }
        }
    }
 
    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
 
        fullScreenApi.isFullScreen = function() {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        };
        fullScreenApi.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : el[this.prefix + 'RequestFullScreen'](Element.ALLOW_KEYBOARD_INPUT);
        };
        fullScreenApi.cancelFullScreen = function() {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        };
    }
    // export api
    window.fullScreenApi = fullScreenApi;

	
	return utils;
}());
return clc;
}(CLC));