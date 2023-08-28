import carte from "../carte";
import { getSelectedFeature } from "../interactions/selectInteraction";
import { geocodage } from "../geocodage/geocode";

/**
 * Action lors d'un clic sur un des boutons modifiant la taille de la liste
 */
const setResizeButtonEvent = function() {
    document.getElementById("hide_or_show_list_button").addEventListener("click", () => {
        document.body.classList.toggle("reduced_list");
        setTimeout(() => carte.getMap().updateSize(), 300);
    });

    document.getElementById("expand_or_compress_button").addEventListener("click", () => {
        document.body.classList.toggle("expanded_list");
        if(!document.body.classList.contains("expanded_list")) {
            var f = getSelectedFeature();
            if(f && geocodage.getFeatureIndex(f)!= undefined) {
                document.getElementById("address" + geocodage.getFeatureIndex(f)).scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
        setTimeout(() => carte.getMap().updateSize(), 300);
    });
};

export {setResizeButtonEvent};