import dialog from "mcutils/dialog/dialog";
import { listCtrl } from "./setList";

/**
 * Initialisation du bouton de paramétrage de la liste d'adresses
 */
const setButtonConfig = function() {
    //Initialisation des attributs utilisés pour gérer l'affichage
    listCtrl.set("all_columns", listCtrl.getColumns());
    listCtrl.set("hidden_columns", []);
    //création du bouton et ajout dans le header de la liste
    let header = document.querySelector(".ol-feature-list .ol-header p");
    let button = document.createElement("i");
    button.classList.add("fi-configuration");
    button.id = "list_config";
    button.title = "Affichage des colonnes";
    header.append(button);
    //Event listener du bouton de paramétrage
    button.addEventListener("click", configButtonEvent);
};

/**
 * Action du bouton de paramétrage de la liste d'adresses
 */
const configButtonEvent = function() {
    //affichage du dialogue
    dialog.show({ content: getHtmlListConfig(), className: 'list_config_dlg', title: "Configuration de la liste de géocodage",
                    buttons: {submit : 'Valider', cancel: 'Annuler'},
                            onButton: (click) => {
                                switch (click){
                                    case 'submit':
                                        //maj des attributs utilisés pour gérer l'affichage
                                        let hidden_columns = [];
                                        let shown_columns = [];
                                        for(var i in listCtrl.get("all_columns")) {
                                            if(!document.getElementById("cb" + i).checked) {
                                                hidden_columns.push(listCtrl.get("all_columns")[i])
                                            } else {
                                                shown_columns.push(listCtrl.get("all_columns")[i])
                                            }
                                        }
                                        //maj de l'affichage de la liste
                                        listCtrl.set("hidden_columns", hidden_columns);
                                        listCtrl.setColumns(shown_columns);
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
 * Crée le html pour le dialogue de paramétrage de la liste d'adresses
 * @returns 
 */
 const getHtmlListConfig = function() {
    var html = "<p>Afin de faciliter l'utilisation de la liste de géocodage vous pouvez masquer des colonnes.</p><table>"
    var checked;
    for(var i in listCtrl.get("all_columns")) {
        checked = "checked";
        if(listCtrl.get("hidden_columns").includes(listCtrl.get("all_columns")[i])) {
            checked = "";
        }
        if(i%4 == 0) {
            html += "<tr>";
        }
        html += "<td><label class='ol-ext-check ol-ext-checkbox' for='cb" + i + "'><input type='checkbox' " + checked + " id='cb" + i + "' /><span></span>" + listCtrl.get("all_columns")[i] + "</label></td>";
        if((i+1)%4 == 0) {
            html += "</tr>";
        }
    }
    html += "</table>";
    return html;
};

export {setButtonConfig};