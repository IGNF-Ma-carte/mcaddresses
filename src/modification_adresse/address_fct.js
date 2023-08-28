import { parseResults } from "../import/selectFile";
import carte from "../carte";
import { modifyFeature } from "./modifyAddress";
import { showAlternatives } from "./alternatives";
import { removeFeature } from "./deleteAddress";
import { manualShiftValidation, manualShifting } from "./manuelShift";
import { getSelectedFeature, selectAddressAction } from "../interactions/selectInteraction";
import helpDialog from "mcutils/dialog/helpDialog";
import helpStr from '../help'
import address_select_html from '../../pages/address_select.html'
import alternative_html from '../../pages/alternative.html'
import cluster_html from '../../pages/cluster.html'
import unselect_html from '../../pages/unselect.html'
import manual_shift_html from '../../pages/manual_shift.html'

const addFormInputsListeners = function() {
    document.getElementById("form").querySelectorAll("input").forEach(elt => {
        elt.addEventListener("change", () => {
            document.getElementById("form").querySelectorAll("label").forEach(elt2 => {
                if(elt2.attributes.for.value == elt.id) {
                    if(elt.value != "")
                    {
                        if(!elt2.classList.contains("valid")) {
                            elt2.classList.add("valid");
                        }
                    }
                    else {
                        if(elt2.classList.contains("valid")) {
                            elt2.classList.remove("valid");
                        }
                    }
                }
            });
        });
    });
};

/**
 * Gestion des focus
 * @param {*} elt : élément sur lequel gérer les focus
 */
const addFocusListeners = function(elt) {
    elt.addEventListener("focusin", () => { //eslint-disable-line sonarjs/no-identical-functions
        if(!elt.classList.contains("focus")) {
            elt.classList.add("focus");
        }
    });
    elt.addEventListener("focusout", () => { //eslint-disable-line sonarjs/no-identical-functions
        if(elt.classList.contains("focus")) {
            elt.classList.remove("focus");
        }
    });
};

/**
 * Renvoie un nom de classe en fonction du score d'une feautre
 * @param {double} score 
 * @returns {string} Le nom de la classe
 */
const getColorClass = function(score) {
    var colorClass;
    if(score == 99) {
        colorClass = "white";
    }
    else if(score > 0.8) {
        colorClass = "green";
    }
    else if(score > 0.5) {
        colorClass = "yellow";
    }
    else if(score > 0) {
        colorClass = "orange";
    }
    else if( score > -1) {
        colorClass = "grey";
    }
    return colorClass;
};

/**
 * Teste si tous les champs obligatoires du formulaire ont été renseignés
 * @returns 
 */
 const alertRequired = function() {
    var isok = true;
    document.getElementById("form").querySelectorAll("input").forEach(elt => {
        if(elt.required && elt.value == "") {
            isok = false;
        }
    });
    return isok;
};

/**
 * Renvoie l'indice des champs utilisés pour géocoder dans les données parsées
 * @returns {array}
 */
 const getRequiredIndex = function() {
    var requiredIndex = [];

    if(parseResults.columnCorrespondance["[Adresse complète]"]) {
        requiredIndex.push(parseResults.columnCorrespondance["[Adresse complète]"]);
    }
    else if(parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
        requiredIndex.push(parseResults.columnCorrespondance["[Numéro de parcelle]"]);
    }
    else {
        requiredIndex.push(parseResults.columnCorrespondance["[Rue]"]);
        requiredIndex.push(parseResults.columnCorrespondance["[Code postal]"]);
        requiredIndex.push(parseResults.columnCorrespondance["[Commune]"]);
    }
    return requiredIndex;
};

/**
 * Renvoie le html du formulaire de modification d'une adresse et de l'ajout d'une adresse
 * @param {object} feat : la feature associée à l'adresse modifiée (si vide => on est dans le cas d'un ajout d'adresse)
 * @returns {string} le html du formulaire
 */
 const getAddressForm = function(feat) {
    var requiredIndex = getRequiredIndex();
    var adjust = 0;

    var html = '<div id="form">';

    if(parseResults.columnCorrespondance["[Nom]"]) {
        html += '<p><label class="input-placeholder isok focus" for="input0">';
        html += '<input type="text" class="input-placeholder" id="input0"';
        if(feat) {
            html+= ' value="' + feat.get("data")[parseResults.header[parseResults.columnCorrespondance["[Nom]"]-1]] + '"';
        }
        html += '><span>' + parseResults.header[parseResults.columnCorrespondance["[Nom]"]-1] + '</span></label></p>';
        adjust++;
    }

    var count = 0;
    for(let i in requiredIndex) {
        for(var j in parseResults.header) {
            if(j==requiredIndex[i]-1) {
                html += '<p><label class="input-placeholder isok';
                if(count+adjust == 0) {
                    html += " focus";
                }
                html += '" for="input' + (count + adjust).toString() +'">';
                html += '<input type="text" class="input-placeholder" required id="input' + (count + adjust).toString() + '"';

                if(feat) {
                    html += ' value="' + feat.get("data")[parseResults.header[j]];
                }

                html += '"><span>' + parseResults.header[j] + '</span></label></p>';

                count++;
                break;        
            }
        }
    }

    if(parseResults.columnCorrespondance["[Département]"]) {
        html += '<p><label class="input-placeholder isok focus" for="input' + (count+adjust).toString() + '">';
        html += '<input type="text" class="input-placeholder" id="input' + (count+adjust).toString() + '"';
        if(feat) {
            html+= ' value="' + feat.get("data")[parseResults.header[parseResults.columnCorrespondance["[Département]"]-1]] + '"';
        }
        html += '><span>' + parseResults.header[parseResults.columnCorrespondance["[Département]"]-1] + '</span></label></p>';
    }
    html += '</div';
    return html;
};

/**
 * Màj de la vue dans le bandeau de gauche
 * @param {string} divToDisplay : l'identifiant de la div à afficher dans le bandeau
 */
 const updatePanelView = function (divToDisplay) {
    if (!document.body.classList.contains("left_panel")) {
        document.body.classList.toggle("left_panel");
        setTimeout(() => carte.getMap().updateSize(), 300);
    }

    var divIds = ["unselect", "info", "cluster_list", "address_manual_shifting", "alternatives"];
    var divHtml = [unselect_html, address_select_html, cluster_html, manual_shift_html, alternative_html];
    var events = [
        function () { },
        function () {
            document.getElementById("alternatives_link").addEventListener("click", () => {
                showAlternatives();
            });
            document.getElementById("address_removal").addEventListener("click", () => {
                removeFeature();
            });
            document.getElementById("manual_shifting").addEventListener("click", () => {
                manualShifting();
            });
            document.getElementById("address_modification").addEventListener("click", () => {
                modifyFeature();
            });
        },
        function () { },
        function () {
            document.getElementById("manual_shift_validation").addEventListener("click", () => {
                manualShiftValidation(true);
            });
            document.getElementById("manual_shift_cancel").addEventListener("click", () => {
                manualShiftValidation(false);
            });
        },
        function () {
            document.getElementById("go_back").addEventListener("click", () => {
                selectAddressAction(getSelectedFeature());
            });
        }
    ];

    for (var i in divIds) {
        if (divIds[i] == divToDisplay) {
            document.getElementById("address_info").innerHTML = divHtml[i];
            document.getElementById("address_info").querySelectorAll('[data-help]').forEach(elt => {
                const h = elt.dataset.help;
                helpDialog(elt, helpStr[h], { className: h });
            });
            events[i]();
            break;
        }
    }
};

/**
 * Permet de savoir si les adresses géocodées l'ont été via un numéro de parcelle
 * @returns {boolean}
 */
const isParcel = function () {
    return parseResults.columnCorrespondance["[Numéro de parcelle]"];
  };

export {addFormInputsListeners, addFocusListeners, getColorClass, getRequiredIndex, getAddressForm, alertRequired, updatePanelView, isParcel};