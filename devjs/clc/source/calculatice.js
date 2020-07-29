var CLC = (function() {
    if(!window.console){console={log:function(){},info:function(){}};}//pour ne pas avoir de pbme avec console sous IE
    var clc = {};
    clc.exoBase = function(path){
        //proprietes publiques
        var base = {};
        base.baseContainer = $("<div class='clc base-container'></div>");
        base.pageChargement = $("<div class='page chargement'></div>");
        base.pageTitre = $("<div class='page titre'></div>");
        base.blocTitre = $("<div class='bloc-titre'></div>");
        base.blocConsigneGenerale = $("<div class='bloc-consigne-generale'></div>");
        base.blocIllustration = $("<div class='bloc-illustration ui-helper-clearfix'></div>");
        base.pageQuestion = $("<div class='page question'></div>");
        base.blocAnimation = $("<div class='bloc-animation'></div>");
        base.blocInfo = $("<div class='bloc-info'><div class='contenu'></div><div class='toolbar'></div></div>");
        base.blocScore = $("<div class='bloc-score'></div>");
        base.pageResultat = $("<div class='page resultat'></div>");
        base.pageParametre = $("<div class='page parametre'></div>");
        base.blocParametre = $("<form class='bloc-parametre'><form>");
        base.btnParametrer = $("<button type='button' class='bouton parametrer' ></button>");
        base.btnCommencer = $("<button type='button' class='bouton commencer' ></button>");
        base.btnValider = $("<button type='button' class='bouton valider'></button>");
        base.btnSuite = $("<button type='button' class='bouton suite'></button>");
        base.btnRecommencer = $("<button type='button' class='bouton recommencer'></button>");
        base.btnExerciceSuivant = $("<button type='button' class='bouton exercice-suivant'></button>");
        base.btnTesterParametre = $("<button type='button' class='bouton tester-parametre'></button>");
        base.exoFolderPath = path+"/";
        base.arStringRessources = [];
        base.arRessources = [];
        base.images = {};
        base.str = {}; // les textes communs à tous les exercices
        base.txt = {}; // les textes specifiques à un exercice
        base.videos = {};
        base.aImageElt=[];
        base.sounds = {};
        base.movies = {};
        base.options={parametrable:true};
        base.tabletSupport = false;
        base.indiceQuestion = 0;
        base.indiceEssai = 0;
        base.indiceTentative = 0;
        base.score = 0;
        base.tempsDebutExo = 0;
        base.tempsFinExo = 0;
        base.dureeExo = 0;
        base.idExo = 0;
        base.numExo = 0;
        base.keyboard = {};
        base.chrono={};
        base.aTimeout = [];
        base.aInterval = [];
        base.aStage = [];
        base.aTween = [];
        
        //methodes publiques
        
        base.init = function(){
            initPageChargement();
            base.options.totalQuestion=1;
            base.options.totalTentative=1;
            base.options.totalEssai=1;
            base.options.tempsExo = 0;
            base.options.tempsQuestion = 0;
            base.options.estRejouable = true;
            base.creerOptions();
            base.tabletSupport = base.options.tabletSupport || false;
            // pour compatibilité avec vieux exos
            if (base.options.temps_question !== undefined) {
                base.options.tempsQuestion = base.options.temps_question;
            }
            if (base.options.temps_max !== undefined) {
                base.options.tempsExo = base.options.temps_max;
            }
            if (base.options.temps_exo !== undefined) {
                base.options.tempsExo = base.options.temps_exo;
            }
            if (base.options.nbre_questions !== undefined) {
                base.options.totalQuestion = base.options.nbre_questions;
            }
            
            base.loadRessources(base.oRessources);
            
            $.when.apply($,base.arRessources).done(function(){
                initPageTitre();
                initPageQuestion();
                initPageResultat();
                initPageParametre();
                
                base.btnCommencer.html(base.str.bouton.commencer);
                base.btnValider.html(base.str.bouton.valider);
                base.btnSuite .html(base.str.bouton.suite);
                base.btnRecommencer.html(base.str.bouton.recommencer);
                base.btnExerciceSuivant.html(base.str.bouton.suivant);
                base.btnTesterParametre.html(base.str.bouton.tester);
                //
                base.creerDonnees();
                base.creerPageTitre();
                base.blocIllustration.children(".image-sprite").css({position:"static",margin:"auto"});
                base.btnParametrer = base.options.parametrable ? base.btnParametrer.show() : base.btnParametrer.hide();
                base.btnSuite.hide();
                base.btnCommencer.on("click", gestionClickCommencer);
                base.btnParametrer.on("click", gestionClickParametrer);
                base.btnValider.on("click",gestionClickValider);
                base.btnSuite.on("click",gestionClickSuite);
                base.btnRecommencer.on("click", gestionClickRecommencer);
                base.btnExerciceSuivant.on("click", gestionClickExerciceSuivant);
                
                base.btnTesterParametre.on("click",gestionClickTesterParametre);
                base.pageChargement.hide();
                base.pageTitre.show();
                base.keyboard = new clc.keyboard();
                console.log("base.tabletSupport",base.tabletSupport);
                if(base.tabletSupport === true || base.tabletSupport=="debug") {
                    base.baseContainer.append(base.keyboard.baseContainer);
                    base.keyboard.baseContainer.find(".key").on("touchstart",gestionClavierVirtuel);
                    base.baseContainer.find(".bouton").hide();
                    base.keyboard.config({
                        numeric:"disabled",
                        arrow:"disabled"
                    });
                }
            });
        };
        
        //equivalent de click sur valider
        base.avancer = function() {
            base.btnValider.triggerHandler("click");
        };
        
        // equivalent de click sur valider + click sur suite
        // delaiFaux delaiJuste (optionnel) : temps que l'on attend avant de passer à la question suivante
        // selon que l'on a répondu juste ou faux
        // callback (optionnel) fonction executée après le passage a la question suivante ?
        base.poursuivreExercice = function(delaiJuste,delaiFaux,fCallback) {
            base.blocAnimation.find("*").off(".clc");
            var callback = fCallback || function(){return false;};
            var resEval = base.evaluer();
            base.indiceEssai = 1;
            var timeOut;
            if(resEval == "juste") {
                if ( base.options.tempsExo > 0 ) {
                    base.chrono.pause();
                }
                else if ( base.options.tempsQuestion > 0 ) {
                    base.chrono.stop();
                }
                base.score++;
                base.blocScore.html(calculerScore());
                desactiverChampReponse();
                calculerTemps();
                publier("validationQuestion",resEval);
                afficherInfo(resEval);
                if(base.indiceQuestion < base.options.totalQuestion-1) {
                    timeOut = setTimeout(function(e){
                        base.btnSuite.triggerHandler("click");
                        callback(e);
                    },delaiJuste);
                } else {
                    afficherBtnSuite();
                }
            }
            else if(resEval == "faux") {
                if ( base.options.tempsExo > 0 ) {
                    base.chrono.pause();
                }
                else if ( base.options.tempsQuestion > 0 ) {
                    base.chrono.stop();
                }
                desactiverChampReponse();
                calculerTemps();
                publier("validationQuestion",resEval);
                afficherInfo(resEval);
                base.corriger();
                if(base.indiceQuestion < base.options.totalQuestion-1) {
                    timeOut = setTimeout(function(e){
                        base.btnSuite.triggerHandler("click");
                        callback(e);
                    },delaiFaux);
                } else {
                    afficherBtnSuite();
                }
            }
            else if(resEval == "rien") {
                //publier("validationQuestion",resEval);
                afficherInfo(resEval);
                var arInput = base.pageQuestion.find(".text-field");
                if(arInput.length > 0)
                    arInput[0].focus();
            }
            
        };
        
        //equivalent de click sur valider pour un exo avec totalTentative > 1
        base.poursuivreQuestion = function() {
            base.indiceEssai=1;//indice essai toujours egal à 1 quand totalTentative >1
            base.indiceTentative++;
            //l'exercice n'est pas terminé
            if(base.indiceTentative < base.options.totalTentative) {
                if(base.evaluer() == "juste") {
                    base.score++;
                    base.blocScore.html(calculerScore());
                }
                return true;
            }
            //l'exercice est terminé
            else {
                base.blocAnimation.find("*").off(".clc");
                // supprimer tous les setTimeOut
                for( i = 0; i < base.aTimeout.length ; i++) {
                    clearTimeout(base.aTimeout[i]);
                    console.log("clearTimeout");
                }
                base.aTimeout = [];
                // supprimer tous les setInterval
                for( i = 0; i < base.aInterval.length ; i++) {
                    clearInterval(base.aInterval[i]);
                }

                if (typeof createjs != "undefined"){
                    // les tweens
                    createjs.Tween.removeAllTweens();
                    // arreter le ticker de createjs
                    createjs.Ticker.reset();
                    createjs.Ticker._timerId = null;
                    createjs.Ticker._inited = false;
                    //
                    for( i=0; i<base.aStage.length; i++ ){
                        createjs.Touch.disable(base.aStage[i]);
                        base.aStage[i].removeAllEventListeners();
                    }
                    base.aStage = []; 
                }
                if ( base.options.tempsExo > 0 ) {
                    base.chrono.pause();
                }
                else if ( base.options.tempsQuestion > 0 ) {
                    base.chrono.stop();
                }
                base.btnValider.hide();
                var resEval = base.evaluer();
                if(resEval == "juste") {
                    base.score++;
                    base.blocScore.html(calculerScore());
                    desactiverChampReponse();
                    calculerTemps();
                    publier("validationQuestion",resEval);
                    afficherInfo(resEval);
                    if(base.indiceQuestion==base.options.totalQuestion-1) {
                        base.blocInfo.children('.contenu').html(base.str.info.msgFin);
                    } else {
                        base.blocInfo.children('.contenu').html(base.str.info.msgFinQuestion);
                    }
                    base.btnSuite.off("keydown",gestionClavier);
                    afficherBtnSuite();
                    return false;
                }
                else {
                    desactiverChampReponse();
                    calculerTemps();
                    publier("validationQuestion",resEval);
                    afficherInfo("faux");
                    if(base.indiceQuestion==base.options.totalQuestion-1) {
                        base.blocInfo.children('.contenu').html(base.str.info.msgFin);
                    } else {
                        base.blocInfo.children('.contenu').html(base.str.info.msgFinQuestion);
                    }
                    base.corriger();
                    base.btnSuite.off("keydown",gestionClavier);
                    afficherBtnSuite();
                    return false;
                }

            }
        };
        
        base.terminerExercice = function(delay){
            var retard = delay || 0;
            setTimeout(function(){
                desactiverChampReponse();
                calculerTemps();
                base.blocInfo.addClass("rien");
                base.blocInfo.children(".contenu").html(base.str.info.msgFin);
                console.log(base.str);
                base.blocInfo.show();
                afficherBtnSuite();
            },retard);
        };
        
        base.loadRessources = function(oRessource) {
            
            if (typeof oRessource === 'function' ){
                oRes = oRessource();
            }else{
                oRes = oRessource;
            }
            oRes.str="lang/clc_fr.json";
            var dotIndex,extension;
            for (var resName in oRes ) {
                var res = oRes[resName];
                if(typeof(res) === "string") {
                    dotIndex = res.lastIndexOf(".");
                    extension = res.substring(dotIndex+1);
                    if ( extension == "png" || extension == "gif" || extension == "jpg" ) {
                        base.arRessources.push(imgLoad( resName, res ));
                    }
                    else if ( extension == "svg" ) {
                        base.arRessources.push(svgLoad( resName, res ));
                    }
                    else if (extension == "json" ) {
                        base.arRessources.push(txtLoad( resName, res, base.options.crossdomain ));
                    } else if (extension == "mp4"){
                        console.log("Pas de pré-chargement pour les vidéos");
                    }
                    else {
                        console.log(extension+" : cette extension de fichier n'est pas prise en charge");
                    }
                } else {
                    var sndTest =  false;
                    for ( var i = 0; i < res.length ; i++ ) {
                        dotIndex = res[i].lastIndexOf(".");
                        extension = res[i].substring(dotIndex+1);
                        if ( extension == "mp3" || extension == "ogg" || extension == "m4a") {
                            sndTest = true;
                        }
                    }
                    if ( sndTest ) {
                        base.arRessources.push(sndLoad( resName, res ));
                    } else {
                        console.log("Ce fichier ressource n'est pas pris en charge : ");
                    }
                }
            }
        };
        
        base.getURI = function (imageName){
            return base.exoFolderPath+base.oRessources[imageName];
        };
        
        base.getSoundSprite = function (nomSound) {
            return base.arSoundSprite[nomSound].clone(true);
        };
        
        base.btnValider.afficher = function(){
            if ( !base.tabletSupport ) {
                base.btnValider.show();
            }
            else {
                base.keyboard.config({large:"enabled"});
            }
        };
        base.btnValider.cacher = function(){
            if ( !base.tabletSupport ) {
                base.btnValider.hide();
            }
            else {
                base.keyboard.config({large:"disabled"});
            }
        };
        
        base.refreshScore = function(){
            base.blocScore.html(calculerScore());
        };
        
        var i;
        base.unload = function(){
            console.log("start unload");
            // supprimer tous les setTimeOut
            for( i = 0; i < base.aTimeout.length ; i++) {
                clearTimeout(base.aTimeout[i]);
            }
            base.aTimeout = [];
            // supprimer tous les setInterval
            for( i = 0; i < base.aInterval.length ; i++) {
                clearInterval(base.aInterval[i]);
            }
            base.aInterval = [];
            // supprimer tous les evenement .clc
            base.blocAnimation.find("*").off(".clc");
            // arreter le ticker de createjs
            if (typeof createjs != "undefined"){
                createjs.Ticker.reset();
                createjs.Ticker._timerId = null;
                createjs.Ticker._inited = false;
                //
                for( i=0; i<base.aStage.length; i++ ){
                    createjs.Touch.disable(base.aStage[i]);
                    base.aStage[i].removeAllEventListeners();
                }
                base.aStage = []; 
            }
            // arreter tous les chrono
            /*
            if(base.chrono.duree !== undefined) {
                base.chrono.pause();
            }
            */
            return "exercice unloaded";
        };
        
        base.baseContainer.unload = base.unload;
        
        base.setTimeout = function(fonction,delai){
            var toId = window.setTimeout(fonction,delai);
            base.aTimeout.push(toId);
            console.log(base.aTimeout);
            return toId;
        };
        
        base.clearTimeout = function(uid){
            window.clearTimeout(base.aTimeout.slice(base.aTimeout.indexOf(uid),1));
            console.log(base.aTimeout);
        };
        
        base.setInterval = function(fonction,delai){
            var intId = window.setInterval(fonction,delai);
            base.aInterval.push(intId);
            return intId;
        };
        
        base.clearInterval = function(uid){
            window.clearInterval(uid);
            //base.aInterval.slice(base.aInterval.indexOf(uid),1);
        };
        
        base.afficherBtnSuite = afficherBtnSuite;
        
        base.cacherBtnSuite = function(){
            base.btnSuite.hide();
            base.keyboard.config({large:"disabled"});
        };

        base.cacherBlocInfo = function(){
            base.blocInfo.css({visibility:"hidden"});
        };
        
        
        //methodes privees
        
        function initPageChargement() {
            var blocMessage = $("<div class='bloc-message'>Chargement ...</div>");
            var blocSpinner = $("<div class='bloc-spinner'></div>");
            base.pageChargement.append(blocMessage, blocSpinner);
            base.baseContainer.append(base.pageChargement);
        }
        
        function initPageTitre() {
            base.pageTitre.empty();
            base.blocIllustration.empty();
            base.pageTitre.append(base.blocTitre,base.blocConsigneGenerale,base.blocIllustration);
            base.pageTitre.append(base.btnCommencer,base.btnParametrer);
            base.baseContainer.append(base.pageTitre);
        }
        
        function initPageQuestion(){
            base.pageQuestion.append(base.blocAnimation);
            base.pageQuestion.append(base.blocInfo);
            base.blocInfo.children(".toolbar").html(base.btnSuite);
            base.pageQuestion.append(base.blocScore);
            base.pageQuestion.append(base.btnValider);
            base.baseContainer.append(base.pageQuestion);
        }
        
        function initPageResultat(){
            if (base.options.estRejouable) {
                base.pageResultat.append(base.btnRecommencer);
            } else {
                base.pageResultat.append(base.btnExerciceSuivant);
            }
            //console.log('path',base.exoFolderPath+'lang/etoiles.png');
            var cheminEtoile = base.exoFolderPath+'lang/etoiles.png';
            base.baseContainer.append(base.pageResultat);
            var blocTitre = $("<div class='bloc-titre-resultat'>"+base.str.misc.resultat+"</div>");
            var tableResultat = $("<table class='table-resultat' ></table>");
            var ligneEtoile = $('<tr class="etoile"><td colspan="2"><img src="'+cheminEtoile+'"/></td></tr>');
            var ligneScore=$("<tr class='score'><td class='label'>"+base.str.misc.score+" :</td><td class='data'>&nbsp;</td></tr>");
            var ligneScorePremierEssai=$("<tr class='premier-essai'><td class='label'>"+base.str.misc.essai+" : </td><td class='data'>&nbsp;</td></tr>");
            var ligneTemps=$("<tr class='temps'><td class='label'>"+base.str.misc.temps+" :</td><td class='data'>&nbsp;</td></tr>");
            tableResultat.append(ligneEtoile);
            tableResultat.append(ligneScore);
            tableResultat.append(ligneTemps);
            if( base.options.totalEssai>1) {
                tableResultat.append(ligneScorePremierEssai);
            }
            base.pageResultat.append(blocTitre,tableResultat);
            
        }
        
        function initPageParametre() {
            var blocTitre = $("<div class='bloc-titre-parametre'>"+base.str.misc.option+"</div>");
            base.pageParametre.append(blocTitre,base.blocParametre,base.btnTesterParametre);
            base.baseContainer.append(base.pageParametre);
        }
        
        function gestionClickCommencer(){
            var date = new Date();
            base.tempsDebutExo = date.getTime();
            base.score = 0;
            base.indiceTentative = 0;
            base.indiceQuestion = 0;
            base.indiceEssai = 0;
            
            
            var sndSprite = base.pageTitre.find(".snd-sprite");
            if(sndSprite.length > 0 ) {
                //$(sndSprite).triggerHandler("stop");
            }
            
            base.btnCommencer.hide();
            base.btnParametrer.hide();
            base.pageTitre.hide();
            base.pageQuestion.show();
            base.btnValider.show();
            base.blocScore.html(calculerScore());
            base.blocScore.show();
            if ( base.options.tempsExo > 0 ) {
                base.chrono = new clc.chrono("exo");
                base.chrono.set(base.options.tempsExo*1000);
                base.chrono.baseContainer.on("tempsDepasse",gererTempsDepasse);
            }
            else if ( base.options.tempsQuestion > 0 ) {
                base.chrono = new clc.chrono("question");
                base.chrono.set(base.options.tempsQuestion*1000);
                base.chrono.baseContainer.on("tempsDepasse",gererTempsDepasse);
            }

            base.creerPageQuestion();
        
            if(base.options.tempsQuestion > 0 || base.options.tempsExo > 0) {
                base.blocAnimation.append(base.chrono.baseContainer);
                base.chrono.start();
                
            }
            
            var arInput = base.pageQuestion.find(".text-field");
            if(arInput.length > 0) {
                //var timeout = setTimeout(function(){$(arInput[0]).attr("tabindex",-1).triggerHandler("focus");},50);
                $(arInput[0]).triggerHandler("mousedown");
                //$(arInput[0]).focus();
            }
            base.pageQuestion.on("keydown",gestionClavier);
            base.blocAnimation.on("touchmove",function(e){e.preventDefault();});
        }
        
        function gestionClickParametrer(){
            var sndSprite = base.pageTitre.find(".snd-sprite"); 
            if(sndSprite.length > 0 ) {
                $(sndSprite).triggerHandler("stop");
            }
            base.btnCommencer.hide();
            base.pageTitre.hide();
            base.pageParametre.show();
            base.blocParametre.empty();
            base.creerPageParametre();
            //pageParametre.find(.)
            base.btnTesterParametre.show();
        }
        
        
        function gestionClickValider() {
            base.btnValider.hide();
            var resEval = base.evaluer();
            var arInput;
            if(resEval == "juste") {
                base.blocAnimation.find("*").off(".clc");
                if ( base.options.tempsExo > 0 ) {
                    base.chrono.pause();
                }
                else if ( base.options.tempsQuestion > 0 ) {
                    base.chrono.stop();
                }
                base.score++;
                base.blocScore.html(calculerScore());
                desactiverChampReponse();
                calculerTemps();
                publier("validationQuestion",resEval);
                afficherInfo(resEval);
                afficherBtnSuite();
                
            }
            else if(resEval == "faux") {
                base.indiceEssai++;
                if(base.indiceEssai == base.options.totalEssai)
                    base.blocAnimation.find("*").off(".clc");
                if ( base.options.tempsExo > 0 ) {
                    base.chrono.pause();
                }
                else if ( base.options.tempsQuestion > 0 ) {
                    base.chrono.stop();
                }
                if ( base.options.totalEssai == base.indiceEssai ) {
                    desactiverChampReponse();
                    calculerTemps();
                    publier("validationQuestion",resEval);
                    afficherInfo(resEval);
                    afficherBtnSuite();
                    base.corriger();
                    
                }
                else {
                    afficherInfo(resEval);
                    arInput = base.pageQuestion.find(".text-field");
                    if( arInput.length > 0 ){
                        $(arInput[0]).attr("tabindex",-1).triggerHandler("mousedown");
                        $(arInput[0]).focus();
                    }
                    base.btnValider.show();
                }
                
                
            }
            else if(resEval == "rien") {
                //publier("validationQuestion",resEval);
                afficherInfo(resEval);
                arInput = base.pageQuestion.find(".text-field");
                if(arInput.length > 0){
                    $(arInput[0]).attr("tabindex",-1).triggerHandler("mousedown");
                    $(arInput[0]).focus();
                }
                base.btnValider.show();
                
            }
            return resEval;
        }
        
        function gestionClickSuite() {
            // on arrete de jouer le fichier son si c'est le cas
            var sndSprite = base.pageQuestion.find(".snd-sprite");
            if(sndSprite.length > 0 ) {
                $(sndSprite).triggerHandler("stop");
            }
            base.btnSuite.hide();
            base.blocInfo.hide();
            base.indiceQuestion++;
            base.indiceEssai=0;
            base.indiceTentative = 0;
            // supprimer tous les setTimeOut
            for( i = 0; i < base.aTimeout.length ; i++) {
                clearTimeout(base.aTimeout[i]);
                console.log("clearTimeout");
            }
            base.aTimeout = [];
            // supprimer tous les setInterval
            for( i = 0; i < base.aInterval.length ; i++) {
                clearInterval(base.aInterval[i]);
            }
            base.aInterval = [];
            // Nettoyer les animations créées avec createJS
            if (typeof createjs != "undefined"){
                // les tweens
                createjs.Tween.removeAllTweens();
                // arreter le ticker de createjs
                createjs.Ticker.reset();
                createjs.Ticker._timerId = null;
                createjs.Ticker._inited = false;
                //
                for( i=0; i<base.aStage.length; i++ ){
                    createjs.Touch.disable(base.aStage[i]);
                    base.aStage[i].removeAllEventListeners();
                }
                base.aStage = []; 
            }
            // vider le bloc animation
            base.blocAnimation.empty();
            //l'exercice n'est pas terminé
            if(base.indiceQuestion < base.options.totalQuestion) {
                base.btnValider.show();
                base.creerPageQuestion();
                if(base.options.tempsQuestion > 0 || base.options.tempsExo > 0) {
                    base.blocAnimation.append(base.chrono.baseContainer);
                    base.chrono.baseContainer.on("tempsDepasse",gererTempsDepasse);
                    base.chrono.start();
                    
                }
                base.btnSuite.off("keydown",gestionClavier);
                var arInput = base.pageQuestion.find(".text-field");
                if(arInput.length > 0) {
                    $(arInput[0]).attr("tabindex",-1).triggerHandler("mousedown");
                    $(arInput[0]).focus();
                }
                base.pageQuestion.on("keydown",gestionClavier);
            }
            //l'exercice est terminé
            else {
                if(base.options.tempsQuestion > 0 || base.options.tempsExo > 0) {
                    base.chrono.stop();
                }
                base.pageQuestion.hide();
                base.blocAnimation.empty();
                base.btnRecommencer.show();
                calculerResultat();
                publier("finExercice",base.score,base.dureeExo);
                base.pageResultat.show();
                base.btnSuite.off("keydown",gestionClavier);
            }
        }
        
        function gestionClickRecommencer() {
            //e.data.initDonnees();
            base.creerDonnees();
            base.pageResultat.hide();
            base.blocIllustration.empty();
            base.blocTitre.empty();
            base.blocConsigneGenerale.empty();
            base.creerPageTitre();
            base.blocIllustration.children(".image-sprite").css({position:"static",margin:"auto"});
            base.btnParametrer = base.options.parametrable ? base.btnParametrer.show() : base.btnParametrer.hide();
            base.pageTitre.show();
            base.btnCommencer.show();
            if(base.options.parametrable)
                base.btnParametrer.show();
            base.btnSuite.hide();
        }
        
        function gestionClickExerciceSuivant() {
            // supprimer tous les setTimeOut
            var i;
            for( i = 0; i < base.aTimeout.length ; i++) {
                clearTimeout(base.aTimeout[i]);
            }
            // supprimer tous les setInterval
            for( i = 0; i < base.aInterval.length ; i++) {
                clearInterval(base.aInterval[i]);
            }
            // supprimer tous les evenement .clc
            base.blocAnimation.find("*").off(".clc");
            // arreter le ticker de createjs
            if (typeof createjs != "undefined"){
                createjs.Ticker.reset();
                createjs.Ticker._timerId = null;
                createjs.Ticker._inited = false;
                //
                for( i=0; i<base.aStage.length; i++ ){
                    createjs.Touch.disable(base.aStage[i]);
                    base.aStage[i].removeAllEventListeners();
                }
                base.aStage = []; 
            }
            base.baseContainer.trigger("close");
        }
        
        
        
        function gestionClickTesterParametre() {
            base.btnTesterParametre.hide();
            // Attention ! serilizeArray transforme true et false en "true" et "false" !!!
            var arOptions = $(base.blocParametre).serializeArray();
            //on vide d'abord les options qui sont des tableaux
            $.each(arOptions,function(index,field){
                var key=field.name;
                if($.isArray(base.options[key])) {
                    base.options[key]=[];
                }
            });
            //on affecte ensuite les valeurs
            $.each(arOptions,function(index,field){
                var key=field.name;
                // cette option est un tableau
                if($.isArray(base.options[key])) {
                    // les elements de ce tableau sont des string 
                    if ( isNaN(Number(field.value)) ) {
                        if(field.value === "true"){
                            base.options[key].push(true);
                        }
                        else if (field.value === "false"){
                            base.options[key].push(false);
                        }
                        else {
                            base.options[key].push(field.value);
                        }
                        
                    }
                    // les elements de ce tableau sont des nombres
                    else {
                        base.options[key].push(Number(field.value));
                    }
                }
                //cette option n'est pas un tableau 
                else {
                    // c'est un string
                    if ( isNaN(Number(field.value)) ) {
                        if(field.value === "true"){
                            base.options[key] = true;
                        }
                        else if (field.value === "false"){
                            base.options[key] = false;
                        }
                        else {
                            base.options[key] = field.value;
                        }
                    }
                    // c'est un nombre
                    else {
                        base.options[key] = Number(field.value);
                    }
                }
            });
            
            // pour compatibilité avec vieux exos
            if (base.options.temps_question !== undefined) {
                base.options.tempsQuestion = base.options.temps_question;
            }
            if (base.options.temps_max !== undefined) {
                base.options.tempsExo = base.options.temps_max;
            }
            if (base.options.temps_exo !== undefined) {
                base.options.tempsExo = base.options.temps_exo;
            }
            if (base.options.nbre_questions !== undefined) {
                base.options.totalQuestion = base.options.nbre_questions;
            }
            
            // on publie l'événement
            publier("validationOption");
            
            // on recharge les ressources ?
            base.arRessources=[];
            base.loadRessources(base.oRessources);
            $.when.apply($,base.arRessources).done(function(){
                base.pageParametre.hide();
                base.btnRecommencer.triggerHandler("click");
            });
           
            
        }
        
        function gestionClavier(e) {
            var btnVisible = base.baseContainer.find("button").filter(":visible");
            if(!btnVisible) {
                return true;
            } else if(e.which == 13) {
                btnVisible.triggerHandler("click");
                return false;
            }
            //return false;
        }
        
        function gestionClavierVirtuel(e) {
            e.preventDefault();
            var keyValue = $(e.delegateTarget).data("valeur");
            var keyDisabled = $(e.delegateTarget).hasClass("disabled");
            // si la touche est desactivee on ne fait rien;
            if (keyDisabled)
                return false;
            //
            switch (keyValue) {
                case "commencer":
                    base.keyboard.enterKey.html(base.str.bouton.valider);
                    base.keyboard.enterKey.data("valeur","valider");
                    base.keyboard.config({
                        numeric:"enabled",
                        arrow:"enabled"
                    });
                    gestionClickCommencer(e);
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "valider":
                    var resEval = gestionClickValider(e);
                    if (base.indiceQuestion < base.options.totalQuestion - 1) {
                        if(resEval == "rien") {
                            /*
                            base.keyboard.enterKey.html(base.str.bouton.valider);
                            base.keyboard.enterKey.data("valeur","valider");
                            base.keyboard.config({
                                numeric:"enabled",
                                arrow:"enabled"
                            })
                            */
                        }
                        else if(base.options.totalEssai == base.indiceEssai){
                            base.keyboard.enterKey.html(base.str.bouton.suite);
                            base.keyboard.enterKey.data("valeur","suite");
                            base.keyboard.config({
                                numeric:"disabled",
                                arrow:"disabled"
                            });
                        }
                    }
                    else {
                        base.keyboard.enterKey.html(base.str.bouton.resultat);
                        base.keyboard.enterKey.data("valeur","resultats");
                        base.keyboard.config({
                            numeric:"disabled",
                            arrow:"disabled"
                        });
                    }
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "suite":
                    if(base.indiceQuestion < base.options.totalQuestion) {
                        base.keyboard.enterKey.html(base.str.bouton.valider);
                        base.keyboard.enterKey.data("valeur","valider");
                        base.keyboard.config({
                            numeric:"enabled",
                            arrow:"enabled"
                        });
                    } else {
                        base.keyboard.enterKey.html(base.str.bouton.resultat);
                        base.keyboard.enterKey.data("valeur","resultats");
                    }
                    gestionClickSuite(e);
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "resultats":
                    gestionClickSuite(e);
                    if ( base.options.estRejouable ) {
                        base.keyboard.enterKey.html(base.str.bouton.recommencer);
                        base.keyboard.enterKey.data("valeur","recommencer");
                    } else {
                        base.keyboard.enterKey.html(base.str.bouton.suivant);
                        base.keyboard.enterKey.data("valeur","suivant");
                    }
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "recommencer":
                    //var evt=jQuery.event;
                    //evt.data = {initDonnees:base.creerDonnees,initQuestion:base.creerPageQuestion}
                    gestionClickRecommencer();
                    base.keyboard.enterKey.html(base.str.bouton.commencer);
                    base.keyboard.enterKey.data("valeur","commencer");
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "suivant":
                    //var evt=jQuery.event;
                    //evt.data = {initDonnees:base.creerDonnees,initQuestion:base.creerPageQuestion}
                    gestionClickExerciceSuivant();
                    base.keyboard.enterKey.html(base.str.bouton.commencer);
                    base.keyboard.enterKey.data("valeur","commencer");
                    base.baseContainer.find(".bouton").hide();
                    break;
                case "suppr":
                    var input = $(base.pageQuestion.find(".text-field.actif").get(0));
                    var texte = input.text();
                    var newTexte = texte.substr(0,texte.length-1);
                    input.text(newTexte);
                    break;
                case "gauche":
                    evt = jQuery.Event("keydown");
                    evt.which = 37;
                    base.pageQuestion.trigger(evt);
                    break;
                case "haut":
                    evt = jQuery.Event("keydown");
                    evt.which = 38;
                    base.pageQuestion.trigger(evt);
                    break;
                case "droite":
                    evt = jQuery.Event("keydown");
                    evt.which = 39;
                    base.pageQuestion.trigger(evt);
                    break;
                case "bas":
                    evt = jQuery.Event("keydown");
                    evt.which = 40;
                    base.pageQuestion.trigger(evt);
                    break;
                case "exo":
                    // on laisse le programmeur redefinir le comportement
                    // dans l'exo
                    break;
                default:
                    input = $(base.pageQuestion.find(".text-field.actif")[0]);
                    input.append(keyValue);
                    break;
             }
             return false;
        }
        
        function afficherInfo(resEval) {
            //console.log("afficherInfo()");
            if(resEval == "juste") {
                base.blocInfo.css({background:"#8cc63f"});
                base.blocInfo.removeClass("rien");
                base.blocInfo.removeClass("erreur");
                base.blocInfo.addClass("bravo");
                base.blocInfo.children('.contenu').html(base.str.info.msgJuste);
            }
            else if(resEval == "faux") {
                base.blocInfo.removeClass("rien");
                base.blocInfo.removeClass("bravo");
                base.blocInfo.addClass("erreur");
                if ( base.indiceEssai == base.options.totalEssai ) {
                    base.blocInfo.css({background:"#EC0000"});
                    base.blocInfo.children('.contenu').html(base.str.info.msgFauxQuestionSuivante);
                }
                else {
                    base.blocInfo.css({background:"#FF7F00"});
                    base.blocInfo.children('.contenu').html(base.str.info.msgFaux);
                }
            }
            else if(resEval == "tempsDepasseFaux") {
                base.blocInfo.css({background:"#EC0000"});
                base.blocInfo.removeClass("rien");
                base.blocInfo.removeClass("bravo");
                base.blocInfo.addClass("erreur");
                base.blocInfo.children('.contenu').html(base.str.info.msgTempsDepasseFaux);
            }
            else if(resEval == "tempsDepasseJuste") {
                base.blocInfo.css({background:"#8cc63f"});
                base.blocInfo.removeClass("rien");
                base.blocInfo.removeClass("erreur");
                base.blocInfo.addClass("bravo");
                base.blocInfo.children('.contenu').html(base.str.info.msgTempsDepasseJuste);
            }
            else {
                base.blocInfo.css({background:"#308DCC"});
                base.blocInfo.removeClass("bravo");
                base.blocInfo.removeClass("erreur");
                base.blocInfo.addClass("rien");
                base.blocInfo.children('.contenu').html(base.str.info.msgRien);
            }
            if(base.indiceQuestion == base.options.totalQuestion-1 && resEval != "rien" && base.indiceEssai == base.options.totalEssai ) {
                base.blocInfo.css({visibility:"visible"});
                var texte = "<br>"+base.str.info.msgFin;
                base.blocInfo.children('.contenu').append(texte);
            }
            base.blocInfo.show();
            
        }
        
        function publier() {
            var eventName = arguments[0];
            var n=0;
            if(base.options.totalTentative >1) {
                n = base.indiceQuestion*base.indiceTentative;
            } else {
                n = base.indiceQuestion;
            }
            if(eventName == "validationQuestion") {
                var resEval = arguments[1];
                base.baseContainer.trigger(eventName,{
                    idExo:base.options.idExo,
                    resEval:resEval,
                    indiceQuestion:n
                });
            }
            else if(eventName == "finExercice") {
                var score = arguments[1];
                var duree = arguments[2];
                var total = Number(base.options.totalQuestion)*Number(base.options.totalTentative);
                console.log("totalTentative",base.options.totalTentative);
                base.baseContainer.trigger(eventName,{
                    idExo:base.options.idExo,
                    numExo:base.options.numExo,
                    score:score,
                    total:total,
                    duree:duree
                });
                //base.baseContainer.trigger(eventName,[score,n,duree])
            }
            else if(eventName == "validationOption") {
                base.baseContainer.trigger(eventName,base.options);
            }
        }
        
        function calculerTemps() {
            /*
            if(base.indiceQuestion == base.options.totalQuestion-1) {
                var date = new Date()
                base.tempsFinExo = date.getTime();
            }
            */
            var date = new Date();
            base.tempsFinExo = date.getTime();
        }
        
        function afficherBtnSuite() {
            base.pageQuestion.off("keydown",gestionClavier);
            // pour l'interface PC
            if(base.indiceQuestion < base.options.totalQuestion - 1) {
                console.log("poursuivre");
                base.btnSuite.html(base.str.bouton.suite);
                base.keyboard.enterKey.html(base.str.bouton.suite);
                base.keyboard.enterKey.data("valeur","suite");
            } 
            else {
                console.log("terminé");
                base.btnSuite.html(base.str.bouton.resultat);
                console.log(base.str.bouton.resultat);
                base.keyboard.enterKey.html(base.str.bouton.resultat);
                //alert("stop");
                base.keyboard.enterKey.data("valeur","resultats");
            }
            if( (base.tabletSupport === true) || (base.tabletSupport == "debug") ){
                base.btnSuite.hide();
                base.keyboard.config({
                    numeric:"disabled",
                    arrow:"disabled",
                    valider:"enabled"
                });

            }
            else {
                base.btnSuite.show();
                base.btnSuite.on("keydown",gestionClavier);
                var timeOut = setTimeout(function(){base.btnSuite.focus();},50);//necessaire pour IE
            }
            // pour l'interface tablette

        }
        
        function desactiverChampReponse(){
            var arInput = base.pageQuestion.find(".text-field");
            if(arInput.length > 0) {
                arInput.each(function() {
                    $(this).attr("disabled",true);
                });
            }
        }
        
        function calculerResultat(){
            var txtScore="";
            var percent;
            if(!base.options.totalTentative) {
                txtScore = base.score + " "+base.str.misc.sur+" " + base.options.totalQuestion;
                percent = 100*Number(base.score) / Number(base.options.totalQuestion);
            } else {
                txtScore = base.score +  " "+base.str.misc.sur+" "  + base.options.totalTentative*base.options.totalQuestion;
                percent = 100*Number(base.score) / (Number(base.options.totalTentative)*Number(base.options.totalQuestion));
            }
            base.pageResultat.find('.etoile img').css('backgroundSize',percent+'% 100%');
            base.pageResultat.find(".score .data").html(txtScore);
            
            base.dureeExo = Math.floor((base.tempsFinExo - base.tempsDebutExo)/1000);
            var min = Math.floor(base.dureeExo/60);
            var sec = base.dureeExo % 60;
            var txtTemps;
            var plurMin = min > 1 ? "s" : "";
            var plurSec = sec > 1 ? "s" : "";
            if(min === 0 ) {
                txtTemps = sec +  " "+base.str.misc.sec + plurSec;
            }
            else{
                txtTemps = min +  " "+base.str.misc.min + plurMin + " "  + sec +  " "+ base.str.misc.sec + plurSec;
            }
            base.pageResultat.find(".temps .data").html(txtTemps);
        }
        
        function calculerScore(){
            if(!base.options.totalTentative) {
                txtScore = base.str.misc.score+" : " + base.score + " sur " + base.options.totalQuestion;
            } else {
                txtScore = base.str.misc.score+" : " + base.score + " sur " + base.options.totalTentative*base.options.totalQuestion;
            }
            return txtScore;
        }
        
        function gererTempsDepasse(){
            base.blocAnimation.find("*").off(".clc");
            // supprimer tous les setTimeOut
            for( i = 0; i < base.aTimeout.length ; i++) {
                clearTimeout(base.aTimeout[i]);
                console.log("clearTimeout");
            }
            base.aTimeout = [];
            // supprimer tous les setInterval
            for( i = 0; i < base.aInterval.length ; i++) {
                clearInterval(base.aInterval[i]);
            }

            if (typeof createjs != "undefined"){
                // les tweens
                createjs.Tween.removeAllTweens();
                // arreter le ticker de createjs
                createjs.Ticker.reset();
                createjs.Ticker._timerId = null;
                createjs.Ticker._inited = false;
                //
                for( i=0; i<base.aStage.length; i++ ){
                    createjs.Touch.disable(base.aStage[i]);
                    base.aStage[i].removeAllEventListeners();
                }
                base.aStage = []; 
            }

            
            var resEval = base.evaluer();
            
            base.btnValider.hide();
            desactiverChampReponse();
            
            
            calculerTemps();
            // si l'eleve a saisi une reponse juste mais n'a pas eu le temps de la valider
            if(resEval == "juste") {
                if (base.options.totalTentative==1) {
                    base.score++;
                    base.blocScore.html(calculerScore());
                    publier("validationQuestion",resEval);
                }
                afficherInfo("tempsDepasseJuste");
            }
            else {
                afficherInfo("tempsDepasseFaux");
                publier("validationQuestion","temps depassé");
                base.corriger();
                
            }
            afficherBtnSuite();
            if (base.chrono.type == "exo") base.indiceQuestion = base.options.totalQuestion;

            if ( base.tabletSupport === true || base.tabletSupport == "debug" ) {
                if (base.indiceQuestion < base.options.totalQuestion - 1) {
                    base.keyboard.enterKey.html(base.str.bouton.suite);
                    base.keyboard.enterKey.data("valeur","suite");
                    base.keyboard.config({
                        numeric:"disabled",
                        arrow:"disabled"
                    });
                }
                else {
                    base.keyboard.enterKey.html(base.str.bouton.resultat);
                    base.keyboard.enterKey.data("valeur","resultats");
                    base.keyboard.config({
                        numeric:"disabled",
                        arrow:"disabled"
                    });
                }
            }
        }
        
                
        function imgLoad (imageName,imageFileName) {
            var chemin = base.exoFolderPath+imageFileName;
            var img = new Image();
            //img.crossOrigin = '';
            var deferred = $.Deferred();
            img.onload = function(){
                var conteneur =$("<div class='image-sprite ui-helper-clearfix'></div>");
                var largeur = img.width, hauteur = img.height;
                conteneur.css({position:"absolute",width:largeur,height:hauteur});
                conteneur.append(img);
                img.style.position="absolute";
                base.aImageElt[imageName] = img;
                base.images[imageName] = conteneur;
                deferred.resolve();
            };
            img.src = chemin;
            return deferred;
        }

        function svgLoad (imageName,imageFileName) {
            var chemin = base.exoFolderPath+imageFileName;
            var deferred = $.Deferred();
            $.ajax({
                type: "GET",
                url: chemin,
                success: function(data){
                    base.images[imageName] = data;
                    deferred.resolve();
                },
                dataType: "xml"
            });
           
            return deferred;
        }
        
        function txtLoad (imageName,imageFileName,isCrossDomain) {
            var chemin,deferred;
            if(isCrossDomain){
                var pos = base.exoFolderPath.lastIndexOf("exercices");
                var url = base.exoFolderPath.substr(0,pos)+"api/getjson.php";
                chemin = base.exoFolderPath+imageFileName;
                deferred = $.Deferred();
                $.ajax({
                    type: "POST",
                    data:{
                        nomExo:imageFileName
                    },
                    url: url,
                    success: function(data){
                        console.log(data);
                        base[imageName] = JSON.parse(data);
                        deferred.resolve();
                    },
                    error:function(a,b,c){
                        console.log("erreur",a,b,c);
                    },
                    dataType: "text"
                });
            }
            else {
                chemin = base.exoFolderPath+imageFileName;
                deferred = $.Deferred();
                $.ajax({
                    type: "GET",
                    url: chemin,
                    success: function(data){
                        base[imageName] = data;
                        deferred.resolve();
                    },
                    error:function(a,b,c){
                        console.log(a,b,c);
                    },
                    dataType: "json"
                });
            }
            return deferred;
        }
        
        function sndLoad (soundName,arSoundFileName) {
            var audioObj = new Audio();
            var deferred = $.Deferred();
            var conteneur =$("<div class='snd-sprite'></div>");
            
            conteneur.addClass("play");
            conteneur.data("playing",false);
            
            base.sounds[soundName] = conteneur;
            audioObj.addEventListener("canplaythrough",function(){
                console.log('canplaythrough fired');
                deferred.resolve();
            },false);
            
            for ( var i = 0; i < arSoundFileName.length; i++ ) {
                var fileName = arSoundFileName[i];
                var fileExtension = fileName.substring(fileName.lastIndexOf('.')+1);
                var source = document.createElement("source");
                if (fileExtension == 'ogg') {
                    source.type = 'audio/ogg';
                } else if (fileExtension == 'mp3') {
                    source.type = 'audio/mpeg';
                }
                else {
                    deferred.resolve();
                }
                source.src= base.exoFolderPath+"/"+arSoundFileName[i];
                audioObj.appendChild(source);
            }
            conteneur.on("click",{audio:audioObj},playPauseSound);
            conteneur.on("stop",{audio:audioObj},stopSound);
            // sur ipad canplaythrough n'est jamais déclenché ?
            if(navigator.userAgent.match(/iPad/i)) {
                deferred.resolve();
            }
            return deferred;
        }
        
        function playPauseSound(e) {
            
            var conteneur = $(e.delegateTarget);
            var audioObj = e.data.audio;
            if(conteneur.data("playing")) {
                conteneur.data("playing",false);
                audioObj.pause();
                conteneur.removeClass('pause');
                conteneur.addClass('play');
            } else {
                conteneur.data("playing",true);
                audioObj.play();
                conteneur.removeClass('play');
                conteneur.addClass('pause');
            }
            var arInput =  $(this).parents(".page").find(".text-field");
            if(arInput.length > 0){
                $(arInput[0]).attr("tabindex",-1).triggerHandler("mousedown");
                $(arInput[0]).focus();
            }
        }
        
        function stopSound(e) {
            //console.log(e);
            var conteneur = $(e.delegateTarget);
            var audioObj = e.data.audio;
            audioObj.pause();
            audioObj.currentTime=0;
            conteneur.data("playing",false);
            conteneur.removeClass('pause');
            conteneur.addClass('play');
        }
        
        return base;
    };
    return clc;
}());