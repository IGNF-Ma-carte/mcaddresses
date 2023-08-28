# Mes Adresses

### Informations sur le géocodage dans l'application

L'application utilise la version bêta du [nouveau service de géocodage de l'IGN](https://geoservices.ign.fr/documentation/services/api-et-services-ogc/service-de-geocodage-beta-20).

L'adresse fournit par l'utilisateur peut être légèrement reformatée afin d'obtenir un meilleur résultat : 
- Les informations de type "CEDEX" et "BP" - quelle que soit la casse ; suivi de chiffres ou non - sont enlevées.
- Les abrévations "r." ou "r", "av." ou "av" et "bd." ou "bd" - quelle que soit la casse - sont remplacées respectivement pas "rue", "avenue" et "boulevard".

Afin de chercher le meilleur résultat, jusqu'à quatre requêtes peuvent être faites pour une adresse.  
***Première requête***  
Une requête de type *"address"* est envoyée.  
Exemple : [https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le Jardin Alpin 73120 Saint-Bon-Tarentaise&index=address](https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le%20Jardin%20Alpin%2073120%20Saint-Bon-Tarentaise&index=address)  
Chaque réponse contient entre 0 et 10 résultats classés par score décroissant (score compris entre 0 et 1).  
Les scores sont tous pondérés par l'application selon les règles suivantes:
- Si le département du résultat est différent du département de l'adresse en entrée, le score est pondéré d'un facteur 0.4.
- Si le département est correct mais que le code postal est différent, le score est pondéré d'un facteur 0.8.

***Deuxième requête***  
Le service de géocodage est extrêmement sensible à une erreur de code postal mais fonctionne très bien sans code postal si la commune est correctement renseignée.
Du coup, si le score (après pondération) du meilleur résultat obtenu avec la première requête est inférieur à 0.8, une requête identique mais sans le code postal est envoyée.  
Exemple : [https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le Jardin Alpin Saint-Bon-Tarentaise&index=address](https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le%20Jardin%20Alpin%20Saint-Bon-Tarentaise&index=address)  
Les résultats sont traités de la même manière que pour la première requête.

***Troisième requête***  
Si le score (après pondération) du meilleur résultat obtenu avec la première requête est inférieur à 0.8, une requête identique mais de type *"poi"* est envoyée.  
Exemple : [https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le Jardin Alpin 73120 Saint-Bon-Tarentaise&index=poi](https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le%20Jardin%20Alpin%2073120%20Saint-Bon-Tarentaise&index=poi)  
Les résultats sont traités de la même manière que pour la première requête.

***Quatrième requête***  
Si le score du meilleur résultat est toujours inférieur à 0.8 et que son attribut *"city"* est diférent de la commune indiquée dans l'adresse de départ, une requête de type *"address"* est envoyée en remplaçant la commune de départ par celle de l'attribut *"city"*.  
Exemple : [https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le Jardin Alpin 73120 Courchevel&index=address](https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=Le%20Jardin%20Alpin%2073120%20Courchevel&index=address)  
Les résultats sont traités de la même manière que pour les requêtes précédentes.

Une fois la ou les requêtes effectuées, le meilleur résultat est conservé. Un attribut *"alternatives"*, contenant tous les résultats ayant un score supérieur à 80% du meilleur score, lui est ajouté.

Dans l'application, les requêtes sont envoyées par packet de 100.
