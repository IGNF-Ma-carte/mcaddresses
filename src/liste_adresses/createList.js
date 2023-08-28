import { geocodage } from "../geocodage/geocode";
import { getColorClass } from "../modification_adresse/address_fct";
import { toLonLat } from 'ol/proj';
import { getAddressLabelFromFeat } from "../geocodage/features";
import { setResizeButtonEvent } from "./resizeList";
import { setConfigButtonsEvent } from "./listConfig";
import { setSortableColumnsEvent, getSortIndex } from "./sortList";
import { selectAdressListEvent } from "./selectAddress";
import { isParcel } from "../modification_adresse/address_fct";

var listSelectedIndex = -1;

/**
 * Met à jour la variable "listSelectedIndex"
 * @param {} val 
 */
var setListSelectedIndex = function(val) {
    listSelectedIndex = val;
}

var listHeader;
/**
 * Met à jour la variable "listHeader"
 * @param {*} val 
 */
var setListHeader = function(val) {
  listHeader = val;
};
var listHeaderShow = [];
/**
 * Met à jour la variable "listHeaderShow"
 * @param {} val 
 */
var setListHeaderShow = function(val) {
  listHeaderShow = val;
};

/**
 * Création de la liste d'adresse
 * @param {string} sortElem : élément à trier
 * @param {array} sortIndex : array des indices triés (uniquement si sort=true)
 */
 const createList = function(sortElem, sortIndex) {
    if(!sortElem && !sortIndex) {
        if(document.getElementById("index_list_header") 
            && (document.getElementById("index_list_header").classList.contains("descending") || document.getElementById("index_list_header").classList.contains("ascending"))){
            sortElem = "index";
            sortIndex = getSortIndex("index");
        }
        if(document.getElementById("score_list_header") 
            && (document.getElementById("score_list_header").classList.contains("descending") || document.getElementById("score_list_header").classList.contains("ascending"))){
            sortElem = "score";
            sortIndex = getSortIndex("score");
        }
    }

    var html = "<div id='list_title'><span>Liste de géocodage </span>";
    html += "<i id='hide_or_show_list_button' class='fi-minus'></i>";
    html += "<i id='expand_or_compress_button' class='fi-maximize'></i>";
    html += "<i id='list_config'class='fi-configuration' title='Affichage des colonnes'></i></div>";
    html += "<div id='scroll_list_div'><table id='address_table'>";
    html += getListHeaderHtml(sortElem);
    html += "</thead><tbody>";

    for(let i in geocodage.results.olFeatures) {
        var ind = i;
        if(sortElem) {
            ind = sortIndex[i];
        }
        var olFeature = geocodage.results.olFeatures[ind];
        var data = [];
        for(let j in olFeature.get("data")) {
            data.push(olFeature.get("data")[j]);
        }

        html += "<tr id='address" + Number(ind).toString() + "'><td class='lightgrey'>" + (Number(ind) + 1) + "</td>";

        var scoreClassName = getColorClass(olFeature.get("properties")._score);
        var scoreInSpan = Math.round(olFeature.get("properties")._score*100)/100;
        if(scoreClassName == "white") {
            scoreInSpan = "-";
        }
        html += getCellHtml(0, scoreInSpan, scoreClassName);

        var qual = olFeature.get("properties").quality||"";
        html += getCellHtml(1, qual);

        html += getCellHtml(2, getAddressLabelFromFeat(olFeature));

        if(geocodage.altitude) {
            html += getCellHtml(3, olFeature.get("properties").altitude);
        }

        var adjust = 3;
        if(geocodage.altitude) {
            adjust++;
        }

        for (var j in data) {
            html += getCellHtml(Number(j)+adjust, data[j]);
        }

        html += getCellHtml(listHeaderShow.length-3, olFeature.get("properties").inseeCode?olFeature.get("properties").inseeCode:"");

        var lonlat = ["",""];
        if(olFeature.getGeometry())
        {
            lonlat = toLonLat(olFeature.getGeometry().getCoordinates());
        }
        var lon = "";
        if(lonlat[0]) {
            lon = Math.round(lonlat[0]*1000)/1000;
        }
        var lat = "";
        if(lonlat[1]) {
            lat = Math.round(lonlat[1]*1000)/1000;
        }

        html += getCellHtml(listHeaderShow.length-2, lon);
        html += getCellHtml(listHeaderShow.length-1, lat);

        html += "</tr>";
    }

    html += "</tbody> </table></div>";

    document.getElementById("address_list").innerHTML = html;
    if(!document.body.classList.contains("list")) {
        document.body.classList.toggle("list");
    }
    
    if(listSelectedIndex == -1) {
        document.getElementById("address_table").children[1].children[0].scrollIntoView({behavior: "smooth", block: "center"});
    } 
    
    setTimeout(() => carte.getMap().updateSize(), 300);

    setResizeButtonEvent();
    setConfigButtonsEvent();

    for(let i = 0; i < document.getElementById("address_table").children[1].children.length; i++) {
        selectAdressListEvent(document.getElementById("address_table").children[1].children[i]);
    }

    setSortableColumnsEvent();
};

/**
 * Renvoie le html pour le header de la liste d'adresses
 * @param {string} sortElem : colonne sur laquelle la liste est triée
 * @returns 
 */
const getListHeaderHtml = function(sortElem) {
    var html = "<thead class='header'>";
    var header = listHeader.slice();
    header.unshift("#");

    for (let i in header) {
        if(i > 0 && !listHeaderShow[i-1]){
            continue;
        }
        var sortIcon = "";
        if(header[i] == "#") {
            html += "<th id='index_list_header' class='sortable";
            sortIcon = "<i class='fa fa-sort'></i>";
            if(sortElem == "index") {
                sortIcon = "<i class='fi fi-arrow-down'></i>";
                if(document.getElementById("index_list_header").classList.contains("descending")) {
                    html += " descending";
                }
                else {
                    html += " ascending";
                }
            }
            html += "'>";
        }
        else if(header[i] == "Score") {
            html += "<th id='score_list_header' class='sortable";
            sortIcon = "<i class='fa fa-sort'></i>";
            if(sortElem == "score") {
                sortIcon = "<i class='fi fi-arrow-down'></i>";
                if(document.getElementById("score_list_header").classList.contains("descending")) {
                    html += " descending";
                }
                else {
                    html += " ascending";
                }
            }
            html += "'>";
        }
        else {
            html += "<th>";
        }
        html += header[i] + sortIcon +"</th>";
    }
    return html;
};

const getCellHtml = function(columnIndex, val, className) {
    var html = "";
    var c = "";
    if(className){
        c = ' class="'+ className + '"';
    }
    if(listHeaderShow[columnIndex]) {
        html += "<td><span"  + c + ">" + val + "</span></td>";
    }
    return html;
};

export {listSelectedIndex, setListSelectedIndex, listHeader, listHeaderShow, setListHeader, setListHeaderShow, createList};