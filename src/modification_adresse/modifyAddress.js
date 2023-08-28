import dialog from "mcutils/dialog/dialog";
import { getAddressForm, addFocusListeners, addFormInputsListeners, alertRequired, getRequiredIndex } from "./address_fct";
import { getSelectedFeature } from "../interactions/selectInteraction";
import { unitaryGeocode } from "../geocodage/unitaryGeocode";
import { parseResults } from "../import/selectFile";
import { geocodage } from "../geocodage/geocode";

/**
 * Dialogue de modification d'une adresse
 */
const modifyFeature = function() {
    var html = getAddressForm(getSelectedFeature());

    dialog.show({ content: html, title: "Modifier l'adresse", className: 'modify_address',
                buttons: {submit : 'Valider et localiser', cancel: 'Annuler'},
                            onButton: (click) => {
                                switch (click){
                                    case 'submit':
                                        modifyGeoc();
                                        break;
                                    case 'cancel':
                                        dialog.close();
                                        break;
                                }
                            }
    });

    document.getElementById("form").querySelectorAll("label").forEach(elt => {
        if(document.getElementById(elt.attributes.for.value).value != "" && !elt.classList.contains("valid"))
        {
            elt.classList.add("valid");
        }
        addFocusListeners(elt);
    });

    addFormInputsListeners();
};

/**
 * Modification d'une adresse
 */
 const modifyGeoc = function() {
    if(!alertRequired()) {
        return alert("Veuillez remplir tous les champs obligatoires.");
    }

    var requiredIndex = getRequiredIndex();
    if(parseResults.columnCorrespondance["[Nom]"]) {
        requiredIndex.unshift(parseResults.columnCorrespondance["[Nom]"]);
    }

    if(parseResults.columnCorrespondance["[Département]"]) {
        requiredIndex.push(parseResults.columnCorrespondance["[Département]"]);
    }
    
    for(let i=0; i<requiredIndex.length; i++) {
        var val = document.getElementById("input" + i.toString()).value;
        getSelectedFeature().get("data")[parseResults.header[requiredIndex[i]-1]] = val;
    }

    var data = [];
    var feat = getSelectedFeature();
    for(var i in parseResults.header)
    {   
        data.push(feat.get("data")[parseResults.header[i]]);
    }
    unitaryGeocode([data], geocodage.getFeatureIndex(feat));
};

export {modifyFeature};