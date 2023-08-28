import { listHeaderShow, listSelectedIndex, listHeader } from "./createList";
import dialog from "mcutils/dialog/dialog";
import { createList } from "./createList";

/**
 * Action lors d'un clic sur le bouton de configuration de la liste
 */
const setConfigButtonsEvent = function() {
    document.getElementById("list_config").addEventListener("click", () => {
        dialog.show({ content: getHtmlListConfig(), className: 'list_config_dlg', title: "Configuration de la liste de géocodage",
                    buttons: {submit : 'Valider', cancel: 'Annuler'},
                            onButton: (click) => {
                                switch (click){
                                    case 'submit':
                                        for(var i in listHeaderShow) {
                                            listHeaderShow[i] = document.getElementById("cb" + i).checked;
                                        }
                                        createList();
                                        if(listSelectedIndex > -1) {
                                            document.getElementById("address" + listSelectedIndex).classList.toggle("selected");
                                            document.getElementById("address" + listSelectedIndex).scrollIntoView({ behavior: "smooth", block: "center" });
                                        }
                                        dialog.close();
                                        break;
                                    case 'cancel':
                                        dialog.close();
                                        break;
                                }
                            }
         });
    });
};

/**
 * Crée le html pour le dialogue de paramétrage de la liste d'adresses
 * @returns 
 */
 const getHtmlListConfig = function() {
    var html = "<p>Afin de faciliter l'utilisation de la liste de géocodage vous pouvez masquer des colonnes.</p><table>"
    var checked;
    for(var i in listHeader) {
        checked = "";
        if(listHeaderShow[i]) {
            checked = "checked";
        }
        if(i%4 == 0) {
            html += "<tr>";
        }
        html += "<td><label class='ol-ext-check ol-ext-checkbox' for='cb" + i + "'><input type='checkbox' " + checked + " id='cb" + i + "' /><span></span>" + listHeader[i] + "</label></td>";
        if((i+1)%4 == 0) {
            html += "</tr>";
        }
    }
    html += "</table>";
    return html;
};

export {setConfigButtonsEvent};