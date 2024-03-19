import { updatePanelView } from "../modification_adresse/address_fct";
import { parseResults } from "../import/selectFile";
import { getColorClass } from "../modification_adresse/address_fct";
import { getAddressLabelFromFeat } from "../geocodage/features";
import carte,  { getTempFeatureLayer } from "../carte";
import { selectAddressAction } from "./selectInteraction";
import { geocodage } from "../geocodage/geocode";

/**
 * Actions effectuées lors de la sélection d'un cluster de features
 * @param {array} fArray : array des features contenues dans le cluster
 */
 const selectClusterAction = function (fArray) {
    updatePanelView("cluster_list");

    document.getElementById("address_info_title").innerHTML = "Adresses";

    var html = "<table>";
    for (let i in fArray) {
        var f = fArray[i];
        var cellContent = "";
        if (parseResults.columnCorrespondance["[Nom]"]) {
            cellContent += "<p class='cell_title'>" + f._data[parseResults.header[parseResults.columnCorrespondance["[Nom]"] - 1]] + "</p>";
        }
        else {
            cellContent += "<p class='cell_title'>Adresse " + (Number(i) + 1) + "</p>";
        }
        var adressLabel = getAddressLabelFromFeat(f, true);
        cellContent += "<p>" + adressLabel[0] + "</br>" + adressLabel[1] + "</p>";
        var colorClass = getColorClass(f._api_properties._score);
        cellContent += "<span class='" + colorClass + "'>" + Math.round(f._api_properties._score * 100) / 100 + "</span>";
        html += "<tr id='" + i.toString() + "'><td>" + cellContent + "</td><tr>";
    }
    html += "</table>";
    document.getElementById("cluster_list").innerHTML = html;

    var trList = document.getElementById("cluster_list").children[0].children[0].children;

    var currentZoom = carte.getMap().getView().getZoom();

    var tl = getTempFeatureLayer();

    document.getElementById("cluster_list").children[0].addEventListener("mouseout", function () {
        if (!document.getElementById("cluster_list").classList.contains("hidden")) {
            carte.getMap().getView().setCenter(fArray[0].getGeometry().getCoordinates());
            carte.getMap().getView().setZoom(currentZoom);
        }

        if (!document.getElementById("cluster_list").classList.contains("hidden")) {
            tl.getSource().clear();
        }
    });

    for (let i in trList) {
        if (i % 2 == 0) {
            trList[i].addEventListener("mouseover", function () {
                var coord = fArray[Number(this.id)].getGeometry().getCoordinates();
                carte.getMap().getView().setCenter(coord);
                carte.getMap().getView().setZoom(16);

                tl.getSource().addFeature(geocodage.results.olFeatures[geocodage.getFeatureIndex(fArray[Number(this.id)])]);

            });

            trList[i].addEventListener("click", function () {
                var f = fArray[Number(this.id)];
                carte.getInteraction("select").getFeatures().clear();
                carte.getMap().getView().setCenter(f.getGeometry().getCoordinates());
                carte.getMap().getView().setZoom(16);
                tl.getSource().clear();

                tl.getSource().addFeature(geocodage.results.olFeatures[geocodage.getFeatureIndex(fArray[Number(this.id)])]);

                carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[geocodage.getFeatureIndex(fArray[Number(this.id)])]);
                selectAddressAction(geocodage.results.olFeatures[geocodage.getFeatureIndex(fArray[Number(this.id)])]);
            });
        }
    }
};

export {selectClusterAction};