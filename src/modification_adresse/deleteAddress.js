import dialog from "mcutils/dialog/dialog";
import { updateListAddress } from "../liste_adresses/listUpdate";
import { getTempFeatureLayer, getFeatureLayer } from "../carte";
import { unselectAction } from "../interactions/unselectInteraction";
import { getSelectedFeature } from "../interactions/selectInteraction";

/**
 * Suppression d'une adresse
 */
 const removeFeature = function() {
    var html = "<p>Êtes-vous certain de vouloir supprimer l'adresse ?</p>";

    dialog.show({title: "Supprimer l'adresse", content: html, className:"feature_removal",
                buttons: {submit : 'Supprimer', cancel: 'Annuler'},
                            onButton: (click) => {
                                switch (click){
                                    case 'submit':
                                        updateListAddress("remove", getSelectedFeature());
                                        getTempFeatureLayer().getSource().clear();
                                        if(getSelectedFeature().getGeometry()) {
                                            getFeatureLayer().getSource().removeFeature(getSelectedFeature());
                                        }
                                        carte.getInteraction("select").getFeatures().clear();
                                        unselectAction();
                                        dialog.close();
                                        break;
                                    case 'cancel':
                                        dialog.close();
                                        break;
                                }
                            }
    });
};

export {removeFeature};