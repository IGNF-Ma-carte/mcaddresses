import carte from "../carte";
import { geocodage } from "../geocodage/geocode";
import { getTempFeatureLayer } from "../carte";
import { selectAddressAction } from "../interactions/selectInteraction";

/**
 * Actions effectuées lors de la sélection d'une adresse dans la liste
 * @param {integer} ind : indice dans la liste de l'adresse sélectionnée
 */
 const selectAddressListAction = function(ind) {
    if(geocodage.results.olFeatures[ind].getGeometry()) {
        var coord = geocodage.results.olFeatures[ind].getGeometry().getCoordinates();
        carte.getMap().getView().setZoom(16);
        carte.getMap().getView().setCenter(coord);
        
        getTempFeatureLayer().getSource().clear();
        getTempFeatureLayer().getSource().addFeature(geocodage.results.olFeatures[ind]);
        carte.getInteraction("select").getFeatures().clear();
        carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[ind]);
    }
    else {
        getTempFeatureLayer().getSource().clear();
        carte.getMap().getView().setCenter([288074, 6247982]);
        carte.getMap().getView().setZoom(7);
        carte.getInteraction("select").getFeatures().clear();
        carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[ind]);
    }

    selectAddressAction(geocodage.results.olFeatures[ind]);
};

export {selectAddressListAction};