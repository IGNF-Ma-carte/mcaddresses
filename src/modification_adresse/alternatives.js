import { getSelectedFeature, selectAddressAction } from "../interactions/selectInteraction";
import { getAddressLabelFromFeat } from "../geocodage/features";
import { updatePanelView } from "./address_fct";
import { getColorClass } from "./address_fct";
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import {boundingExtent} from 'ol/extent';
import { getTempFeatureLayer, getFeatureLayer } from "../carte";
import { geocodage } from "../geocodage/geocode";
import colors from "../colors";
import { updateListAddress } from "../liste_adresses/listUpdate";
import { uniqueAltiGeocod } from "../geocodage/alticodage";

/**
 * Affiche les alternatives d'une adresse
 */
const showAlternatives = function() {

    var f = getSelectedFeature();
    updatePanelView("alternatives");

    if(document.getElementById("alternatives").classList.contains("hidden")) {
        document.getElementById("alternatives").classList.toggle("hidden");
    }

    document.getElementById("address_info_title").innerHTML = "Adresses alternatives";

    var html = "<ul>";
    for(var i in f.get("alternatives")) {
        var adr = getAddressLabelFromFeat(f.get("alternatives")[i], true);
        var score = Math.round(f.get("alternatives")[i].get("properties")._score*100)/100;
        if(score == 99) {
            score = "-";
        }
        var scoreClass = getColorClass(f.get("alternatives")[i].get("properties")._score);
  
        html += "<li><div class='alt_score " + scoreClass + "'>" + score + "</div>";
        html += "<p class='street'>" + adr[0] + "</p><p>" + adr[1] + "</p></li>";
    }
    html += "</ul>";
    
    document.getElementById("alternatives_list").innerHTML = html;

    var items = document.getElementById("alternatives_list").children[0].children;
    for(let i=0; i < items.length; i++) {
        items[i].addEventListener("mouseover", () => {
            getSelectedFeature().get("alternatives")[i].setIgnStyle("symbolColor", "grey");
            getSelectedFeature().get("alternatives")[i].setIgnStyle("pointColor", "grey");
            
            var lineFeat = new Feature({
                geometry: new LineString([getSelectedFeature().getGeometry().getCoordinates(), getSelectedFeature().get("alternatives")[i].getGeometry().getCoordinates()])
              });

            getTempFeatureLayer().getSource().addFeature(getSelectedFeature().get("alternatives")[i]);
            getTempFeatureLayer().getSource().addFeature(lineFeat);

            var extent = boundingExtent([getSelectedFeature().getGeometry().getCoordinates(), getSelectedFeature().get("alternatives")[i].getGeometry().getCoordinates()]);
            carte.getMap().getView().fit(extent);
            carte.getMap().getView().setZoom(carte.getMap().getView().getZoom()-1);
        });
        
        items[i].addEventListener("mouseout", () => {
            getTempFeatureLayer().getSource().clear();
            getTempFeatureLayer().getSource().addFeature(getSelectedFeature());
        });

        items[i].addEventListener("click", () => {
            selectAlternative(i);
        });
    }

    /**
     * Actions effectuées lors de la sélection d'une alternative
     * @param {integer} selectedIndex : l'indice de l'alternative sélectionnée
     */
    const selectAlternative = function(selectedIndex) {
        var olFeatInd = geocodage.getFeatureIndex(getSelectedFeature());

            var alternative = getSelectedFeature().get("alternatives")[selectedIndex];
            alternative.set("originalIndex", getSelectedFeature().get("originalIndex"));
            var selectAlternative = function() {
                alternative.set("alternatives", getSelectedFeature().get("alternatives"));
                alternative.get("alternatives").splice(selectedIndex,1);               
                alternative.get("alternatives").unshift(getSelectedFeature());
                alternative.get("alternatives")[0].set("alternatives", []);
                alternative.get("alternatives").sort(function(a, b) {
                    return b.get("properties")._score-a.get("properties")._score
                });
                
                // Color / score
                var score = alternative.get("properties")._score;
                function setStyle(color) {
                    alternative.setIgnStyle("symbolColor", color);
                    alternative.setIgnStyle("pointColor", color);
                }
                if (score > 0.8) {
                    setStyle(colors.veryGood);
                } else if (score > 0.5) {
                    setStyle(colors.good);
                } else if (score > 0){
                    setStyle(colors.medium);
                } else {
                    setStyle(colors.manual);
                }
    
                getFeatureLayer().getSource().removeFeature(geocodage.results.olFeatures[olFeatInd]);
                geocodage.results.olFeatures[olFeatInd] = alternative;
                getFeatureLayer().getSource().addFeature(geocodage.results.olFeatures[olFeatInd]);
                getTempFeatureLayer().getSource().clear();
                getTempFeatureLayer().getSource().addFeature(geocodage.results.olFeatures[olFeatInd]);
    
                carte.getInteraction("select").getFeatures().clear();
                carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[olFeatInd]);
    
                updateListAddress("modify");
                selectAddressAction(geocodage.results.olFeatures[olFeatInd]);
    
                carte.getMap().getView().setCenter(geocodage.results.olFeatures[olFeatInd].getGeometry().getCoordinates());
            }

            if(geocodage.altitude && !alternative.get("properties").altitude) {
                uniqueAltiGeocod(alternative, selectAlternative);
            }
            else {
                selectAlternative();
            }
    };
};

export {showAlternatives};