import { getTempFeatureLayer } from "../carte";
import { updatePanelView } from "../modification_adresse/address_fct";
import { listCtrl } from "../liste_adresses/setList";

/**
 * Actions effectuées lors de la déselection d'une feature
 */
 const unselectAction = function () {
    listCtrl.select();
    getTempFeatureLayer().getSource().clear();
    updatePanelView("unselect");
};

export {unselectAction};