import { geocodage } from "../geocodage/geocode";
import { parseResults } from "../import/selectFile";
import { createList, listSelectedIndex, setListSelectedIndex } from "./createList";

/**
 * Màj de la liste d'adresses
 * @param {string} mode : "remove", "modify", "add"
 * @param {object} f : la feature associée à l'adresse concernée
 */
 const updateListAddress = function(mode, f) {
    switch(mode) {
        case "remove":
            var index = geocodage.getFeatureIndex(f);
            // geocodage.removedIndex.push(index);
            geocodage.removedIndex.push(f.get("originalIndex"));
            parseResults.data.splice(index, 1);
            geocodage.results.olFeatures.splice(index, 1);
            geocodage.results.apiFeatures.splice(index, 1);
            createList();
            setListSelectedIndex(-1);
            break;
        case "modify":
        case "add":
            createList();
            if(listSelectedIndex > -1) {
                document.getElementById("address" + listSelectedIndex).classList.toggle("selected");
                document.getElementById("address" + listSelectedIndex).scrollIntoView({ behavior: "smooth", block: "center" });
            }
            break;
    }

};

export {updateListAddress};