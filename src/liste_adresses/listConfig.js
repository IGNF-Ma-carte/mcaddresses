import dialog from "mcutils/dialog/dialog";
import { listCtrl } from "./setList";
import { getScoreCount, getReportHtml } from "../geocodage/report.js";
import reportHtml from "./report-dialog.html";
import Chart from "chart.js/auto";
import colors from "../colors";
import { geocodeError } from "../geocodage/geocode.js";

let done = false;

/**
 * Initialisation du bouton de paramétrage de la liste d'adresses
 */
const setButtonConfig = function() {
    //Initialisation des attributs utilisés pour gérer l'affichage
    listCtrl.set("all_columns", listCtrl.getColumns());
    listCtrl.set("hidden_columns", []);
    console.log(listCtrl);
    if (!done) {
        done = true;
        listCtrl.addButton({
            className: "fi-configuration",
            title: "Affichage des colonnes",
            click: configButtonEvent 
        })
        listCtrl.addButton({
            className: "fa fa-pie-chart",
            title: "Données géocodées",
            click: showInfo
        })
    }
    //création du bouton et ajout dans le header de la liste
    /*
    let header = document.querySelector(".ol-feature-list .ol-header p");
    if (!header.querySelector("#list_config")) {
        let button = document.createElement("i");
        button.classList.add("fi-configuration");
        button.id = "list_config";
        button.title = "Affichage des colonnes";
        header.append(button);
        //Event listener du bouton de paramétrage
        button.addEventListener("click", configButtonEvent);
    }
    */
};


function showInfo() {
    // Calcul du rapport de géocodage
    var scoreCount = {"veryGood": 0, "good": 0, "medium": 0, "noGeoc": 0, "manual": 0};
    listCtrl._listFeatures.forEach(f => {
        const score = f._api_properties._score;
        if (score > 2) {
            scoreCount.manual++;
        } else if (score > 0.8) {
            scoreCount.veryGood++;
        } else if (score > 0.5) {
            scoreCount.good++;
        } else if (score > 0) {
            scoreCount.medium++;
        } else {
            scoreCount.noGeoc++;
        }
    });
    // Dialog de rapport de géocodage
    const buttons = scoreCount.noGeoc ? { cancel: 'Fermer', again: 'Relancer les géocodages en erreur ('+scoreCount.noGeoc+')' } : { cancel: 'Fermer' };
    dialog.show({
        content: reportHtml, 
        className: "rapport", 
        progress: false,
        buttons: buttons,
        onButton: (click) => {
            switch (click){
                case 'again': {
                    dialog.close();
                    geocodeError();
                    break;
                }
                default: {
                    dialog.close();
                    break;
                }
            }
        }
    })

    dialog.getContentElement().querySelector('[data-attr="nb"]').innerHTML = listCtrl._listFeatures.length;
    Object.keys(scoreCount).forEach(k => {
        if (scoreCount[k] > 1) {
            dialog.getContentElement().querySelector('[data-attr="'+k+'"]').innerHTML = scoreCount[k] 
                + (k==='noGeoc' ? " adresses non géocodées" : " adresses géocodées");
        } else {
            dialog.getContentElement().querySelector('[data-attr="'+k+'"]').innerHTML = scoreCount[k] 
                + (k==='noGeoc' ? " adresse non géocodée" : " adresse géocodée");
        }
    })
    // Diagramme du rapport de géocodage
    const ctx = dialog.getContentElement().querySelector('canvas');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Très bon', 'Bon', 'Moyen', 'Pas géolocalisée', 'Manuel'],
            datasets: [{
            label: 'Score du géocodage',
            data: [ scoreCount.veryGood, scoreCount.good, scoreCount.medium, scoreCount.noGeoc, scoreCount.manual ],
            backgroundColor: [ colors.veryGood, colors.good, colors.medium, colors.noGeoc, colors.manual ],
            borderColor: [ colors.veryGood, colors.good, colors.medium, colors.noGeoc, colors.manual ],
            borderWidth: 1
            }]
        },
        options: {
            plugins: {
            legend: {
                display: false
            }
            }
        } 
    });
}

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