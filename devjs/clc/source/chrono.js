CLC = (function(clc) {
clc.chrono = function(sType) {
	var chrono = this;
	chrono.baseContainer = $("<canvas class='bloc-chrono' width='700' height='11'></canvas>");
	var ctx = chrono.baseContainer[0].getContext('2d');
	var largeur = 700, couleurFond="#ff0000", couleurForme="#0099cc";
	//ctx.fillStyle = couleurFond;
	//ctx.fillRect (0, 0, largeur, hauteur);
	chrono.duree = 0;
	chrono.delai = 60;//on raffraichit le chrono tous les 26 millisecondes
	chrono.count = 0;
	chrono.type = sType;
	chrono.largeur = 690;
	chrono.largeurInit = 690;
	
	// definit la duree du chrono
	chrono.set = function (millisecondes) {
		chrono.duree = millisecondes;
		chrono.pas = 0.5;
		//chrono.delai = Math.round(chrono.pas*chrono.duree/chrono.largeur);
		
	};
	//demarre le chrono
	chrono.start = function(){
		animLoop( draw );
	};
	//met le chrono en pause
	chrono.pause = function(){
		cancelAnimationFrame(chrono.intervalId);
	};
	// arrete le chrono
	chrono.stop = function(){
		cancelAnimationFrame(chrono.intervalId);
		chrono.count = 1;
		chrono.largeur = 690;
		chrono.pas = 0.5;
	};
	
	function draw(dT){
		//update
		chrono.count++;
		//if(chrono.count < 50 && dT > 0 ) console.log("dT",dT);
		if(dT>0){
			chrono.pas = dT*chrono.largeurInit/chrono.duree;
			chrono.largeur-=chrono.pas;
		}
		//clear
		ctx.clearRect (0, 0, largeur, 11);
		//draw stuff
		ctx.lineWidth = 1;
		ctx.fillStyle = couleurForme;
		var l = chrono.largeur;
		if ( l > 0 ) {
			// la ligne bleue
			ctx.strokeStyle = couleurForme;
			ctx.beginPath();
			ctx.moveTo(5, 5);
			ctx.lineTo(l, 5);
			ctx.stroke();
			// la ligne rouge
			ctx.strokeStyle = couleurFond;
			ctx.beginPath();
			ctx.moveTo(l+5, 5);
			ctx.lineTo(chrono.largeurInit+5, 5);
			ctx.stroke();
			// le disque
			ctx.beginPath();
			ctx.arc(l+5, 5, 5, 0, 2*Math.PI);
			ctx.fill();
		}
		else {
			cancelAnimationFrame(chrono.intervalId);
			chrono.baseContainer.trigger("tempsDepasse");
			chrono.count = 0;
			chrono.largeur = 690;
			ctx.clearRect (0, 0, 700, 11);
			ctx.strokeStyle = couleurFond;
			ctx.beginPath();
			ctx.moveTo(5, 5);
			ctx.lineTo(chrono.largeur, 5);
			ctx.stroke();
			return false;
			
		}
	}
	
	function animLoop( render, element ) {
		var running, lastFrame = +new Date();
		function loop( now ) {
		// stop the loop if render returned false
			if ( running !== false ) {
				chrono.intervalId = requestAnimationFrame( loop, element );
				var deltaT = now - lastFrame;
				// do not render frame when deltaT is too high
				if ( deltaT < 160 ) {
					running = render( deltaT );
				}
				lastFrame = now;
			}
		}
		loop( lastFrame );
	}

};
return clc;
}(CLC));
