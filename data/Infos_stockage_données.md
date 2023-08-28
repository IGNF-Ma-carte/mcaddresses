### Stockage des données dans l'application

***Données liées au parsage du fichier importé par l'utilisateur***
Le parsage est effectué via [Papa Parse](https://www.papaparse.com/). Les données sont stockées dans la variable globale ***"parseResults"*** qui possède les attributs suivants : 

- ***parseResults.meta*** : fournit par Papa Parse, contient les métadonnées du parsage, notamment le délimiteur utilisé.
- ***parseResults.data*** : fournit par Papa Parse. Tableau de tableau. Les éléments du premier tableau correspondent aux lignes du fichier parsé. Les éléments du deuxième tableau correspondent aux colonnes du fichier.
- ***parseResults.error*** : fournit par Papa Parse, contient des informations sur les erreurs éventuellement rencontrées lors du parsage.
- ***parseResults.header*** : tableau stockant les valeurs de chaque colonne du header.
- ***parseResults.startLine*** : le numéro de ligne à partir duquel le fichier importé par l'utilisateur doit être lu (les lignes précédentes ne sont donc pas présentes dans *parseResults.data*).
- ***parseResults.endLine*** : le numéro de ligne auquel le fichier importé par l'utilisateur doit arrêter d'être lu (les lignes suivantes ne sont donc pas présentes dans *parseResults.data*).
- ***parseResults.ignore*** : chaîne de caractère. Toutes les lignes du fichier parsé commençant par cette chaîne de caractère ont été ignorées (et ne sont donc pas présentes dans *parseResults.data*).
- ***parseResults.columnCorrespondance*** : indique l'index des colonnes contenant les informations nécessaires au géocodage.  
Par exemple, si *parseResults.columnCorrespondance["[Code Postal"]=3*, cela signifie que la 3ème colonne de chaque ligne du fichier contient le code postal de l'adresse.

***Données liées au géocodage des adresses du fichier importé par l'utilisateur***
Les données sont stockées dans la variable globale ***"geocodage"*** qui possède les attributs suivants : 
- ***geocodage.packLength*** : le nombre de requêtes envoyées simultanément lors du géocodage.
- ***geocodage.totalSeconds*** : nombre de secondes écoulées depuis le début du géocodage. Utilisé pendant le géocodage pour gérer l'estimation du temps restant avant la fin.
- ***geocodage.currentPack*** : utilisé pendant le géocodage pour savoir où on en est dans les paquets de requêtes envoyés.
- ***geocodage.altitude*** : booléen pour savoir si il faut récupérer les altitudes des points géocodés (alticodage).
- ***geocodage.altiCurrentPack*** : le cas échéant, utilisé pendant l'alticodage pour savoir où on en est dans les paquets de requêtes envoyés.
- ***geocodage.altitudeArray*** : le cas échéant, stocke l'altitude des points géocodés.
- ***geocodage.results.tryAgain*** : utilisé pendant le géocodage pour stocker les adresses pour lesquelles de nouvelles requêtes vont être faites afin d'améliorer le résultat.
- ***geocodage.results.apiFeatures*** : tableau contenant, pour chaque adresse, les informations de la réponse renvoyée par l'api de géocodage dont le score est le plus élevé (après traitement dans l'application).
- ***geocodage.results.olFeatures*** : tableau contenant, pour chaque adresse, la feature au sens OpenLayers correspondant à sa feature associée dans *geocodage.results.apiFeatures*.  
Une feature OpenLayers contient un attribut *properties* stockant les propriétés de la feature associée dans *geocodage.results.apiFeatures*, un attribut *data* contenant les données de *parseResults.data* correspondant à la feature et un attribut *alternatives* contenant les features Openlayers des alternatives de l'adresse.