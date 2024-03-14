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
        var originalAlti = getSelectedFeature().get("properties").altitude;
        var cb = function() {
            var reverseCallback = function(reverseGeocodeData) {
                clearTimeout(timer);
                var alti = f.get("properties").altitude;
                var clone = f.clone();
                var st = Object.assign({}, f.getIgnStyle());
                clone.setIgnStyle(st);
                if(f.get("alternatives").length) {
                    f.get("alternatives").unshift(clone);
                }
                else {
                    f.set("alternatives", [clone]);
                }
                f.get("alternatives")[0].getGeometry().setCoordinates(originalCoord);
                if(geocodage.altitude) {
                    f.get("alternatives")[0].get("properties").altitude = originalAlti;
                }
                
                f.set("properties", {});
                
                if(reverseGeocodeData) {
                    for(var i in reverseGeocodeData) {
                        f.get("properties")[i] = reverseGeocodeData[i];
                      }  
                }
                f.get("properties").quality = "Manuel";
                f.get("properties")._score = 99;
                if(alti) {
                    f.get("properties").altitude = alti;
                }
                f.get("properties").geocodedAddress = getAddressLabelFromFeat(f);

                f.setIgnStyle("pointColor", "lightgrey");
                f.setIgnStyle("symbolColor", "lightgrey");
                let index = f.get("#");

                f = setPropertiesForList(f);
                f.set("#", index);

                listCtrl.setColumns(listCtrl.getColumns());

                carte.getInteraction("select").setActive(true);
                carte.getMap().removeInteraction(modifyInteraction);
                updatePanelView("info");
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
    modifyInteraction = new Modify({features: carte.getInteraction("select").getFeatures()});
    carte.getMap().addInteraction(modifyInteraction);
    dialog.close();
    updatePanelView("address_manual_shifting");
    carte.getInteraction("select").setActive(false);
    originalCoord = getSelectedFeature().getGeometry().getCoordinates();
};

export {manualShiftValidation, manualShifting};