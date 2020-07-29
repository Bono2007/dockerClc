var CLC = (function(clc) {
clc.arScriptEnAttente = [];
clc.arRequeteEnAttente = [];
clc.arScriptCharge = []; //Will hold all loaded files

// clc.lazyloadScript basé sur jQuery Lazy Script Loading Plugin

clc.lazyloadScript = function(filename,callback_func,callback_already_loaded) {
    //Check if the file is already loaded
    var index = -1;
    for (var i = 0; i < clc.arScriptCharge.length; i++ ) {
        if (filename == clc.arScriptCharge[i])
            index = i;
    }
    
    if (index > -1) {
        //le script a deja ete charge
        if((callback_already_loaded) && (typeof callback_already_loaded == 'function')) {
            callback_already_loaded.call(this);
            return false;
        }
    }
    else  {			
        //le script n'est pas encore chargee
        //on verifie qu'il n'y ait pas un script en attente
        index = -1;
        for (var j = 0; i < clc.arScriptEnAttente.length; j++ ) {
            if (filename == clc.arScriptEnAttente[j])
                index = j;
        }
        if(index > -1) {
            //il y a un script du meme nom en attente on appelle callback quand il est charge
            var req = clc.arRequeteEnAttente[index];
            req.done(function(data){
                clc.arScriptCharge.push(filename);
                clc.arScriptEnAttente.splice(index,1);
                clc.arRequeteEnAttente.splice(index,1);
                callback_already_loaded.call(this,data);
            });
        } else {
            ///il n'y a pas de script du meme nom en attente
            if((callback_func) && (typeof callback_func == 'function')) {
                //la fonction de callback est definie
                var reqScript = jQuery.ajax({
                    url: filename,
                    dataType: "script",
                    cache:false
                });
                clc.arScriptEnAttente.push(filename);
                clc.arRequeteEnAttente.push(reqScript);
                reqScript.done(function(data){
                    clc.arScriptCharge.push(filename);
                    var index = -1;
                    for (var i = 0; i < clc.arScriptEnAttente.length; i++ ) {
                        if (filename == clc.arScriptEnAttente[i])
                            index = i;
                    }
                    clc.arScriptEnAttente.splice(index,1);
                    callback_func.call(this,data);
                });
            }
            else {
                //la fonction de callback n'est pas definie
                jQuery.ajax({
                    url: filename,
                    dataType: "script",
                    cache:false,
                    success: function() {
                        clc.arScriptCharge.push(filename);
                    }
                });
            } 
        }
    }
    return false;			
};
//
clc.loadExo = function(cheminExo,exoOptions) {
    var indice = cheminExo.lastIndexOf("/");
    var exoFolderPath = cheminExo.substring(0,indice);
    var exoName = cheminExo.substring(indice+1);
    var deferred = $.Deferred();
    clc.lazyloadScript(cheminExo+"/"+exoName+'.js',
        function(){
            var exo = CLC[exoName](exoOptions,exoFolderPath);
            deferred.resolve(exo);
        },
        function() {
            console.log("le fichier "+exoName + ".js est déjà chargé");
            var exo = CLC[exoName](exoOptions,exoFolderPath);
            deferred.resolve(exo);
        }
    );
    return deferred;
};

// API CLC affichage d'un exo sur un site extérieur
clc.afficherExo = function(urlCalculatice,exoName,exoOptions,selecteur){
    // urlCalculatice = "https://calculatice.ac-lille.fr/calculatice/bibliotheque/javascript/exercices/"
    var cheminExo = urlCalculatice+exoName;
    exoOptions.crossdomain = true;
    exoOptions.parametrable = false;
    var reqExo = clc.loadExo(cheminExo,exoOptions);
    reqExo.done(function(exercice){
        $(selecteur).empty();
        $(selecteur).dialog({
            close:function(e){
                exercice.unload();
            },
            width:775
        });
        $(selecteur).dialog("open");
        $(selecteur).html(exercice);
    });
};

return clc;
}(CLC));

/*
 * jQuery Lazy Script Loading Plugin
 * http://www.webrevised.com/169-jquery-lazy-loading-script-on-demand-javascript-plugin/
 *
 * Copyright 2011, Charilaos Thomos
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Date: Mon Oct 31 16:10:00 2011 GMT+0200
*/