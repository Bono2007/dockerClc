<?php
	class Zipper extends ZipArchive { 
		public function addDir($path) {  
			$this->addEmptyDir($path); 
			$nodes = glob($path . '/*'); 
			foreach ($nodes as $node) { 
				//print $node . '<br>'; 
				if (is_dir($node)) { 
					$this->addDir($node); 
				} else if (is_file($node))  { 
					$this->addFile($node); 
				} 
			}
		}
	}
	
	$exoName = $_GET["name"];
	$fichier_zip="../tmp/".$exoName.".zip";
	//si le fichier existe déjà dans /temp on le supprime
	if (file_exists($fichier_zip)) {
		unlink($fichier_zip);
	}
	
	if( $exoName == "framework" ) {
		//creation du fichier dans ../tmp
		$zip = new Zipper();
		$res = $zip->open($fichier_zip, ZipArchive::CREATE);
		$zip->addDir("clc");
		$zip->addDir("lib-externes");
		$zip->addFile("index.css");
		$zip->addFile("index.js");
		$zip->addFile("index.php");
		$zip->addFile("telecharger_sources.php");
		$zip->close();
		//on telecharge le fichier zip
		header("Content-type: application/zip");
		header("Content-Disposition: attachment; filename=\"calculatice-js.zip\"");
		readfile($fichier_zip);
	}
	else{
		//creation du fichier dans ../tmp
		$zip = new Zipper();
		$res = $zip->open($fichier_zip, ZipArchive::CREATE);
		chdir("exercices");
		$zip->addDir($exoName);
		$zip->close();
		chdir("..");
		//on telecharge le fichier zip
		
		header("Content-type: application/zip");
		header("Content-Disposition: attachment; filename=\"".$exoName.".zip\"");
		readfile($fichier_zip);
	
	}
?>
