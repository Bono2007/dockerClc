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
                        
                    }
                    else {
                        
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
            
            return toId;
        };
        
        base.clearTimeout = function(uid){
            window.clearTimeout(base.aTimeout.slice(base.aTimeout.indexOf(uid),1));
            
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
            //
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
            //
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
                
                base.btnSuite.html(base.str.bouton.suite);
                base.keyboard.enterKey.html(base.str.bouton.suite);
                base.keyboard.enterKey.data("valeur","suite");
            } 
            else {
                
                base.btnSuite.html(base.str.bouton.resultat);
                
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
                        
                        base[imageName] = JSON.parse(data);
                        deferred.resolve();
                    },
                    error:function(a,b,c){
                        
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
            //
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
		//if(chrono.count < 50 && dT > 0 ) 
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
				
			};

			inputElem.blur = function(){
				this.removeClass("actif");
				
			};

			inputElem.on("blur",function(e){
				e.preventDefault();
				$(this).removeClass("actif");
				
			});
			
			inputElem.on("touchstart",function(e){
				e.preventDefault();
				inputElem.focus();
				
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
			//
			var indexFL = (nFrame % nFL) === 0 ? nFL : (nFrame % nFL);
			var indexFH = nFrame % nFL === 0 ? Math.floor(nFrame/nFL) -1 : Math.floor(nFrame/nFL);
			//
			//
			var posX = - (indexFL-1)*largeurFrame;
			var posY = - (indexFH)*hauteurFrame;
			o.image.css({left:posX,top:posY});
			o.animId.start();
		};

		o.gotoAndStop= function(nFrame){
			var nFL = Math.round(l/largeurFrame);
			//
			var indexFL = (nFrame % nFL) === 0 ? nFL : (nFrame % nFL);
			var indexFH = nFrame % nFL === 0 ? Math.floor(nFrame/nFL) -1 : Math.floor(nFrame/nFL);
			//
			//
			var posX = - (indexFL-1)*largeurFrame;
			var posY = - (indexFH)*hauteurFrame;
			
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
		
		
		
		var node = svgDoc.getElementById(gradId);
		if (node.nodeName == "linearGradient") {
				
				var sFill = "";
				var x1 = node.attributes.x1.value;
				var y1 = node.attributes.y1.value;
				var x2 = node.attributes.x2.value;
				var y2 = node.attributes.y2.value;
				var angle = Raphael.angle(x2,y2,x1,y1);
				
				var couleurDebut = $(node).children("stop")[0].style["stop-color"];
				var couleurFin = $(node).children("stop")[$(node).children("stop").length-1].style["stop-color"];
				
				
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