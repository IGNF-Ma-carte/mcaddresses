import helpDialog from "mcutils/dialog/helpDialog";
import { parseResults, clearImportedFile, importedFile } from "./selectFile";
import { geocodage, geocode } from "../geocodage/geocode";
import { createRequestListByPack } from "../geocodage/requests";
import carte from "../carte";
import { setGeocodePatience } from "../geocodage/loader";
import { actionWindow } from "./selectFile";
import { setFileLineSectionEvents, addOptionsToSelect, setSeparatorSectionEvents, setColumnSectionEvents, setCityFilterEvent } from "./parameters";
import {setRequestListByPack } from "../geocodage/requests";
import helpStr from '../help';
import CSVPreview from "mcutils/control/CSVPreview";
import SearchGeoportail from "ol-ext/control/SearchGeoportail";
import preview_html from '../../pages/import_preview-page.html';
import import_geocod_html from '../../pages/import_geocod-page.html';

var csvp;
/**
 * Crée la fenêtre de prévisualisation et de configuration du fichier
 */
const preview = function (csv) {
    //Affichage du dialogue
    document.getElementById("action_div").innerHTML = preview_html
    + "<div id='bottom_buttons'><button class='button button-colored' type='button' id='csv_load'>Géocoder</button><button class='button button-ghost' type='button' id='csv_cancel'>Annuler</button></div>";
    document.getElementById("action_div").classList.toggle("import");
    document.getElementById("action_div").classList.toggle("preview");
  
    document.getElementById("action_div").querySelectorAll('[data-help]').forEach(elt => {
        const h = elt.dataset.help;
        helpDialog(elt, helpStr[h], { className: h });
    });

    var search = new SearchGeoportail({
        className : "hidden",
        target : document.getElementById("citySearch"),
        reverse: true
      });
    carte.map.addControl (search);
    search.on("select", function(e) {
        document.getElementById("cityName").innerText = e.search.fulltext;
        geocodage.pointFilter = e.coordinate;
    })
  
    addOptionsToSelect();
  
    setSeparatorSectionEvents();
    setFileLineSectionEvents();
    setColumnSectionEvents();
    setCityFilterEvent();

    csvp = new CSVPreview({
        target: document.getElementById("preview"),
        csv: csv,
        nbLines: 4,
        line: true,
        header: true
    });
    csvp.setProperties({skipEmptyLines: true, header:document.getElementById("first_line").checked });
    csvp.showData(csvp.getProperties());
    document.getElementById("colPlusBtn").click();
  
    //Event lancement du géocodage
    document.getElementById("csv_load").addEventListener("click", () => {
        if (!parseResults.columnCorrespondance["[Numéro de parcelle]"]
        && !parseResults.columnCorrespondance["[Adresse complète]"]
        && (!parseResults.columnCorrespondance["[Rue]"] || !parseResults.columnCorrespondance["[Code postal]"] || !parseResults.columnCorrespondance["[Commune]"])
        ) {
            alert("Vous devez indiquer les colonnes de votre fichier permettant de géocoder vos adresses dans l'onglet 'Choix des colonnes du fichier'.");
            return;
        }
  
        // if (parseResults.startLine && parseResults.endLine && parseResults.endLine < parseResults.startLine) {
        //     alert("Incohérence dans les lignes de début et de fin de lecture du fichier dans l'onglet 'Choix des lignes du fichier'.");
        //     return;
        // }
  
        var gType = "address";
        if (parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
            gType = "parcel";
        }

        if (document.getElementById("altitude").checked) {
            geocodage.altitude = true;
        }

        if(document.getElementById("trueGeometry").checked) {
            geocodage.trueGeometry = true;
        }

        if(!document.getElementById("cityFilter").checked) {
            geocodage.pointFilter = null;
        }


        // if(parseResults.endLine) {
        //     parseResults.data.splice(parseResults.endLine, parseResults.data.length -1);
        // }
        if(parseResults.startLine) {
            parseResults.data.splice(0, parseResults.startLine-1);
        }
    
        if(parseResults.ignore) {
            for(var i = parseResults.data.length -1 ; i>-1; i--) {
            var regexp = new RegExp("^" + parseResults.ignore, "g");
            if(parseResults.data[i][0].match(regexp)) {
                parseResults.data.splice(i,1);
            }
            }
        }
        
        setRequestListByPack(createRequestListByPack(parseResults.data, gType));
    
        geocodage.currentPack = 0;
        geocodage.altiCurrentPack = 0;
        geocodage.type = gType;
    
        document.getElementById("action_div").classList.toggle("hidden");
        document.body.querySelectorAll('[data-role]').forEach(elt => { //eslint-disable-line sonarjs/no-identical-functions
            if (elt.dataset.role == "map" || elt.dataset.role == "toolBar") {
            elt.classList.toggle("hidden");
            }
        });
        carte.getMap().updateSize()
        setGeocodePatience();
        geocode();
    });
  
    //Event annulation du géocodage
    document.getElementById("csv_cancel").addEventListener("click", () => {
        document.getElementById("action_div").innerHTML = import_geocod_html;
        document.getElementById("action_div").classList.toggle("import");
        document.getElementById("action_div").classList.toggle("preview");
        clearImportedFile();
        actionWindow();
    });
  };

/**
 * Réinitialise la variable parseResults.columnCorrespondance ainsi que l'apparence de la fenêtre de prévisualisation 
 */
const resetColumnCorresp = function () {
    var selIdArray = ["name_select", "name_select_bis", "name_select_ter", "street_select", "postal_code_select", "city_select", "address_select", "parcel_select"];
  
    for (var i in selIdArray) {
        const sel = document.getElementById(selIdArray[i]);
        sel.value = "";
        if (sel.classList.contains("ok")) {
            sel.classList.remove("ok");
        }
    }
    parseResults.columnCorrespondance["[Nom]"] = 0;
    parseResults.columnCorrespondance["[Rue]"] = 0;
    parseResults.columnCorrespondance["[Code postal]"] = 0;
    parseResults.columnCorrespondance["[Commune]"] = 0;
    parseResults.columnCorrespondance["[Adresse complète]"] = 0;
    parseResults.columnCorrespondance["[Numéro de parcelle]"] = 0;
    setHeaderSelect();
};
  
/**
 * Màj de l'aspect de la prévisualisation lorsqu'un champ est sélectionné/déselectionné dans une liste déroulante
 */
const setHeaderSelect = function () {

    csvp.showData(csvp.getProperties());
    var trElem = document.getElementById("preview").children[0].children[0].children[0];
    var cr = parseResults.columnCorrespondance;
    var nbCol;
    var str;
  
    for (var i in cr) {
        if (!cr[i]) {
            continue;
        }
        str = "";
        nbCol = cr[i];
        str += i;
        for (var j in cr) {
            if (j == i) {
            continue;
            }
            if (cr[i] == cr[j]) {
            str += "; " + j;
            }
        }
        trElem.children[nbCol].innerHTML = str.replace(/\]$/, "").replace(/^\[/, "");
        if (!trElem.children[nbCol].classList.contains("selected")) {
            trElem.children[nbCol].classList.toggle("selected");
        }
    }
};

export {csvp, preview, resetColumnCorresp, setHeaderSelect};