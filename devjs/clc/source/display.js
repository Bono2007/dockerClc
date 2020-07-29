/** @module display */
CLC = (function(clc) {
clc.display = (function() {
	var display = {};
	/**
	 *@function createTextLabel
	 *@memberOf module:display
	 */
    display.createTextLabel = function(texte) {
        var conteneur = $("<div class='text-sprite'></div>");
        conteneur.css({
            position:'absolute',
            display:'block',
            fontSize:'24px',
            width:"auto",
            height:'auto',
            webkitUserSelect:'none',
            khtmlUserSelect:'none',
            mozUserSelect:'none',
            msUserSelect:'none',
            userSelect:'none',
            cursor:'pointer',
            webkitBorderRadius:3,
            khtmlBorderRadius:3,
            mozBorderRadius:3,
            msBorderRadius:3,
            borderRadius:3
        });
        if(!texte) {
            return conteneur;
        } else {
            conteneur.html(texte);
            return conteneur;
        }
    };
	
	display.createFraction = function(texteNum,texteDenom) {
        var conteneur = $("<div class='text-sprite'></div>");
        conteneur.css({
            position:'absolute',
            display:'block',
            fontSize:'24px',
            width:"auto",
            height:'auto',
            webkitUserSelect:'none',
            khtmlUserSelect:'none',
            mozUserSelect:'none',
            msUserSelect:'none',
            userSelect:'none',
            cursor:'pointer'
        });
		var num = $("<div class='text-numerateur'></div>");
		var denom = $("<div class='text-denominateur'></div>");
		conteneur.append(num,denom);
		num.html(texteNum);
		denom.html(texteDenom);
		num.css({textAlign:"center",padding:"0px 0px 0px 0px",borderBottom:"2px solid"});
		denom.css({textAlign:"center",padding:"0px 0px 0px 0px",top:num.height()});
		
		return conteneur;
    };
    
	// retourne un input type text
	// ou une div si on est sur tablette
    display.createTextField = function (exercice,n) {
		var inputElem;
		if( exercice.tabletSupport === true ) {
			inputElem = $("<div class='text-field' tabindex=\"-1\"></div>");
			inputElem.css({
				position:'absolute',
				display:'block',
				fontFamily:'sans-serif',
				fontSize:'24px',
				lineHeight:'34px',
				textAlign:'center',
				//padding:'5px',
				width:(n*24*3/4),
				overflow:'hidden',
				height:'34px',
				//border:'1px solid #ccc',
				background:'white',
				webkitBorderRadius:3,
				khtmlBorderRadius:3,
				mozBorderRadius:3,
				msBorderRadius:3,
				borderRadius:3
			});
			inputElem.val = function() {
				if (arguments[0] !== undefined) {
					this.html(arguments[0]);
				} 
				else {
					return this.html();
				}
				
			};

			inputElem.focus = function(){
				$(".text-field").removeClass("actif");
				this.addClass("actif");
				console.log("inputElem.focus()",this);
			};

			inputElem.blur = function(){
				this.removeClass("actif");
				console.log("inputElem.blur()",this);
			};

			inputElem.on("blur",function(e){
				e.preventDefault();
				$(this).removeClass("actif");
				console.log("on blur",this);
			});
			
			inputElem.on("touchstart",function(e){
				e.preventDefault();
				inputElem.focus();
				console.log("on touchstart",inputElem);
			});
		}
		else {
			inputElem = $("<input type='text' class='text-field' />");
			inputElem.css({
				position:'absolute',
				display:'block',
				fontFamily:'sans-serif',
				fontSize:'24px',
				textAlign:'center',
				padding:'5px',
				width:n*24*3/4,
				height:'auto',
				border:'1px solid #ccc',
				webkitBorderRadius:3,
				khtmlBorderRadius:3,
				mozBorderRadius:3,
				msBorderRadius:3,
				borderRadius:3
			});
			inputElem.attr("maxlength",n);
		}
        return inputElem;
    };
	
	// retourne une div avec une image de fond
	display.createImageSprite = function (exercice,nomRessource,largeur,hauteur) {
		var image = exercice.images[nomRessource].clone();
		if(typeof arguments[2] === "number" && typeof arguments[3] === "number") {
			image.css({
				width:largeur,
				height:hauteur,
				backgroundSize:'auto'
			});
		}
		return image;
	};
	
	//retourne une div vide;
	display.createEmptySprite = function () {
		var sprite = $("<div class='ui-helper-clearfix'></div>");
		sprite.css({position:"absolute",width:'auto'});
		return sprite;
	};

	//Retourne une vidéo
	display.createVideoSprite = function(exercice,videoName){
		var video = $("<video align=center autoplay loop class='video-sprite'><source src="+exercice.getURI(videoName)+" type='video/mp4'></video>");
		return video;
	};
	
	display.createSoundSprite = function (exercice,nomRessource) {
		return exercice.sounds[nomRessource].clone(true);
	};

	display.createMovieClip = function (exercice,nomRessource,largeurFrame,hauteurFrame,mspf){
		var o = {};
		o.animId = 0;
		o.totalFrame = 0;
		o.currentFrame = 1;
		//
		o.conteneur = exercice.images[nomRessource].clone();
		o.image = o.conteneur.find("img");
		var l = o.conteneur.width();
		var h = o.conteneur.height();
		o.totalFrame = Math.floor(l/largeurFrame) + Math.floor(h/hauteurFrame);
		o.conteneur.removeClass("image-sprite");
		o.conteneur.addClass("animatable-sprite");
		o.conteneur.css({width:largeurFrame,height:hauteurFrame,overflow:"hidden"});
		o.animId  = CLC.animation.creerDemon({},avancer,mspf);
		o.play = function(){
			o.animId.start();
		};

		// methodes publiques
		o.pause = function(){
			o.animId.pause();
		};
		
		o.gotoAndPlay= function(nFrame){
			var nFL = Math.round(l/largeurFrame);
			//console.log("nFL",nFL);
			var indexFL = (nFrame % nFL) === 0 ? nFL : (nFrame % nFL);
			var indexFH = nFrame % nFL === 0 ? Math.floor(nFrame/nFL) -1 : Math.floor(nFrame/nFL);
			//console.log("indexFL",indexFL);
			//console.log("indexFH",indexFH);
			var posX = - (indexFL-1)*largeurFrame;
			var posY = - (indexFH)*hauteurFrame;
			o.image.css({left:posX,top:posY});
			o.animId.start();
		};

		o.gotoAndStop= function(nFrame){
			var nFL = Math.round(l/largeurFrame);
			//console.log("nFL",nFL);
			var indexFL = (nFrame % nFL) === 0 ? nFL : (nFrame % nFL);
			var indexFH = nFrame % nFL === 0 ? Math.floor(nFrame/nFL) -1 : Math.floor(nFrame/nFL);
			//console.log("indexFL",indexFL);
			//console.log("indexFH",indexFH);
			var posX = - (indexFL-1)*largeurFrame;
			var posY = - (indexFH)*hauteurFrame;
			console.log("posY",posY);
			o.image.css({left:posX,top:posY});
			o.currentFrame = nFrame;
			o.conteneur.trigger("enterframe");
		};

		o.nextFrame = function(){
			avancer();
		};

		o.prevFrame = function(){
			reculer();
		};

		o.playFromTo = function(from,to){
			o.conteneur.on("enterframe",{to:to},arreterA);
			o.gotoAndPlay(from);
		};


		// private
		function avancer(){
			var posX = o.image.position().left;
			var posY = o.image.position().top;
			if(posX > -(l-largeurFrame)) {
				o.image.css({left:posX-largeurFrame});
			} else {
				if(posY > -(h-hauteurFrame)){
					o.image.css({left:0,top:posY-hauteurFrame});
				}
				else {
					o.image.css({left:0,top:0});
				}
			}
			posX = o.image.position().left;
			posY = o.image.position().top;
			o.currentFrame = Math.abs(Math.round(posX/largeurFrame)) + Math.abs(Math.round(posY/hauteurFrame))*(Math.round(l/largeurFrame))+1;
			o.conteneur.trigger("enterframe");
		}

		function reculer(){
			var posX = o.image.position().left;
			var posY = o.image.position().top;
			if(posX < 0) {
				o.image.css({left:posX+largeurFrame});
			} else {
				if(posY < 0){
					o.image.css({left:-(l-largeurFrame),top:posY+hauteurFrame});
				}
				else {
					o.image.css({left:-(l-largeurFrame),top:-(h-hauteurFrame)});
				}
			}
			posX = o.image.position().left;
			posY = o.image.position().top;
			o.currentFrame = Math.abs(Math.round(posX/largeurFrame)) + Math.abs(Math.round(posY/hauteurFrame))*(Math.round(l/largeurFrame))+1;
			o.conteneur.trigger("enterframe");
		}

		function arreterA(e){
			if(o.currentFrame == e.data.to){
				o.pause();
				o.conteneur.off("enterframe",arreterA);
			}
		}


		return o;
	};
	
	
    // methode retournant un controle option ( de type text radio ou checkbox)
	display.createOptControl = function (exercice,oParam) {
		//return exercice.createOptControl(options);
		if (oParam.type == "text") {
			control = createTextInput(exercice,oParam);
		} else if (oParam.type == "radio") {
			control = createRadioInput(exercice,oParam);
		} else if (oParam.type == "checkbox") {
			control = createCheckboxInput(exercice,oParam);
		} 
		return control;
	};
	
	// methode retournant un conteneur pour des controles options
	// les controle options qui sont insérés dans ce conteneur
	// prennent automatiquement la propriete css float:left
	display.createOptConteneur = function(){
		var conteneur = $("<div class='clc-opt-conteneur ui-helper-clearfix'></div>");
		conteneur.css({width:'100%'});
		return conteneur;
	};
	
	
	//Retourne une div formatée pour afficher une correction
	display.createCorrectionLabel = function (texte) {
		var correction = display.createTextLabel(texte);
		correction.css({
			fontWeight:'bold',
			backgroundColor:"#237F00",
			color:"#fff",
			padding:5,
			border:'1px solid #237F00'
		});
		return correction;
	};
	
	// cree une rature qui barre champReponse
	display.drawBar = function (champReponse) {
		var largeur = champReponse.width();
		var hauteur = champReponse.height();
		var canvas = $("<canvas></canvas>").attr({width:largeur,height:hauteur+5});
		canvas.css({position:'absolute'});
		var ctx = canvas[0].getContext("2d");
		ctx.strokeStyle = "red";
		ctx.lineCap = 'round';
		ctx.lineWidth = 5;
		ctx.globalAlpha = 0.5;
		ctx.beginPath();
		ctx.moveTo(5,5);
		ctx.lineTo(largeur-5,hauteur);
		ctx.stroke();
		canvas.css({
			left:champReponse.position().left+5,
			top:champReponse.position().top+5
		});
		return canvas;
	};
	
	// détection de collision retourne true si jqObjA et jqObjB se recoupent
	// 
	display.hitTestObject = function(jqObjA,jqObjB,options){
		if(!options)
			options='touch';
		
		var bounds = jqObjA.offset();
		bounds.right = bounds.left + jqObjA.outerWidth();
		bounds.bottom = bounds.top + jqObjA.outerHeight();
	 
		var compare = jqObjB.offset();
		compare.right = compare.left + jqObjB.outerWidth();
		compare.bottom = compare.top + jqObjB.outerHeight();
		
		if (options == 'touch') {
			return (!(compare.right < bounds.left ||
			compare.left > bounds.right ||
			compare.bottom < bounds.top ||
			compare.top > bounds.bottom));
		} else if (options == 'fit') {
			return (!(compare.left < bounds.left||
			compare.right > bounds.right ||
			compare.top < bounds.top ||
			compare.bottom > bounds.bottom));
		} else {
			return false;
		}
	};
	
	/* ****************************************
		Affichage d'éléments SVG avaec Raphaeljs
	****************************************** */
	
	//retourne un element jQUery dont la propriete paper
	// est un element raphael de type "paper" 
	display.createSvgContainer = function(largeur,hauteur){
		var conteneur = $("<div></div>");
		conteneur.css({position:"absolute",width:largeur,height:hauteur});
		conteneur.paper = Raphael(conteneur[0],largeur,hauteur);
		return conteneur;
	};
	
	
	display.createRaphSet = function (exercice,nomRessource,raphaelPaper) {
		var svgDoc = exercice.images[nomRessource];
		var nodeList = $(svgDoc).find("svg").children();
		var set = raphaelPaper.set();
		
		nodeList.each(function(index,node){
			var raphElement;
			if(node.nodeName == "path"){
				raphElement = createRaphPath(node,raphaelPaper);
			}
			else if (node.nodeName == "ellipse"){
				raphElement = createRaphEllipse(node,raphaelPaper);
			}
			else if (node.nodeName == "circle"){
				raphElement = createRaphCircle(node,raphaelPaper);
			}
			else if (node.nodeName == "rect"){
				raphElement = createRaphRect(node,raphaelPaper);
			}
			else if (node.nodeName == "polygon"){
				raphElement = createRaphPolygon(node,raphaelPaper);
			}
			else if (node.nodeName == "polyline" || node.nodeName == "line"){
				raphElement = createRaphPolyline(node,raphaelPaper);
			}
			if ( raphElement !== 'undefined' && raphElement.attr("fill") !== 'undefined' && raphElement.attr("fill").substr(0,3) == "url"
				)
			{
				var gradId = raphElement.attr("fill").substring(5,raphElement.attr("fill").length-1);
				ajouterDegrade(raphElement,gradId,svgDoc);
			}
			set.push(raphElement);
		});
		return set;
	};
	
	
	/* ****************************************
		Affichage d'éléments SVG avaec svg.js
	****************************************** */
	
	display.createSvgJsContainer = function(largeur,hauteur){
		var conteneur = $("<div></div>");
		conteneur.css({position:"absolute",width:largeur,height:hauteur});
		conteneur.paper = SVG(conteneur[0]).size(largeur, hauteur);
		return conteneur;
	};
	
	
	
	// private
	
	function createTextInput(exercice,oParam){
		var container = $("<div class='clc-opt-control'></div>");
		var id = genUid();
		var label = $("<label class='clc-opt-label' for='"+id+"'>"+oParam.texte+"</label>");
		
		var input = $("<input class='clc-opt-input' id='"+id+"' name='"+oParam.nom+"' value='"+exercice.options[oParam.nom]+"' />");
		
		if(!oParam.largeur) {
			input.css({width:'auto'});
		} else {
			input.css({width:oParam.largeur});
		}
		if(!oParam.taille) {
			input.removeAttr("maxlength");
		} else {
			input.attr("maxlength",oParam.taille);
		}
		container.append(label,input);
		if(oParam.texteApres){
			var labelApres = $("<label class='clc-opt-label' for='"+id+"'>"+oParam.texteApres+"</label>");
			container.append(labelApres);
		}
		return container;
	}
	
	function createRadioInput(exercice,oParam) {
		console.log(oParam );
		var container = $("<div class='clc-opt-control'></div>");
		var label = $("<span class='clc-opt-label' >"+oParam.texte+"</span>");
		var inputContainer = $("<span class='clc-input-container'></span>");
		container.append(label,inputContainer);
		for(var i=0;i < oParam.aValeur.length;i++) {
			var id = genUid();
			var checked;
			if(oParam.aValeur[i] == exercice.options[oParam.nom]) {
				checked = "checked";
			} else {
				checked = "";
			}
			var radioInput = $("<label class='clc-radio-label' for='"+id+"' ><input type='radio' name='"+oParam.nom+"' id='"+id+"' "+checked+" value='"+oParam.aValeur[i]+"' />&nbsp;"+oParam.aLabel[i]+"</label>");
			inputContainer.append(radioInput);
		}
		return container;
	}
	
	function createCheckboxInput(exercice,oParam) {
		var container = $("<div class='clc-opt-control'></div>");
		var label = $("<span class='clc-opt-label' >"+oParam.texte+"</span>");
		var inputContainer = $("<span class='clc-input-container'></span>");
		container.append(label,inputContainer);
		for(var i=0;i < oParam.aValeur.length;i++) {
			var id = genUid();
			var checked;
			if($.inArray(oParam.aValeur[i], exercice.options[oParam.nom]) > -1) {
				checked = "checked";
			} else {
				checked = "";
			}
			var checkboxInput = $("<label class='clc-checkbox-label' for='"+id+"' ><input type='checkbox' name='"+oParam.nom+"' id='"+id+"' "+checked+" value='"+oParam.aValeur[i]+"' />&nbsp;"+oParam.aLabel[i]+"</label>");
			inputContainer.append(checkboxInput);
		}
		
		return container;
	}
	
	function genUid(){
		var uid = [];
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		for (var i=0;i<10;i++) {
			var index = 0 + Math.floor(Math.random()*(chars.length-1-0+1));
			uid[i] = chars[index];
		}
		return uid.join('');
	}
	
	function createRaphPath(svgElt,paper) {
		var rElt = paper.path(svgElt.attributes.d.value.trim());
		$.each(svgElt.attributes,function(i,attrib){
			if(attrib.name != "d") {
				rElt.attr(attrib.name,attrib.value);
			}
		});
		return rElt;
	}
	
	function createRaphEllipse(svgElt,paper) {
		var rElt = paper.ellipse(
				svgElt.attributes.cx.value,
				svgElt.attributes.cy.value,
				svgElt.attributes.rx.value,
				svgElt.attributes.ry.value
			);
		$.each(svgElt.attributes,function(i,attrib){
			if(attrib.name != "cx" && attrib.name != "cy" && attrib.name != "rx" && attrib.name != "ry" )
			{
				rElt.attr(attrib.name,attrib.value);
			}
		});
		
		if(!svgElt.attributes.fill){
			rElt.attr("fill","#000");
		}
		if(!svgElt.attributes.stroke){
			rElt.attr("stroke","#000");
		}
		return rElt;
	}
	
	function createRaphCircle(svgElt,paper) {
		rElt = paper.circle(
				svgElt.attributes.cx.value,
				svgElt.attributes.cy.value,
				svgElt.attributes.r.value
		);
		$.each(svgElt.attributes,function(i,attrib){
				if(attrib.name != "cx" && attrib.name != "cy" && attrib.name != "r")
				{
					rElt.attr(attrib.name,attrib.value);
				}
		});
		return rElt;
	}
	
	function createRaphRect(svgElt,paper) {
		var x = svgElt.attributes.x || {value:0};
		var y = svgElt.attributes.y || {value:0};
		var rElt = paper.rect(
			x.value,
			y.value,
			svgElt.attributes.width.value,
			svgElt.attributes.height.value
		);
		$.each(svgElt.attributes,function(i,attrib){
			if(attrib.name != "x" && attrib.name != "y" && attrib.name != "with" && attrib.name != "height")
			{
				rElt.attr(attrib.name,attrib.value);
			}
		});
		//gestion du degradé
		
		return rElt;
	}
	
	function createRaphPolygon(svgElt,paper) {
		var aPoint = svgElt.attributes.points.value.replace(/ */," ").trim().split(" ");
		var sPath="M"+aPoint[0];
		for( var i = 1 ; i < aPoint.length ; i++ ){
			sPath+="L"+aPoint[i];
		}
		sPath+="L"+aPoint[0];
		var rElt = paper.path(sPath);
		$.each(svgElt.attributes,function(i,attrib){
			if(attrib.name != "points" )
			{
				rElt.attr(attrib.name,attrib.value);
			}
		});
		return rElt;
	}
	
	function ajouterDegrade(targetElt,gradId,svgDoc) {
		//code
		
		console.log(gradId);
		console.log(svgDoc.getElementById(gradId));
		var node = svgDoc.getElementById(gradId);
		if (node.nodeName == "linearGradient") {
				console.log("dégradé linéaire");
				var sFill = "";
				var x1 = node.attributes.x1.value;
				var y1 = node.attributes.y1.value;
				var x2 = node.attributes.x2.value;
				var y2 = node.attributes.y2.value;
				var angle = Raphael.angle(x2,y2,x1,y1);
				
				var couleurDebut = $(node).children("stop")[0].style["stop-color"];
				var couleurFin = $(node).children("stop")[$(node).children("stop").length-1].style["stop-color"];
				console.log(couleurDebut,couleurFin);
				
				sFill += angle;
				$(node).children("stop").each(function(index,stop){
						sFill+="-"+stop.style["stop-color"]+":"+(stop.attributes.offset.value*100);
				});
				
				targetElt.attr("fill",sFill);
		}
	}
	
	return display;
}());
return clc;
}(CLC));