import { listSelectedIndex, setListSelectedIndex } from "../liste_adresses/createList";
import { getTempFeatureLayer } from "../carte";
import { updatePanelView } from "../modification_adresse/address_fct";

/**
 * Actions effectuées lors de la déselection d'une feature
 */
 const unselectAction = function () {
    if (listSelectedIndex > -1) {
        document.getElementById("address" + listSelectedIndex).classList.toggle("selected");
    }
    getTempFeatureLayer().getSource().clear();
    setListSelectedIndex(-1);
    updatePanelView("unselect");
};

export {unselectAction};