import dialog from "mcutils/dialog/dialog";
import { getTempFeatureLayer, getFeatureLayer } from "../carte";
import { unselectAction } from "../interactions/unselectInteraction";
import { getSelectedFeature } from "../interactions/selectInteraction";
import { listCtrl } from "../liste_adresses/setList";
import { geocodage } from "../geocodage/geocode";
import { parseResults } from "../import/selectFile";

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
                                        let index = geocodage.getFeatureIndex(getSelectedFeature());
                                        parseResults.data.splice(index, 1);
                                        geocodage.results.olFeatures.splice(index, 1);
                                        geocodage.results.apiFeatures.splice(index, 1);
                                        for(let i=index; i<geocodage.results.olFeatures.length; i++) {
                                            geocodage.results.olFeatures[i].set("#", i+1, true);
                                        }
                                        getTempFeatureLayer().getSource().clear();
                                        if(getSelectedFeature().getGeometry()) {
                                            getFeatureLayer().getSource().removeFeature(getSelectedFeature());
                                        }
                                        carte.getInteraction("select").getFeatures().clear();
                                        unselectAction();
                                        listCtrl.setColumns(listCtrl.getColumns());
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