CLC = (function(clc) {
clc.keyboard = function() {
	var keyboard = this;
	keyboard.baseContainer = $("<div class='keyboard base-container'></div>");
	//
	var zoneClavier1 = $("<div class='zone-clavier-1'></div>");//les flèches aà gauche
	var zoneClavier2 = $("<div class='zone-clavier-2'></div>");
	var zoneClavier3 = $("<div class='zone-clavier-3'></div>");
	var zoneClavier4 = $("<div class='zone-clavier-4'></div>");
	keyboard.baseContainer.append( zoneClavier1, zoneClavier2, zoneClavier3, zoneClavier4 );
	//
	var touche = $("<div class='key arrow left'></div>");
	touche.data("valeur","gauche");
	zoneClavier1.append(touche);
	touche = $("<div class='key arrow up'></div>");
	touche.data("valeur","haut");
	zoneClavier1.append(touche);
	//
	for ( var i = 0; i < 10 ; i++ ) {
		touche = $("<div class='key numeric'>"+(i+1)%10+"</div>");
		touche.data("valeur",(i+1)%10);
		zoneClavier2.append(touche);
	}
	//
	touche = $("<div class='key large'>Commencer</div>");
	touche.data("valeur","commencer");
	keyboard.enterKey = touche;
	zoneClavier3.append(touche);
	touche = $("<div class='key virg'>,</div>");
	touche.data("valeur",",");
	zoneClavier3.append(touche);
	touche = $("<div class='key medium suppr'>Suppr.</div>");
	touche.data("valeur","suppr");
	zoneClavier3.append(touche);
	//
	touche = $("<div class='key arrow right'></div>");
	touche.data("valeur","droite");
	zoneClavier4.append(touche);
	touche = $("<div class='key arrow down'></div>");
	touche.data("valeur","bas");
	zoneClavier4.append(touche);
	
	keyboard.config = function(oConfig){
		//les touches numeriques sont activees
		if (oConfig.numeric !== undefined && oConfig.numeric=="enabled" ) {
			keyboard.baseContainer.find('.key.numeric').removeClass("disabled");
			keyboard.baseContainer.find('.key.virg').removeClass("disabled");
			keyboard.baseContainer.find('.key.suppr').removeClass("disabled");
		}
		// les touches numeriques sont desactivees
		else if (oConfig.numeric !== undefined && oConfig.numeric=="disabled" ) {
			keyboard.baseContainer.find('.key.numeric').addClass("disabled");
			keyboard.baseContainer.find('.key.virg').addClass("disabled");
			keyboard.baseContainer.find('.key.suppr').addClass("disabled");
			
		}
		//la touche virgule est activee
		if (oConfig.virg !== undefined && oConfig.virg=="enabled" ) {
			keyboard.baseContainer.find('.key.virg').removeClass("disabled");
		}
		//la touche virgule est desactivee
		else if (oConfig.virg !== undefined && oConfig.virg=="disabled" ) {
			keyboard.baseContainer.find('.key.virg').addClass("disabled");
		}
		//la touche suppr est activee
		if (oConfig.suppr !== undefined && oConfig.suppr=="enabled" ) {
			keyboard.baseContainer.find('.key.suppr').removeClass("disabled");
		}
		//la touche suppr est desactivee
		else if (oConfig.suppr !== undefined && oConfig.suppr=="disabled" ) {
			keyboard.baseContainer.find('.key.suppr').addClass("disabled");
		}
		// les fleches sont activees
		if (oConfig.arrow !== undefined && oConfig.arrow=="enabled" ) {
			keyboard.baseContainer.find('.key.arrow').removeClass("disabled");
		}
		//les fleches sont desactivees
		else if (oConfig.arrow !== undefined && oConfig.arrow=="disabled" ) {
			keyboard.baseContainer.find('.key.arrow').addClass("disabled");
		}
		// la touche "large" (commencer valider ou resultats) est activee
		if (oConfig.valider !== undefined && oConfig.valider=="enabled" ) {
			keyboard.baseContainer.find('.key.large').removeClass("disabled");
		}
		// la touche "large" (comenceer valider ou resultats) est desactivee
		else if (oConfig.valider !== undefined && oConfig.large=="disabled" ) {
			keyboard.baseContainer.find('.key.large').addClass("disabled");
		}
		// la touche "large" (commencer valider ou resultats) est activee
		if (oConfig.large !== undefined && oConfig.large=="enabled" ) {
			keyboard.baseContainer.find('.key.large').removeClass("disabled");
		}
		// la touche "large" (comenceer valider ou resultats) est desactivee
		else if (oConfig.large !== undefined && oConfig.large=="disabled" ) {
			keyboard.baseContainer.find('.key.large').addClass("disabled");
		}
	};
	
	//return keyboard;
};
return clc;
}(CLC));