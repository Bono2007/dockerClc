var aData = location.search.substr(1).split('&');
var sNomExo = aData[0].split('=')[1];
var supportTablette = aData[1].split('=')[1] === 'oui' ? true : false;
var parametrable = aData[2].split('=')[1] === 'oui' ? true : false;

head.load(
	"../bibliotheque/javascript/clc/css/clc.css",
	"../bibliotheque/javascript/lib-externes/swfobject.js",
	"../bibliotheque/javascript/lib-externes/modernizr.custom.59181.js",
//	"bibliotheque/javascript/lib-externes/jquery/css/start/jquery-ui-1.10.4.custom.min.css", 
	"../bibliotheque/javascript/lib-externes/jquery/css/start/jquery-ui-1.12.1.css", 
	"../bibliotheque/javascript/lib-externes/jquery.all.min.js",
	"../bibliotheque/javascript/lib-externes/svgjs.all.min.js?v=201702142033",
	"../bibliotheque/javascript/lib-externes/raphael.all.min.js",
	"../bibliotheque/javascript/lib-externes/big.all.min.js",
	"../bibliotheque/javascript/lib-externes/createjs.all.min.js",
	"../bibliotheque/javascript/lib-externes/katex.min.js",
	"../bibliotheque/javascript/lib-externes/math.min.js",
	"../bibliotheque/javascript/clc/js/clc.min.1.js?v=201710101622",
	"exercices/"+sNomExo+"/"+sNomExo+".js",
	function() {
		var exercice = CLC[sNomExo]({parametrable:parametrable,crossdomain:false,tabletSupport:supportTablette},"exercices");
	    exercice.on("finExercice",function(e,data){
	        console.log("finExercice",data);
	    });
	    $(".exercice").html(exercice);
	}
);