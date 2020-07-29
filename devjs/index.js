$(document).ready(function(){
    
    $(".boite-exo").addClass("ui-widget-content");
    
    
    $("#modale-exo").dialog({
        autoOpen:false,
        modal:true,
        width:780,
        position :{ my: "center top", at: "center top", of: window },
        buttons: [ { text: "Quitter", click: function() { $(this).dialog( "close" ); } } ]
    });
    
    $(".bouton").click(function(e){
        var nom = $(e.target).parent().find('.lien-exo').text();
        var hauteur = $(e.target).hasClass('pc') ? 580 : 676;
        var tabletSupport = $(e.target).hasClass('pc') ? false : true;
        var exercice = CLC[nom]({parametrable:true,crossdomain:false,tabletSupport:tabletSupport},"exercices");
        exercice.on("finExercice",function(e,data){
            console.log("finExercice",data);
        });
        $("#modale-exo").html(exercice);
        $("#modale-exo").dialog({
            close:function(){
                exercice.unload();
            }
        });
        var hauteur = $(e.target).hasClass('pc') ? 580 : 676;
        $("#modale-exo").dialog({height:hauteur});
        $("#modale-exo").dialog("open");
    });
    
});