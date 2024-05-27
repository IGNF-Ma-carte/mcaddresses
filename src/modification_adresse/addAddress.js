import dialog from "mcutils/dialog/dialog";
import { addFocusListeners, addFormInputsListeners, alertRequired, getRequiredIndex, getAddressForm } from "./address_fct";
import { parseResults } from "../import/selectFile";
import { unitaryGeocode } from "../geocodage/unitaryGeocode";

/**
 * Dialogue d'ajout d'une adresse
 */
const addAddressDialog = function() {
    var html = getAddressForm();
    
    dialog.show({content: html, title: "Ajouter une adresse", className: "add_address",
                buttons: {submit : 'Valider et localiser', cancel: 'Annuler'},
                onButton: (click) => {
                    switch (click){
                        case 'submit':
                            addAddress();
                            break;
                        case 'cancel':
                            dialog.close();
                            break;
                    }
                }
    });

    document.getElementById("form").querySelectorAll("label").forEach(elt => {
        addFocusListeners(elt);
    });

    addFormInputsListeners();
};

/**
 * Ajout d'une adresse
 * @returns 
 */
const addAddress = function() {
    if(!alertRequired()) {
        return alert("Veuillez remplir tous les champs obligatoires.");
    }

    var requiredIndex = getRequiredIndex();
    var correspData = [];

    if(parseResults.columnCorrespondance["[Nom]"]) {
        requiredIndex.unshift(parseResults.columnCorrespondance["[Nom]"]);
    }

    if(parseResults.columnCorrespondance["[Département]"]) {
        requiredIndex.push(parseResults.columnCorrespondance["[Département]"]);
    }
    var val;
    for(let i=0; i<requiredIndex.length; i++) {
        val = document.getElementById("input" + i.toString()).value;
        correspData.push({value: val, index: requiredIndex[i]-1});
    }

    var data = [];
    for(var i in parseResults.header)
    {   
        val = "";
        for(var j in correspData) {
            if(i == correspData[j].index) {
                val = correspData[j].value;
            }
        }
        data.push(val);
    }
    //parseResults.data.push(data);
    unitaryGeocode([data], -1);
};

export {addAddressDialog};