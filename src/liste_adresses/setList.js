import { geocodage } from "../geocodage/geocode";
import carte from "../carte";
import FeatureList from "ol-ext/control/FeatureList"
import { selectAddressAction } from "../interactions/selectInteraction";
import { getTempFeatureLayer } from "../carte";
import { setButtonConfig } from "./listConfig";

/**
 * Création du FeatureList control
 */
let listCtrl = new FeatureList({
    title: 'Liste de géocodage',
    collapsed: false,
    target: document.getElementById("address_list")
  });

  /**
   * Paramétrage de la liste
   */
let setList = function(){
    //Features associées à la liste
    listCtrl.setFeatures(geocodage.results.olFeatures);
    //ajout du control dans la carte
    carte.getMap().addControl (listCtrl);
    //ajout des colonnes
    listCtrl.setColumns(getColumns());
    //Tri sur les colonnes adéquats
    listCtrl.enableSort('#', 'Score');
    //Gestion du style des scores et affichage carte
    setScoreClass();
    listCtrl.on("resize", onListResize);
    document.querySelector(".ol-scroll-container").onscroll = function() {setScoreClass(); listCtrl.resize();};
    //Action à la sélection
    listCtrl.on("select", function(e) {selectAddressListAction(e.feature)})
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

    for(let i in geocodage.results.olFeatures[0].get("data")) {
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
    for(let i in list.children) {
        if(!list.children[i] || !list.children[i].children || !list.children[i].children[1]) {
            continue;
        }
        score = Number(list.children[i].children[1].innerText);
        list.children[i].children[1].innerHTML = "<span>" + score + "</span>";
        if(score == 99) {
            list.children[i].children[1].children[0].classList.add("white");
        }
        else if(score > 0.8) {
            list.children[i].children[1].children[0].classList.add("green");
        }
        else if(score > 0.5) {
            list.children[i].children[1].children[0].classList.add("yellow");
        }
        else if(score > 0) {
            list.children[i].children[1].children[0].classList.add("orange");
        }
        else if( score > -1) {
            list.children[i].children[1].children[0].classList.add("grey");
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

export {setList, listCtrl};