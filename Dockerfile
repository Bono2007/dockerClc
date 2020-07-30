
# --------------- DÉBUT COUCHE OS -------------------
FROM php:7.4-apache
# --------------- FIN COUCHE OS ---------------------
# MÉTADONNÉES DE L'IMAGE
LABEL version="1.0" maintainer="Laurent LASSALLE CARRERE <llc314159@gmail.com>"

# --------------- DÉBUT GIT CLONE ---------------
RUN apt-get update -y && \
    apt-get install -q -y git && \
    git clone https://github.com/Bono2007/dockerClc /var/www/html && \
    rm -f /var/www/html/index.html && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
# --------------- FIN GIT CLONE -----------------

# VOLUME POUR exercices
VOLUME /var/www/html/exercices

# OUVERTURE DU PORT HTTP
EXPOSE 80

# RÉPERTOIRE DE TRAVAIL
WORKDIR  /var/www/html

# DÉMARRAGE DES SERVICES LORS DE L'EXÉCUTION DE L'IMAGE
ENTRYPOINT apache2ctl -D FOREGROUND


