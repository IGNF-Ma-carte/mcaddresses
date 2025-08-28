import helpDialog from "mcutils/dialog/helpDialog";
import Papa from 'papaparse';
import { read, utils } from "xlsx";
import { preview } from "./preview";
import '../../pages/import_geocod.css';
import '../../pages/import_preview.css';
import helpStr from '../help';
import exemple from './../data/exemple';

var parseResults;
var importedFile;

/**
 * Réinitialisation de la variable "parseResults"
 */
var clearParseResults = function() {
    parseResults = false;
}

/**
 * Réinitialisation de la variable "importedFile"
 */
var clearImportedFile = function() {
    importedFile = false;
}

/**
 * Fenêtre de choix de fichier  à charger
 */
const actionWindow = function () {

    document.getElementById("action_div").querySelectorAll('[data-help]').forEach(elt => {
        const h = elt.dataset.help;
        helpDialog(elt, helpStr[h], { className: h });
    });
  
    //Event au chargement d'un fichier
    document.getElementById("import_load").addEventListener("click", () => {
        var parse = function (file) {
            Papa.parse(file, {
                skipEmptyLines: true,
                complete: function (results) {
                    parseResults = results;
                    parseResults.header = parseResults.data[0];
                    parseResults.columnCorrespondance = {
                    "[Nom]": 0, "[Rue]": 0, "[Code postal]": 0, "[Commune]": 0,
                    "[Adresse complète]": 0, "[Numéro de parcelle]": 0, "[Département]": 0
                    };
                    parseResults.data.shift();
                    parseResults.ignore = "";
                    window.pr = parseResults;
                    
                    if(importedFile.name.match(/\.xls[x]{0,1}$/) || importedFile.name.match(/\.ods$/)) {
                        readXls(importedFile, preview, preview);
                    }
                    else {
                        var reader = new FileReader();                 
                        reader.readAsText(importedFile, "UTF-8");
                        reader.onload = function (evt) {
                            preview(evt.target.result);
                        }                 
                    }

                    if(parseResults.data.length > 20000) {
                        alert("Attention, votre fichier contient plusieurs dizaines de milliers de lignes. Cela pourrait entrainer des erreurs lors de l'affichage ou de l'export des données.");
                    }
                }
            });
        };
  
        if (!importedFile) {
            alert("Veuillez choisir un fichier à charger.");
        }
        else if (importedFile.name.match(/\.xls[x]{0,1}$/) || importedFile.name.match(/\.ods$/)) { 
            readXls(importedFile, parse, parse);
        }
        else {
            parse(importedFile);
        }
    });
  
    // Event à la sélection d'un fichier
    document.getElementById("chargement_f").addEventListener("change", (e) => {
        console.log(e.target.files[0]);
        if (e.target.files[0].name.match(/\.xls[x]{0,1}$/)
            || e.target.files[0].name.match(/\.ods$/)
            || e.target.files[0].name.match(/\.txt$/)
            || e.target.files[0].name.match(/\.csv$/)
        ) {
            importedFile = e.target.files[0];
            document.getElementById("fichier_img").classList.remove("fi-add");
            document.getElementById("fichier_img").classList.remove("fi-close");
            document.getElementById("fichier").classList.remove("red");
            document.getElementById("fichier_img").classList.add("fi-table");
            console.log(e.target.files[0].size);
            const size = e.target.files[0].size > 1024*1024 
                ? Math.round(e.target.files[0].size / 1024/1024) +' Mo' 
                : Math.round(e.target.files[0].size / 1024) + 'ko';
            // 30 Mo warning
            const warning = (e.target.files[0].size > 30*1024*1024) 
                ? `<p class='red'>
                    Attention, le fichier que vous avez choisi est assez volumineux (` + size + `).
                    <br/>
                    Son chargement et son traitement pourraient être longs et entrainer des erreurs.
                </p>` 
                : '';
            document.getElementById("fichier_txt").innerHTML = e.target.files[0].name + '</br>'  + size + warning;
            document.getElementById("fichier_txt").style.marginTop = "0";
        }
        else {
            document.getElementById("fichier_img").classList.remove("fi-add");
            document.getElementById("fichier_img").classList.remove("fi-table");
            document.getElementById("fichier_img").classList.add("fi-close");
            document.getElementById("fichier").classList.add("red");
            document.getElementById("fichier_txt").innerHTML = "<p class='red'> Erreur: Ce fichier n'est pas lisible par l'application</p>"
            + "Veuillez corriger avant de le charger ou choisir un autre fichier";
            document.getElementById("fichier_txt").style.marginTop = "0";
        }
    });
  
  //chargement du fichier exemple
    document.getElementById("exemple").addEventListener("click", () => {
        importedFile = exemple;
        Papa.parse(importedFile, {
            skipEmptyLines: true,
            complete: function (results) {
                parseResults = results;
                parseResults.header = parseResults.data[0];
                parseResults.columnCorrespondance = {
                    "[Nom]": 0, "[Rue]": 0, "[Code postal]": 0, "[Commune]": 0,
                    "[Adresse complète]": 0, "[Numéro de parcelle]": 0, "[Département]": 0
                };
                parseResults.data.shift();
                parseResults.ignore = "";
                preview(exemple);
                window.pr = parseResults;
                document.getElementById("three_col").click();
            }
        });
    });
  };

  var readXls = function(file, success, error)
  {
    var XLSXtoCSV = function (workbook) {
        var result = [];
        workbook.SheetNames.forEach(function (sheetName) {
            var csv = utils.sheet_to_csv(workbook.Sheets[sheetName]);
            if (csv.length > 0) {
            result.push("SHEET: " + sheetName);
            result.push("");
            result.push(csv);
            }
        });
        result.join("\n");
        success(result[2])
    };

    var reader = new FileReader();
    reader.onload = function (e) {
        var data = e.target.result;
        var workbook = read(data, { type: 'binary' });
        XLSXtoCSV(workbook);
    };
    reader.onerror = function () {
        error(file);
    }
    reader.readAsBinaryString(file);
  }

  export {parseResults, importedFile, clearParseResults, clearImportedFile, actionWindow};