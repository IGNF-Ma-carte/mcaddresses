# Mes Adresses

### Organisation du code

**HTML**  
À la racine du projet : 
- ***index.html*** : point d'entrée de l'application.

Dans le dossier "pages" : 
- ***import_geocod.html*** : HTML pour la fenêtre d'import d'un fichier.
- ***import_preview.html*** : HTML pour la fenêtre de paramétrage et de prévisualisation du fichier à géocoder.
- ***unselect.html*** : HTML du bandeau de gauche quand aucune adresse n'est sélectionnée.
- ***address_select.html*** : HTML du bandeau de gauche à la sélection d'une adresse.
- ***alternative.html*** : HTML du bandeau de gauche pour la liste des alternatives d'une adresse.
- ***cluster.html*** : HTML du bandeau de gauche à la sélection d'un cluster d'adresses.
- ***manual_shift.html*** : HTML du bandeau de gauche pour le déplacement manuel d'une adresse.

**CSS**  
Dans le dossier "pages" : 
- ***dialogue.css*** : contient tout le CSS des fenêtres de dialogue.
- ***index.css*** : contient le css de la page de visualisation du géocodage.
- ***import_geocod.css*** : contient le css de la page d'import de fichier'.
- ***import_preview.css*** : contient le css de la page de prévisualisation du fichier importé et de paramétrage du géocodage'.

**JavaScript**  
Dans le dossier "src" :
- ***index.js*** : script chargé au démarrage de l'application.
- ***carte.js*** : création de la carte OpenLayers et des couches associées.
- ***colors.js*** : variable contenants les codes hexadécimaux des couleurs utilisées pour coder la qualité des adresses.
- ***help.js*** : contient les textes d'aide au format markdown.
- ***config.js*** : nécessaire pour la gestion de l'affichage des aides.

Dans le dossier "src/import" : 
- ***selectFile.js*** : contient toutes les fonctions pour la page de sélection d'un fichier à importer.
- ***preview.js*** : contient toutes les fonctions pour la prévisualisation du fichier à importer.
- ***parameters.js*** : contient toutes les fonctions pour le paramétrage du géocodage du fichier à importer.
- ***newImport.js*** : contient toutes les fonctions pour l'import d'un nouveau fichier (lorsqu'un premier géocodage a déjà eu lieu).

Dans le dossier "src/data" : 
- ***exemple.js*** : contient la chaîne de caractère correspondant au fichier exemple que l'utilisateur peut charger.

Dans le dossier "src/geocodage" :
- ***loader.js*** : contient toutes les fonctions pour gérer la patience lors d'un géocodage.
- ***requests.js*** : contient toutes les fonctions pour créer les requêtes à envoyer lors d'un géocodage ou d'un alticodage.
- ***geocode.js*** : contient toutes les fonctions pour le géocodage d'adresses.
- ***unitaryGeocode.js*** : contient toutes les fonctions pour le géocodage unitaire (géocodage d'une seul adresse).
- ***scoreWeighting.js*** : contient toutes les fonctions pour la pondération des scores renvoyés par l'API de géocodage.
- ***formatAddress.js*** : contient toutes les fonctions pour mettre les informations renvoyées par l'API de géocodage au format utilisé dans Mes Adresses.
- ***reverseGeocode.js*** : contient toutes les fonctions pour le géocodage inverse.
- ***alticodage.js*** : contient toutes les fonctions pour la récupération des altitudes des adresses.
- ***features.js*** : contient toutes les fonctions pour la création des features Openlayers et leur ajout dans ma carte.
- ***report.js*** : contient toutes les fonctions pour la création du rapport affiché à la fin d'un géocodage.

Dans le dossier "src/liste_adresses" : 
- ***createList.js*** : contient les fonctions la création de la liste des adresses géocodées affichée après un géocodage.
- ***listUpdate.js*** : contient les fonctions la mise à jour de la liste.
- ***resizeList.js*** : contient les fonctions pour les boutons permettant de masquer et agrandir/diminuer la liste.
- ***configList.js*** : contient les fonctions pour la configuration des champs affichés dans la liste.
- ***sortList.js*** : contient les fonctions pour trier la liste.
- ***selectAddress.js*** : contient les fonctions utilisées lors de la sélection d'une adresse dans la liste.

Dans le dossier "src/interactions" : 
- ***selectInteraction.js*** : fonctions pour la sélection d'une adresse sur la carte.
- ***selectIClusterInteraction.js*** : fonctions pour la sélection d'un cluster d'adresses sur la carte.
- ***unselectInteraction.js*** : fonctions pour la désélection d'une adresse ou d'un cluster d'adresses sur la carte.

Dans le dossier "src/modification_adresse" :
- ***deleteAddress.js*** : contient les fonctions la suppression d'une adresse.
- ***addAddress.js*** : contient les fonctions l'ajout d'une adresse.
- ***modifyAddress.js*** : contient les fonctions la modification d'une adresse.
- ***manualShift.js*** : contient les fonctions le déplacement manuel d'une adresse.
- ***alternatives.js*** : contient les fonctions choisir une alternative à une adresse.
- ***address_fct.js*** : contient des fonctions sur les adresses utilisées dans plusieurs autres fichiers javascript.

Dans le dossier "src/export" :
- ***export.js*** : contient les fonctions pour l'export csv/xlsx/kml/geojson du géocodage.







