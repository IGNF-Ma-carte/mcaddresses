import carte from "../carte";
import { geocodage } from "../geocodage/geocode";
import { getTempFeatureLayer } from "../carte";
import { unselectAction } from "./unselectInteraction";
import { updatePanelView, getColorClass } from "../modification_adresse/address_fct";
import { parseResults } from "../import/selectFile";
import { selectClusterAction } from "./selectClusterInteraction";
import { listCtrl } from "../liste_adresses/setList";

/**
 * Renvoie la feature openlayers actuellement sélectionnée
 * @returns {object} la feature sélectionnée
 */
 const getSelectedFeature = function () {
    return carte.getInteraction("select").getFeatures().getArray()[0];
};

/** Interaction de sélection **/
carte.getInteraction("select").on("select", function () {
    if (carte.getInteraction("select").getFeatures().getArray().length) {
        carte.getMap().getView().setCenter(carte.getInteraction("select").getFeatures().getArray()[0].getGeometry().getCoordinates());

        var fArray = carte.getInteraction("select").getFeatures().getArray()[0].get("features");
        if (fArray.length > 1) {
            selectClusterAction(fArray);
        }
        else if (fArray.length) {
            var ind = geocodage.getFeatureIndex(fArray[0]);
            getTempFeatureLayer().getSource().clear();
            getTempFeatureLayer().getSource().addFeature(geocodage.results.olFeatures[ind]);
            carte.getInteraction("select").getFeatures().clear();
            carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[ind]);
            selectAddressAction(geocodage.results.olFeatures[ind]);
        }
    }
    else {
        unselectAction();
    }
});

/**
 * Actions effectuées lors de la sélection d'une feature
 * @param {object} f : la feature
 */
const selectAddressAction = function (f) {
    updatePanelView("info");

    var score = f._api_properties._score;
    var qualite = f._api_properties.quality;
    var colorClass = getColorClass(score);

    var colorClassArray = ["green", "yellow", "orange", "grey", "white"];
    for (var i in colorClassArray) {
        if (document.getElementById("score_box").classList.contains(colorClassArray[i])) {
            document.getElementById("score_box").classList.toggle(colorClassArray[i]);
        }
    }

    document.getElementById("score_box").classList.toggle(colorClass);

    var sc = "Non géocodée";
    if (score > 0.8) {
        sc = "Très bon";
    }
    else if (score > 0.5) {
        sc = "Bon";
    }
    else if (score > 0) {
        sc = "Moyen";
    }
    else if (score == 99) {
        sc = "-";
    }
    document.getElementById("score_label").innerHTML = sc;

    if (score == 99) {
        document.getElementById("score_box").innerHTML = "-";
    }
    else {
        document.getElementById("score_box").innerHTML = Math.round(score * 100) / 100;
    }

    document.getElementById("span_val_quali").innerHTML = qualite;

    var adr;
    if (parseResults.columnCorrespondance["[Adresse complète]"]) {
        adr = f._data[parseResults.header[parseResults.columnCorrespondance["[Adresse complète]"] - 1]];
    }
    else if (parseResults.columnCorrespondance["[Parcelle]"]) {
        adr = f._data[parseResults.header[parseResults.columnCorrespondance["[Parcelle]"] - 1]];
    }
    else {
        adr = f._data[parseResults.header[parseResults.columnCorrespondance["[Rue]"] - 1]] + "</br>";
        adr += f._data[parseResults.header[parseResults.columnCorrespondance["[Code postal]"] - 1]];
        adr += " " + f._data[parseResults.header[parseResults.columnCorrespondance["[Commune]"] - 1]];
    }

    document.getElementById("file_address").innerHTML = adr;

    if (f._api_properties.alternatives.length) {
        if (document.getElementById("alternatives_link").classList.contains("hidden")) {
            document.getElementById("alternatives_help").classList.toggle("hidden");
            document.getElementById("alternatives_link").classList.toggle("hidden");
        }
    }
    else {
        if (!document.getElementById("alternatives_link").classList.contains("hidden")) {
            document.getElementById("alternatives_help").classList.toggle("hidden");
            document.getElementById("alternatives_link").classList.toggle("hidden");
        }
    }

    if ((!f.getGeometry() && !document.getElementById("manual_shifting").classList.contains("hidden")) ||
        (f.getGeometry() && document.getElementById("manual_shifting").classList.contains("hidden"))) {
        document.getElementById("manual_shifting").classList.toggle("hidden");
    }

    listCtrl.select(f);
};

export {getSelectedFeature, selectAddressAction};