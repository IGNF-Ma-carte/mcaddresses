import { geocodage } from "../geocodage/geocode";
import carte from "../carte";
import FeatureList from "ol-ext/control/FeatureList"
import { selectAddressAction } from "../interactions/selectInteraction";
import { getTempFeatureLayer } from "../carte";
import { setButtonConfig } from "./listConfig";
import { modifyInteraction, modifiedFeature, originalCoord } from "../modification_adresse/manuelShift";

/**
 * Création du FeatureList control
 */
let listCtrl;

  /**
   * Paramétrage de la liste
   */
let setList = function(){
    if(!listCtrl) {
        listCtrl = new FeatureList({
            title: 'Liste de géocodage',
            collapsed: false,
            target: document.getElementById("address_list")
        });

        carte.getMap().addControl (listCtrl);
        listCtrl.on("resize", onListResize);
        document.querySelector(".ol-scroll-container").onscroll = function() {setScoreClass(); listCtrl.resize();};
        listCtrl.on("select", function(e) {selectAddressListAction(e.feature)})
    }

    //Features associées à la liste
    listCtrl.setFeatures(geocodage.results.olFeatures);
    
    //ajout des colonnes
    listCtrl.setColumns(getColumns());

    //Tri sur les colonnes adéquats
    listCtrl.enableSort('#', 'Score');


    //Gestion du style des scores et affichage carte
    setScoreClass();

    //initilisation du bouton de paramétrage de la liste
    setButtonConfig();

    let height = listCtrl.element.clientHeight;
    document.querySelector("div[data-role='map']").style.bottom = height + "px";
    
};

/**
 * Retourne un tableau contenant le nom des colonnes de la liste 
 * @returns 
 */
let getColumns = function() {
    let columns = ["#", "Score", "Qualité", "Adresse géocodée"];
    if(geocodage.altitude) {
        columns.push("Altitude");
    }

    for(let i in geocodage.results.olFeatures[0]._data) {
        columns.push(i);
    }

    columns.push("Code INSEE");
    columns.push("Longitude");
    columns.push("Latitude");
    return columns;
};

/**
 * Gestion des classes pour l'affichage du score
 */
let setScoreClass = function() {
    let list = document.querySelector(".ol-feature-list table tbody");
    let score;
    let scoreIndex = -1;
    for(let i in list.children) {

        if(!list.children[i] || !list.children[i].children || !list.children[i].children[0]) {
            continue;
        }

        if(scoreIndex < 0) {
            for(let j in list.children[i].children) {
                if(list.children[i].children[j].attributes["data-prop"].value == "Score") {
                    scoreIndex = j;
                    break;
                }
            }
        }

        score = Number(list.children[i].children[scoreIndex].innerText);
        list.children[i].children[scoreIndex].innerHTML = "<span>" + score + "</span>";
        let elem = list.children[i].children[scoreIndex].children[0];
        if(score == 99) {
            elem.classList.add("white");
        }
        else if(score > 0.8) {
            elem.classList.add("green");
        }
        else if(score > 0.5) {
            elem.classList.add("yellow");
        }
        else if(score > 0) {
            elem.classList.add("orange");
        }
        else if( score > -1) {
            elem.classList.add("grey");
        }
    }
};

/**
 * Actions effectuées lors de la sélection d'une adresse dans la liste
 * @param {integer} ind : indice dans la liste de l'adresse sélectionnée
 */
const selectAddressListAction = function(feat) {
    if(feat.getGeometry()) {
        var coord = feat.getGeometry().getCoordinates();
        carte.getMap().getView().setZoom(16);
        carte.getMap().getView().setCenter(coord);
        
        getTempFeatureLayer().getSource().clear();
        getTempFeatureLayer().getSource().addFeature(feat);
        carte.getInteraction("select").getFeatures().clear();
        carte.getInteraction("select").getFeatures().push(feat);
    }
    else {
        getTempFeatureLayer().getSource().clear();
        carte.getMap().getView().setCenter([288074, 6247982]);
        carte.getMap().getView().setZoom(7);
        carte.getInteraction("select").getFeatures().clear();
        carte.getInteraction("select").getFeatures().push(feat);
    }
    if(modifiedFeature) {
        modifiedFeature.getGeometry().setCoordinates(originalCoord);
        carte.getInteraction("select").setActive(true);
        carte.getMap().removeInteraction(modifyInteraction);
    }
    
    selectAddressAction(feat);
};

/**
 * Fonction appelé à chaque fois que la liste d'adresse change de taille
 */
let onListResize = function() {
    //gestion affichage liste et carte
    let height = listCtrl.element.clientHeight;
    document.querySelector("div[data-role='map']").style.bottom = height + "px";
    carte.map.updateSize();
    //gestion style des scores
    setScoreClass();
} 

/**
 * Réinitialisation de la liste en cas de nouveau géocodage
 */
let clearListCtrl = function() {
    listCtrl.setFeatures(geocodage.results.olFeatures);
    let height = listCtrl.element.clientHeight;
    document.querySelector("div[data-role='map']").style.bottom = height + "px";
};

export {setList, listCtrl, selectAddressListAction, clearListCtrl};