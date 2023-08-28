import { parseResults} from "./selectFile";
import { setHeaderSelect, resetColumnCorresp, csvp } from "./preview";

/**
 * Fonction pour créer les events listener de l'onglet "séparateur" de la fenêtre de paramétrage du géocodage
 */
const setSeparatorSectionEvents = function () {
    document.getElementById("separator_section_div").querySelectorAll("input").forEach(elt => {
        elt.addEventListener("click", () => {
            document.getElementById("other_input").disabled = !document.getElementById("other").checked;
            document.getElementById("other_input").classList.remove("focus");
            if(elt.id != "other_input") {
                setSeparator(elt.id);
            }
        });
    });
  
    document.getElementById("other_input").addEventListener("focusin", () => {
        document.getElementById("other_input").classList.add("focus");
    });
    document.getElementById("other_input").addEventListener("input", () => {
        setSeparator("other");
    });
};
  
/**
 * Fonction pour créer les events listener de l'onglet "lignes du fichier" de la fenêtre de paramétrage du géocodage
 */
const setFileLineSectionEvents = function () {
    document.getElementById("first_line").addEventListener("click", () => {
        if (document.getElementById("first_line").checked) {
            parseResults.header = parseResults.data[0];
            parseResults.data.shift();
        }
        else {
            parseResults.data.unshift(Array.from(parseResults.header));
            for (var i in parseResults.header) {
                parseResults.header[i] = Number(i) + 1;
            }
        }
        csvp.showData({delimiter: parseResults.delim, skipEmptyLines: true, header: document.getElementById("first_line").checked, comments: parseResults.comm})
        addOptionsToSelect();
    });
  
    document.getElementById("ignore_checkbox").addEventListener("click", () => {
        document.getElementById("ignore_input").disabled = !document.getElementById("ignore_checkbox").checked;
        document.getElementById("ignore_input").classList.toggle("focus");
        parseResults.comm = false;
        if (document.getElementById("ignore_checkbox").checked) {
            document.getElementById("ignore_input").focus();
            parseResults.comm = document.getElementById("ignore_input").value;
        }
        csvp.showData({delimiter: parseResults.delim, skipEmptyLines: true, header: document.getElementById("first_line").checked, comments: parseResults.comm})
    });
    document.getElementById("ignore_input").addEventListener("input", () => {
        parseResults.comm = false;
        if (document.getElementById("ignore_checkbox").checked) {
            parseResults.comm = document.getElementById("ignore_input").value;
            addOptionsToSelect();
        }

        csvp.showData({delimiter: parseResults.delim, skipEmptyLines: true, header: document.getElementById("first_line").checked, comments: parseResults.comm})
    });
  
    document.getElementById("start_line_checkbox").addEventListener("click", () => {
        document.getElementById("start_line_input").disabled = !document.getElementById("start_line_checkbox").checked;
        document.getElementById("start_line_input").classList.toggle("focus");
        if (document.getElementById("start_line_checkbox").checked) {
            document.getElementById("start_line_input").focus();
            parseResults.startLine = Number(document.getElementById("start_line_input").value)
        }
        else {
            parseResults.startLine = 0;
        }
    });
    document.getElementById("start_line_input").min = 1;
    document.getElementById("start_line_input").max = parseResults.data.length;
    document.getElementById("start_line_input").addEventListener("change", () => {
        if (document.getElementById("start_line_checkbox").checked) {
            parseResults.startLine = Number(document.getElementById("start_line_input").value);
        }
        else {
            parseResults.startLine = 0;
        }
    });
  
    document.getElementById("end_line_checkbox").addEventListener("click", () => {
        document.getElementById("end_line_input").disabled = !document.getElementById("end_line_checkbox").checked;
        document.getElementById("end_line_input").classList.toggle("focus");
        if (document.getElementById("end_line_checkbox").checked) {
            document.getElementById("end_line_input").focus();
            parseResults.endLine = Number(document.getElementById("end_line_input").value);
        }
        else {
            parseResults.endLine = 0;
        }
    });
  
    document.getElementById("end_line_input").min = 1;
    document.getElementById("end_line_input").max = parseResults.data.length;
    document.getElementById("end_line_input").addEventListener("change", () => {
        if (document.getElementById("end_line_checkbox").checked) {
            parseResults.endLine = Number(document.getElementById("end_line_input").value);
        }
        else {
            parseResults.endLine = 0;
        }
    });
};
  
/**
 * Fonction pour créer les events listener de l'onglet "colonnes du fichier" de la fenêtre de paramétrage du géocodage
 */
const setColumnSectionEvents = function () {
    document.getElementById("three_col").addEventListener("click", () => {
        resetColumnCorresp();
        setVisibilityColList("three_col_list");
        autoDetect("three_col");
    });
  
    document.getElementById("one_col").addEventListener("click", () => {
        resetColumnCorresp();
        setVisibilityColList("one_col_list");
        autoDetect("one_col");
    });
  
    document.getElementById("one_col_parcel").addEventListener("click", () => {
        resetColumnCorresp();
        setVisibilityColList("one_col_parcel_list");
        autoDetect("one_col_parcel");
    });
    setSelectEvent();
};
  


/**
 * Gère l'apparence de l'ongle "colonnes du fichier"
 * @param {string} listToDisplay: la classe de la liste à afficher dans l'onglet "colonnes du fichier"
 */
const setVisibilityColList = function (listToDisplay) {
    var listIds = ["one_col_list", "three_col_list", "one_col_parcel_list"];
  
    for (var i in listIds) {
        if (listIds[i] == listToDisplay) {
            if (document.getElementById(listIds[i]).classList.contains("hidden")) {
                document.getElementById(listIds[i]).classList.toggle("hidden");
            }
        }
        else {
            if (!document.getElementById(listIds[i]).classList.contains("hidden")) {
                document.getElementById(listIds[i]).classList.toggle("hidden");
            }
        }
    }
};
  
/**
 * Détection automatique des colonnes en fonction du formatage choisi dans l'onglet "colonnes du fichier"
 * @param {string} type : le type de formatage sur lequel effectuer l'autodetect
 */
const autoDetect = function (type) {
    var searchCorrespondanceInHeader = function (item) {
        var stop = false;
        for (var i in item) {
            for (var j in parseResults.header) {
                if (parseResults.header[j].toString().toUpperCase().trim() == i.toUpperCase().trim()) {
                    item[i] = j;
                    stop = true;
                    break;
                }
            }
            if (stop) {
                break;
            }
        }
        return item;
    };
  
    var doAutoDetect = function (item, id) {
        for (var i in item) {
            if (item[i] > -1) {
                document.getElementById(id).value = parseResults.header[item[i]];
                document.getElementById(id).dispatchEvent(new Event("change"));
                break;
            }
        }
    };
  
    var nameIndex = {
        "nom": -1,
        "noms": -1,
        "name": -1,
        "names": -1
    };
    nameIndex = searchCorrespondanceInHeader(nameIndex);
  
    switch (type) {
      case "three_col":
        var streetIndex = {
          "rue": -1,
          "voie": -1,
          "adresse": -1,
          "rues": -1,
          "voies": -1,
          "adresses": -1,
          "street": -1,
          "address": -1,
          "streets": -1,
          "addresses": -1,
        };
        var postalCodeIndex = {
          "code postal": -1,
          "code_postal": -1,
          "cp": -1,
          "codes postaux": -1,
          "codes_postaux": -1,
          "postal code": -1,
          "postal_code": -1,
          "postal_codes": -1,
          "postal codes": -1
        };
        var cityIndex = {
          "commune": -1,
          "ville": -1,
          "communes": -1,
          "villes": -1,
          "city": -1,
          "cities": -1
        };
  
        streetIndex = searchCorrespondanceInHeader(streetIndex);
        postalCodeIndex = searchCorrespondanceInHeader(postalCodeIndex);
        cityIndex = searchCorrespondanceInHeader(cityIndex);
  
        doAutoDetect(nameIndex, "name_select");
        doAutoDetect(streetIndex, "street_select");
        doAutoDetect(postalCodeIndex, "postal_code_select");
        doAutoDetect(cityIndex, "city_select");
  
        break;
      case "one_col":
        var addressIndex = {
            "adresse complète": -1,
            "adresse complete": -1,
            "adresse_complète": -1,
            "adresse_complete": -1,
            "adresses complètes": -1,
            "adresses completes": -1,
            "adresses_complètes": -1,
            "adresses_completes": -1,
            "adresse": -1,
            "adresses": -1,
            "full address": -1,
            "complete address": -1,
            "full_address": -1,
            "complete_address": -1,
            "full_addresses": -1,
            "complete_addresses": -1,
            "address": -1,
            "addresses": -1
        };
        addressIndex = searchCorrespondanceInHeader(addressIndex);
        doAutoDetect(nameIndex, "name_select_bis");
        doAutoDetect(addressIndex, "address_select");
        break;
    case "one_col_parcel":
        var parcelIndex = {
            "parcelle": -1,
            "numéro de parcelle": -1,
            "numéro parcelle": -1,
            "num parcelle": -1,
            "numero de parcelle": -1,
            "numero parcelle": -1,
            "numéro_de_parcelle": -1,
            "numéro_parcelle": -1,
            "num_parcelle": -1,
            "numero_de_parcelle": -1,
            "numero_parcelle": -1,
            "parcelles": -1,
            "numéros de parcelle": -1,
            "numéros parcelle": -1,
            "num parcelles": -1,
            "numeros de parcelle": -1,
            "numeros parcelle": -1,
            "numéros_de_parcelle": -1,
            "numéros_parcelle": -1,
            "numeros_de_parcelle": -1,
            "numeros_parcelle": -1,
            "parcel": -1,
            "parcel number": -1,
            "parcel_number": -1,
            "parcels": -1,
            "parcel numbers": -1,
            "parcel_numbers": -1
        };
        addressIndex = searchCorrespondanceInHeader(parcelIndex);
        doAutoDetect(nameIndex, "name_select_ter");
        doAutoDetect(parcelIndex, "parcel_select");
         break;
    }
};
  
/**
 * Parse le fichier avec le séparateur choisi
 * @param {string} separator: le type de séparateur 
 */
const setSeparator = function (separator) {
    switch (separator) {
        case "auto":
            parseResults.delim = "";
            break;
        case "tab":
            parseResults.delim = "\t"
            break;
        case "virgul":
            parseResults.delim = ",";
            break;
        case "ptvir":
            parseResults.delim = ";";
            break;
        case "other":
            parseResults.delim = document.getElementById("other_input").value;
            break;
        default:
            parseResults.delim = "";
    }
  
    csvp.showData({delimiter: parseResults.delim, skipEmptyLines: true, header: document.getElementById("first_line").checked});
  };
  
/**
 * Ajoute les bonnes options aux listes déroulantes 
 */
const addOptionsToSelect = function () {
    var data = parseResults.data;
    var selIdArray = ["name_select", "name_select_bis", "name_select_ter", "street_select", "postal_code_select", "city_select", "address_select", "parcel_select"/*, "dep_select"*/];
  
    for (var i in selIdArray) {
        const sel = document.getElementById(selIdArray[i]);
        sel.innerHTML = "";
        var opt = new Option("Select", "");
        opt.disabled = true;
        opt.selected = true;
        opt.hidden = true;
        sel.add(opt);
        for (var j in data[0]) {
            document.getElementById(selIdArray[i]).add(new Option(parseResults.header[j], parseResults.header[j]));
        }
    }
};
  
/**
 * Events lors de la sélection dans les listes déroulantes
 */
const setSelectEvent = function () {
    var selIdArray = ["name_select", "name_select_bis", "name_select_ter", "street_select", "postal_code_select", "city_select", "address_select", "parcel_select"/*, "dep_select"*/];
  
    //pour chaque liste déroulante
    for (var i in selIdArray) {
        const sel = document.getElementById(selIdArray[i]);
        //Event au changement de valeur
        sel.addEventListener("change", () => {
            var corresp = {
                name_select: "[Nom]",
                street_select: "[Rue]",
                postal_code_select: "[Code postal]",
                city_select: "[Commune]",
                name_select_bis: "[Nom]",
                address_select: "[Adresse complète]",
                name_select_ter: "[Nom]",
                parcel_select: "[Numéro de parcelle]",
                dep_select: "[Département]"
            };
            var columnResp = parseResults.columnCorrespondance;
            var nbCol = 0;
    
            if (sel.value != "vide") {
                const val = sel.value;
        
                for (var j in parseResults.header) {
                    if (parseResults.header[j] == val) {
                        nbCol = Number(j) + 1;
                        break;
                    }
                }
            }
            columnResp[corresp[sel.id]] = nbCol;
            setHeaderSelect();
            if (!sel.classList.contains("ok")) {
                sel.classList.add("ok");
            }
        });
    }
};

export {setSeparatorSectionEvents, setFileLineSectionEvents, setColumnSectionEvents, addOptionsToSelect};