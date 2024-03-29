import dialog from "mcutils/dialog/dialog";
import { exportDialog } from "../export/export";
import carte, { getFeatureLayer, getTempFeatureLayer } from "../carte";
import { clearGeocodage } from "../geocodage/geocode";
import { actionWindow, clearParseResults, clearImportedFile } from "./selectFile";
import { clearListCtrl } from "../liste_adresses/setList";
import import_geocod_html from '../../pages/import_geocod-page.html'

/**
 * Dialog pour l'import d'un nouveau fichier
 */
const newFileImportDialog = function () {
    var html = "<p>Vous ne pouvez charger qu’un seul fichier à la fois. Pour sauvegarder le fichier en cours choisissez «Enregistrer et charger» sinon le travail en cours sera perdu</p></div></div>";
  
    dialog.show({
        content: html, title: "Nouveau fichier", className: "new_import",
        buttons: { save: "Enregistrer et charger", submit: 'Charger', cancel: 'Annuler' },
        onButton: (click) => {
            switch (click) {
                case 'save':
                    exportDialog(doNewImport);
                    break;
                case 'submit':
                    doNewImport();
                    dialog.close();
                    break;
                case 'cancel':
                    dialog.close();
                    break;
            }
        }
    });
};

/**
 * Import d'un nouveau fichier
 */
const doNewImport = function () {
    getFeatureLayer().getSource().clear();
    getTempFeatureLayer().getSource().clear();
  
    clearGeocodage();
    clearParseResults();
    clearImportedFile();
    clearListCtrl();
  
    carte.getInteraction("select").setActive(true);
  
    document.getElementById("action_div").classList.toggle("hidden");
    document.body.querySelectorAll('[data-role]').forEach(elt => {
        if (elt.dataset.role == "map" || elt.dataset.role == "toolBar") {
            elt.classList.toggle("hidden");
        }
    });
  
    setTimeout(() => carte.getMap().updateSize(), 300);
  
    document.getElementById("action_div").innerHTML = import_geocod_html;
    document.getElementById("action_div").classList.toggle("import");
    document.getElementById("action_div").classList.toggle("preview");
    actionWindow();
};

export {newFileImportDialog};