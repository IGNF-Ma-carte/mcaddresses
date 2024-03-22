import { getSelectedFeature, selectAddressAction } from "../interactions/selectInteraction";
import { updatePanelView } from "./address_fct";
import { geocodage } from "../geocodage/geocode";
import dialog from "mcutils/dialog/dialog";
import { uniqueAltiGeocod } from "../geocodage/alticodage";
import { uniqueReverseGeocode, timer } from "../geocodage/reverseGeocode";
import Modify from 'ol/interaction/Modify';
import carte from "../carte";
import { setPropertiesForList } from "../geocodage/features";
import { listCtrl } from "../liste_adresses/setList";
import { getAddressLabelFromFeat } from "../geocodage/features";

var modifiedFeature;
var originalCoord;
var modifyInteraction;

/**
 * Validation du déplacement manuel d'une adresse
 * @param {*} validationCallback 
 */
const manualShiftValidation = function(validationCallback) {
    var f = getSelectedFeature();
    if(!validationCallback) {
        f.getGeometry().setCoordinates(originalCoord);
        carte.getInteraction("select").setActive(true);
        carte.getMap().removeInteraction(modifyInteraction);
        updatePanelView("info");
        selectAddressAction(f);
    }
    else {
        var originalAlti = getSelectedFeature()._api_properties.altitude;
        var cb = function() {
            var reverseCallback = function(reverseGeocodeData) {
                clearTimeout(timer);
                var alti = f._api_properties.altitude;
                var clone = f.clone();
                clone._data = f._data;
                clone._api_properties = f._api_properties;
                clone._api_properties.alternatives = f._api_properties.alternatives;
                var st = Object.assign({}, f.getIgnStyle());
                clone.setIgnStyle(st);
                if(f._api_properties.alternatives.length) {
                    f._api_properties.alternatives.unshift(clone);
                }
                else {
                    f._api_properties.alternatives = [clone];
                }
                let alt = f._api_properties.alternatives;
                f._api_properties.alternatives[0].getGeometry().setCoordinates(originalCoord);
                if(geocodage.altitude) {
                    f._api_properties.alternatives[0]._api_properties.altitude = originalAlti;
                }
                
                f._api_properties = {};

                f._api_properties.alternatives = alt;

                if(reverseGeocodeData) {
                    for(var i in reverseGeocodeData) {
                        if(i != "alternatives") {
                            f._api_properties[i] = reverseGeocodeData[i];
                        }
                      }  
                }
                f._api_properties.quality = "Manuel";
                f._api_properties._score = 99;
                if(alti) {
                    f._api_properties.altitude = alti;
                }
                f._api_properties.geocodedAddress = getAddressLabelFromFeat(f);
                f.setIgnStyle("pointColor", "lightgrey");
                f.setIgnStyle("symbolColor", "lightgrey");
                let index = f.get("#");

                f = setPropertiesForList(f);
                f.set("#", index);

                listCtrl.setColumns(listCtrl.getColumns());

                carte.getInteraction("select").setActive(true);
                carte.getMap().removeInteraction(modifyInteraction);
                updatePanelView("info");
                modifiedFeature = null;
                originalCoord = null;
                modifyInteraction = null;
                selectAddressAction(f);
                dialog.close();
            };
            uniqueReverseGeocode(f, reverseCallback)      
        };

        if(geocodage.altitude) {
            uniqueAltiGeocod(f, cb)
        }
        else {
            cb();
        }
    }
};

/**
 * Déplacement manuel d'une feature
 */
const manualShifting = function() {
    modifiedFeature = getSelectedFeature();
    modifyInteraction = new Modify({features: carte.getInteraction("select").getFeatures()});
    carte.getMap().addInteraction(modifyInteraction);
    dialog.close();
    updatePanelView("address_manual_shifting");
    carte.getInteraction("select").setActive(false);
    originalCoord = getSelectedFeature().getGeometry().getCoordinates();
};

export {manualShiftValidation, manualShifting, modifyInteraction, originalCoord, modifiedFeature};