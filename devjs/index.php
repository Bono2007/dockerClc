<?php
    $aExercice = listerExercice("exercices");
    
    
    function listerExercice($dossier){
        $aExo = array();
        $aDir = scandir($dossier);
        foreach ($aDir as $dir)
        {
            if(
                !preg_match('/^\./',$dir)
                && is_dir($dossier."/".$dir)
            )
            {
                $aExo[]=$dir;   
            }
        }
        return $aExo;
    };
    
?>
<!DOCTYPE html">
<html>
<head>
    <title>calcul@TICE JS</title>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name = "viewport" content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    
    <link rel="stylesheet" type="text/css" href="lib-externes/jquery/css/start/jquery-ui-1.10.4.custom.min.css" />
   
    <script src="lib-externes/modernizr.js" ></script>
    
    <script src="lib-externes/jquery/js/jquery-1.10.2.js" ></script>
    <script src="lib-externes/jquery/js/jquery-ui-1.10.4.custom.min.js" ></script>
    <script src="lib-externes/jquery/js/jquery.ui.touch-punch.min.js" ></script>
    <script src="lib-externes/jquery/js/jquery.transit.js" ></script>
    
    <script src="lib-externes/big/big.js" ></script>
    <script src="lib-externes/big/big-french.js" ></script>

    <script src="lib-externes/svgjs/svg.js" ></script>
    <script src="lib-externes/svgjs/svg.load.js" ></script>
    <script src="lib-externes/svgjs/svg.draggable.js" ></script>
    <script src="lib-externes/svgjs/svg.intersect.js" ></script>
    
    
    <script src="lib-externes/raphael/raphael.js" ></script>
    <script src="lib-externes/raphael/raphael-svg-import.js" ></script>
    
    <script src="lib-externes/createjs/easeljs.js" ></script>
    <script src="lib-externes/createjs/tweenjs.js" ></script>
    
    

    <link rel="stylesheet" type="text/css" href="clc/css/clc.css" />
    
    <!-- pour le dev -->
    <script src="clc/js/clc.dev.1.js?v=201710101622" ></script>
    <!--fin dev -->
    
    
    <?php
    
        foreach ($aExercice as $exo)
        {
            if($exo !== "lang"){
                echo("<script src=\"exercices/".$exo."/".$exo.".js\"></script>\n");
            }
            
        }
    ?>
    <link rel="stylesheet" type="text/css" href="index.css" />
    <script src="index.js" ></script>
    
    
</head>
<body>
    
    <div id="centrage" class="ui-helper-clearfix" >
        <div id='modale-exo' ></div>
        <div class="contenu ui-helper-clearfix">
        <h1>calcul@TICE javascript</h1>
        <ul class="liste-exo ui-helper-clearfix">
            <li class="boite-modele ui-widget-content">
                <span class="lien-modele">Le framework</span>
                <a class="btn-download" href="telecharger_sources.php?name=framework">t</a>
            </li>
        </ul>
        <p>Pour bidouiller des exercices télécharger "framework" + "lang" + les exercices de votre choix.<br>Dézipper framework.zip. Dans le dossier obtenu, créer un dossier "exercices", y placer "lang" et les exercices que vous avez téléchargés. Placer le tout dans le serveur web</p>

        <ul class="liste-exo ui-helper-clearfix">
        <?php
            foreach ($aExercice as $exo)
            {
                echo("<li class=\"boite-exo\">
                        <span class=\"lien-exo\">".$exo."</span>
                        <span class='bouton tablette'>Tab</span>
                        <span class='bouton pc'>PC</span>
                        <span class='bouton telecharger'>
                            <a href=\"telecharger_sources.php?name=".$exo."\" class=\"btn-download\">t</a>
                        </span>
                        </li>");
            }
        ?>
        </ul>
        </div>
    </div>
</body>
</html>

