import './mcversion'
import charte from 'mcutils/charte/macarte'
import 'mcutils/Carte.css'
import '../pages/index.css'
import '../pages/dialogue.css'
import carte from './carte.js'
import './import/selectFile'
import './interactions/selectInteraction'
import { actionWindow } from './import/selectFile'
import { newFileImportDialog } from './import/newImport'
import { addAddressDialog } from './modification_adresse/addAddress'
import { exportDialog, switchToMaCarte } from './export/export.js'
import './unload'

import import_geocod_html from '../pages/import_geocod-page.html'

// [TODO] remove to activate teams menus
import './remove_teams.css'
// [END TODO]

charte.setApp('geocod', 'Ma carte');

// Add menu button
charte.addTool('export', 'fi-download', 'Enregistrer dans un fichier', () => exportDialog());
charte.addTool('maCarte', 'fi-save', 'Enregistrer sur mon compte', () => switchToMaCarte());
charte.addTool('newFile', 'fi-table', 'Charger un nouveau fichier', () => newFileImportDialog());
charte.addTool('addAddress', 'fi-add-point', 'Ajouter une adresse', () => addAddressDialog());

charte.on(['tab:show', 'fullscreen'], () => {
  carte.getMap().updateSize();
});

document.body.querySelectorAll('[data-role]').forEach(elt => {
  if (elt.dataset.role == "map" || elt.dataset.role == "toolBar") {
    elt.classList.toggle("hidden");
  }
});

document.getElementById("action_div").innerHTML = import_geocod_html;
document.getElementById("action_div").classList.toggle("import");

actionWindow();
/* DEBUG */
window.carte = carte;
/**/