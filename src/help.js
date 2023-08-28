export default {
//Aide import fichier
formats: `# Format de fichiers
-----
Ces données sont fournies dans un fichier de type tableur en founissant les informations (rue, code postal, commune) dans les colonnes du fichier.
Les formats acceptés sont les formats textes tabulés (CSV, TXT, TSV...) ou les formats tableurs (XLS, XLSX, ODS). Pour ces derniers, seul le premier onglet sera utilisé.
`,
//Aides onglets formatage fichier
separateur:
`
Vous pouvez visualiser la façon dont l'application lit le fichier chargé en bas de la fenêtre. 
Si les colonnes sont bien définies il ne faut pas modifier ce paramètre.
`,

formatage_3col:
`
Vos adresses sont définies dans 3 colonnes : Rue (incluant la numérotation), Code postal, Commune.
Exemple : 
| Rue | Code postal | Commune |
| --- | ----------- | ------- |
| 73 avenue Pasteur | 94160 | Saint-Mandé |
`,
formatage_1col:
`
Vos adresses sont définies dans 1 colonne.
Exemple : 
| Adresse |
| ------- |
|73 avenue Pasteur 94160 Saint-Mandé |
`,
formatage_parcel:
`
Vous géocodez à partir de l'identifiant cadastral unique de la parcelle 
Exemple :

| IDU parcelle |
| ------------ |
| 940670000D0050 |
`,
criteres:
`
Vous pouvez ajouter un critère département si vous en disposez. 
L'ajout de ce critère peut améliorer certains résultats.
`,
//Aides volet gauche à le selection d'une adresse
score: `# Score du géocodage
-----
Le score caractérise la qualité du géocodage, c'est un nombre compris entre 1 (excellent) et 0 (pas de correspondance trouvée).
Plus le score est élévé plus le résultat fourni est statistiquement fiable.
Après un déplacement manuel du point, la valeur du score passe à -1 et apparaît avec un tiret dans l'interface.
`,
qualite: `# Qualité du géocodage
-----
Le géocodage (placement du point adresse) se fait selon un algorithme qui peut utiliser différentes sources de données : parcelles, points d'intérêt ou adresses.
Dans ce dernier cas l'algorithme place au mieux le point par valeur de précision croissante au centre du département, de la commune ou de la rue (dans sa longueur), ou à la plaque adresse.
Après un déplacement manuel du point, la valeur de la qualité prend la valeur "Manuel".
Le tableau ci-dessous récapitule les possibilités.

| Qualité         | Signification                  |
|-----------------|--------------------------------|
| Parcelle        | Placé par numéro de parcelle   |
| Point d'intérêt | Placé sur un point d'intérêt   |
| Département     | Placé au centre du département |
| Ville           | Placé au centre d'une commune  |
| Rue             | Placé au milieu d'une rue      |
| Numéro          | Placé au numéro d'adresse      |
| Manuel          | Placé manuellement             |
`,
adresse_geoc: `# Adresses géocodée
-----
L'adresse géocodée correspond à l'adresse identifiée comme la plus ressemblante à l'adresse fournie. C'est l'adresse qui correspond aux coordonnées transmises par le géocodage.
`,
adresses_alt: `# Adresses alternatives
-----
Selon les cas, l'algorithme peut fournir plusieurs adresses identifiées comme ressemblantes en supplément de l'adresse géocodée.
Il peut alors être intéressant de les parcourir pour vair si une de ses adresses n'est pas plus pertienente pour notre géocodage.
`,
info_geocode: `# Geocoder un fichier
-----
Le géocodage est le processus qui permet de déterminer les coordonnées géographique d'un lieu (longitude, latitude) à partir de sa description (une adresse, un nom de lieu, un numéro de parcelle cadastrale...).
Ces données sont fournies dans un fichier de type tableur en founissant les informations (rue, code postal, commune) dans les colonnes du fichier.
Les emplacements obtenus en sortie sont des entités géographiques avec les attributs présents dans le fichier de départ avec des informations supplémentaires qui donne l'adresse trouvée lors du géocodage ou la précision de celui-ci.
`
}