import { createList } from "./createList";
import { listSelectedIndex } from "./createList";
import { geocodage } from "../geocodage/geocode";

/**
 * Actions pour les colonnes pouvant être utilisées pour trier la liste
 */
const setSortableColumnsEvent = function() {
    if(document.getElementById("score_list_header")) {
        document.getElementById("score_list_header").addEventListener("click", () => {
            setSortClassInListheader("score");
            createList("score", getSortIndex("score"));
            if(listSelectedIndex > -1) {
                document.getElementById("address" + listSelectedIndex).classList.toggle("selected");
                document.getElementById("address" + listSelectedIndex).scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }
    
    if(document.getElementById("index_list_header")) {
        document.getElementById("index_list_header").addEventListener("click", () => {
            setSortClassInListheader("index");
            createList("index", getSortIndex("index"));
            if(listSelectedIndex > -1) {
                document.getElementById("address" + listSelectedIndex).classList.toggle("selected");
                document.getElementById("address" + listSelectedIndex).scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }
};

/**
 * Gère les classes dans le header de la liste d'adresses en fonction de la colonne sur laquelle est effectué le tri de la liste
 * @param {string} sortedElement: la colonne sur laquelle le tri est effectué 
 */
 const setSortClassInListheader = function(sortedElement) {
    var elemArray = ["score", "index"];
 
     for(var i in elemArray) {
         var className = elemArray[i] + "_list_header";
         if(elemArray[i] == sortedElement) {
             if(document.getElementById(className) 
                 && (document.getElementById(className).classList.contains("descending") || document.getElementById(className).classList.contains("ascending"))) {
                 document.getElementById(className).classList.toggle("descending");
                 document.getElementById(className).classList.toggle("ascending");
             }
             else if (document.getElementById(className)) {
                 document.getElementById(className).classList.toggle("descending");
             }
         }
         else if(document.getElementById(className)){
             if(document.getElementById(className).classList.contains("descending")) {
                 document.getElementById(className).classList.toggle("descending");
             }
             if(document.getElementById(className).classList.contains("ascending")) {
                 document.getElementById(className).classList.toggle("ascending");
             }
         }
     }
 };

 /**
 * Renvoie les index triés de la liste
 * @param {string} elem: la colonne sur laquelle le tri est effectué 
 * @returns 
 */
const getSortIndex = function(elem) {
    var sortIndex;
    if(elem == "score") {
        var scoreAndIndexArray = [];
        for(let i in geocodage.results.olFeatures) {
            scoreAndIndexArray.push([geocodage.results.olFeatures[i].get("properties")._score, geocodage.getFeatureIndex(geocodage.results.olFeatures[i])]);
        }

        if(document.getElementById("score_list_header").classList.contains("descending")) {
            scoreAndIndexArray.sort(function(a, b) {
                return b[0]-a[0];
            });
        }
        else {
            scoreAndIndexArray.sort(function(a, b) {
                return a[0]-b[0];
            });
        }
        sortIndex = [];
        for(let i in scoreAndIndexArray) {
            sortIndex.push(scoreAndIndexArray[i][1]);
        }
        return sortIndex;
    }

    if(elem == "index") {
        sortIndex = [];
        for(let i in geocodage.results.olFeatures) {
            sortIndex.push(geocodage.getFeatureIndex(geocodage.results.olFeatures[i]));
        }
        if(document.getElementById("index_list_header").classList.contains("descending")) {
            sortIndex.sort(function(a, b) {
                return b-a;
            });
        }
        else {
            sortIndex.sort(function(a, b) {
                return a-b;
            });
        }
        return sortIndex;
    }
};

export {setSortableColumnsEvent, getSortIndex};