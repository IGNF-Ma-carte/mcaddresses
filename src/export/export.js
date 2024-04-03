import Papa from 'papaparse';
import { geocodage } from '../geocodage/geocode';
import { parseResults } from '../import/selectFile';
import { getAddressLabelFromFeat } from '../geocodage/features';
import { toLonLat } from 'ol/proj';
import dialog from 'mcutils/dialog/dialog';
import { connectDialog } from 'mcutils/charte/macarte'
import * as XLSX from 'xlsx/xlsx.mjs';
import carte, { getFeatureLayer } from '../carte';
import GeoJSON from 'ol/format/GeoJSON';
import {transformExtent} from 'ol/proj'
import api from 'mcutils/api/api';
import {getEditorURL} from 'mcutils/api/serviceURL';
import saveCarte from 'mcutils/dialog/saveCarte';
import options from 'mcutils/config/config';
import setAlerte from '../unload';

var exportFile;

/**
 * Dialogue pour l'export
 */
const exportDialog = function(callback) {
    var html = "<div id='export_dialog_buttons' class='hidden'><a class='button button-colored' type='button' download='adresses.csv' id='csv_export_button'>Export .CSV</a>";
    html += "<a class='button button-colored' type='button' download='adresses.xlsx' id='excel_export_button'>Export .XLSX</a>";
    html += "<a class='button button-colored' type='button' download='adresses.kml' id='kml_export_button'>Export .KML</a>"
    html += "<a class='button button-colored' type='button' download='adresses.geojson'id='geojson_export_button'>Export .GEOJSON</a></div>";
    html += "<div id='export_radio'><p>Dans quel format souhaitez-vous enregister la carte ?</p>";
    html += "<label class='ol-ext-check ol-ext-radio' for='csv'><input type='radio' name='limit' id='csv' value='' /><span></span> Format texte tabulé .csv </label></br>";
    html += "<label class='ol-ext-check ol-ext-radio' for='excel'><input type='radio' name='limit' id='excel' value='' /><span></span> Format Excel .xlsx </label></br>";
    html += "<label class='ol-ext-check ol-ext-radio' for='kml'><input type='radio' name='limit' id='kml' value='' /><span></span> Format géographique .kml </label></br>";
    html += "<label class='ol-ext-check ol-ext-radio' for='geojson'><input type='radio' name='limit' id='geojson' value='' /><span></span> Format géographique .geojson </label></br></div>";

    dialog.show({content: html, title: "Enregister", className: "file_export", 
                buttons: {submit : 'Enregistrer', cancel: 'Annuler'},
                onButton: (click) => {
                    switch (click){
                        case 'submit':
                            document.getElementById("export_radio").querySelectorAll("input").forEach(elt => {
                                if(elt.checked) {
                                    if(!document.getElementById(elt.id + "_export_button").href) {
                                        document.getElementById(elt.id + "_export_button").href = getExportLink(elt.id);
                                    }
                                    document.getElementById(elt.id + "_export_button").click();
                                    dialog.close();
                                    if(callback) {
                                        callback();
                                    }
                                }
                            });
                            break;
                        case 'cancel':
                            dialog.close();
                            break;
                    }
                }
    });
};

/**
 * Formate les données pour l'export xlsx
 * @returns {array} Les données formatées pour l'export xlsx
 */
const getXlsxExportData = function() {
    var data = [];
    var header = ["score", "qualité", "adresse géocodée"];
    if(geocodage.altitude) {
        header.push("altitude");
    }
    for(var i in parseResults.header) {
        header.push(parseResults.header[i]);
    }
    header.push("code INSEE");
    header.push("longitude");
    header.push("latitude");
    data.push(header);

    for(var j in geocodage.results.olFeatures) {
        var f = geocodage.results.olFeatures[j];
        var d = [];

        d.push(f._api_properties._score);

        if(f._api_properties._score == 0) {
            d.push("");    
            d.push("");    
        }
        else {
            d.push(f._api_properties.quality);
            d.push(getAddressLabelFromFeat(f));    
        }

        if(geocodage.altitude) {
            d.push(f._api_properties.altitude);
        }

        for(var k in parseResults.header) {
            d.push(f._data[parseResults.header[k]]);
        }

        if(f._api_properties.inseeCode)
        {
            d.push(f._api_properties.inseeCode);
        }
        else {
            d.push("");
        }

        d.push(f.get("Longitude"));
        d.push(f.get("Latitude"));

        data.push(d);
    }

    return data;
};

/**
 * Formate les données pour l'export shp et csv
 * @returns {array} Les données formatées pour l'export shp et csv
 */
const getExportData = function(type) {
    var data = [];

    for(var i in geocodage.results.olFeatures) {
        data.push(getFeatureExportData(geocodage.results.olFeatures[i], type));
    }

    return data;
};

const getFeatureExportData = function(feat, type) {
    let prop = feat._api_properties;
    let data = feat._data;
    var featData = {"score": prop._score};

    if(prop._score==0) {
        featData["qualité"] = "";
        featData["adresse géocodée"] = "";
    }
    else {
        featData["qualité"] = prop.quality;
        featData["adresse géocodée"] = prop.geocodedAddress;
    }
    if(geocodage.altitude)
    {
        featData["altitude"] = prop.altitude;
    }

    for(var j in data) {
        featData[j] = data[j];
    }

    if(prop.inseeCode)
    {
        featData["code INSEE"] = prop.inseeCode;
    }
    else {
        featData["code INSEE"] = "";
    }
    featData["longitude"] = feat.get("Longitude");
    featData["latitude"] = feat.get("Latitude");

    if(type == "kml" && feat.getGeometry() && feat.getGeometry().getType() == "Polygon") {
        featData["polygoneCoords"] = [];
        for(let i in feat.getGeometry().getCoordinates()) {
            for(let j in feat.getGeometry().getCoordinates()[i]) {
                coords = feat.getGeometry().getCoordinates()[i][j]
                featData["polygoneCoords"].push([toLonLat(coords)]);
            }
        }
    }

    return featData;
}

/**
 * Crée le lien pour l'export csv
 * @returns 
 */
const getCsvExportLink = function() {
    var data = getExportData();
    var csv = Papa.unparse(data, {
        quotes: true,
        delimiter: parseResults.meta.delimiter,
        header: true,
        newline: parseResults.meta.linebreak
    });

    try {
        var blob = new Blob([csv], {type: 'text/plain;charset=utf8'});
    } catch  {
        alert("Désolé, le fichier étant trop volumineux, la mémoire du navigateur n'est pas suffisante pour générer l'export :(");
    }

    if (exportFile !== null) {
        window.URL.revokeObjectURL(exportFile);
      }
    exportFile = window.URL.createObjectURL(blob);

    return exportFile;
};

/**
 * Crée le xml pour l'export kml
 * @param {array} data : les données à exporter
 * @returns {string} Le xml
 */
const getKml = function(data) {
    var kml = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2">
        `;
    kml += `<Folder>
            <Style id="veryGoodScore">
                <IconStyle>
                    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-blank.png</href></Icon>
                </IconStyle>
            </Style>
            `;
    kml += `<Style id="goodScore">
                <IconStyle>
                    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-blank.png</href></Icon>
                </IconStyle>
            </Style>
            `;
    kml += `<Style id="mediumScore">
                <IconStyle>
                    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/red-blank.png</href></Icon>
                </IconStyle>
            </Style>
            `;
    kml += `<Style id="manualScore">
                <IconStyle>
                    <Icon><href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href></Icon>
                </IconStyle>
            </Style>
            `;
    kml += `<Style id="polygon">
                <LineStyle>
                    <color>ff0088ff</color>
                    <width>2</width>
                </LineStyle>
                <PolyStyle>
                    <color>990088ff</color>
                </PolyStyle>
            </Style>
            `;
    kml += `<name>Export MesAdresses</name>
            `;
    kml += `<description>Ce fichier a été créé via l'application MesAdresses</description>`;

    for(var i in data) {
        if(data[i].score != 0) {
            var style = "manualScore";
            if(data[i].score > 0.8) {
                style = "veryGoodScore";
            }
            else if(data[i].score > 0.5) {
                style = "goodScore";
            }
            else if(data[i].score > 0) {
                style = "mediumScore";
            }

            if(data[i].polygoneCoords) {
                kml += `
            <Placemark>
                <styleUrl>#polygon</styleUrl>
                `;
                kml += `<Polygon>
                    <outerBoundaryIs>
                        <LinearRing>
                            <coordinates>
                                `;
                for(let j in data[i].polygoneCoords) {
                    kml += `` + data[i].polygoneCoords[j][0] + " " + `
                                `;
                }
                kml += `</coordinates>
                    </LinearRing>
                </outerBoundaryIs>
            </Polygon>
    `;
            }
            else {
                kml += `
                <Placemark>
                    <styleUrl>#' + style + '</styleUrl>
                    `;
                kml += `<Point>
                    <coordinates>
                        ` + data[i].longitude + ',' + data[i].latitude + `
                    </coordinates>
                </Point>`;
            }
            
            kml += `        <ExtendedData>`;
            var d = "";
            for(var j in data[i]) {
                if(j == "polygoneCoords") {
                    continue;
                }
                if(data[i][j]) {
                        d = data[i][j].toString().replace(/&/g, '&amp;');
                        d = d.replace(/</g, '&lt;');
                        d = d.replace(/>/g, '&gt;');
                        d = d.replace(/"/g, '&quot;');
                        d = d.replace(/'/g, '&apos;');
                }
                else {
                    d = "";
                }
                kml += `
                <Data name="` + j + `">
                    <value>` + d + `</value>
                </Data>`
            }
            kml += `
            </ExtendedData>
        </Placemark>`;
        }
    }

    kml += `
    </Folder>
</kml>`;

    return kml;
}

/**
 * Crée le lien pour l'export kml
 */
const getKmlExportLink = function() {
    var data = getExportData("kml");

    var kml = getKml(data);

    try {
        var blob = new Blob([kml], {type: 'text/plain;charset=utf8'});
    }
    catch (error) {
        alert("Désolé, le fichier étant trop volumineux, la mémoire du navigateur n'est pas suffisante pour générer l'export :(");
    }

    if (exportFile !== null) {
        window.URL.revokeObjectURL(exportFile);
      }
    exportFile = window.URL.createObjectURL(blob);

    return exportFile;
};

/**
 * Crée le lien pour l'export geojson
 */
const getGeojsonExportLink = function() {
    var format = new GeoJSON({"dataProjection": "EPSG:4326", "featureProjection": "EPSG:3857"});
    var features = getFeatureLayer().getSource().getFeatures();

    try {
        var obj = format.writeFeatures(features);
    }
    catch (error) {
        alert("Désolé, le fichier étant trop volumineux, la mémoire du navigateur n'est pas suffisante pour générer l'export :(");
    }

    var blob = new Blob([obj], {type: 'text/plain;charset=utf8'});

    if (exportFile !== null) {
        window.URL.revokeObjectURL(exportFile);
      }
    exportFile = window.URL.createObjectURL(blob);

    return exportFile;
}

/**
 * Crée le lien pour l'export xlsx
 */
const getXlsxExportLink = function() {

    var data = getXlsxExportData();

    var wb = XLSX.utils.book_new();

    wb.Props = {
        Title: "Export MesAdresses",
        Subject: "Adresses",
        CreatedDate: new Date()
    };
    wb.SheetNames.push("Adresses");

    
    try {
        var ws = XLSX.utils.aoa_to_sheet(data);
    }
    catch (error) {
        alert("Désolé, le fichier étant trop volumineux, la mémoire du navigateur n'est pas suffisante pour générer l'export :(");n;
    }

    wb.Sheets["Adresses"] = ws;

    try {
        var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    }
    catch (error) {
        alert("Désolé, le fichier étant trop volumineux, la mémoire du navigateur n'est pas suffisante pour générer l'export :(");
    }

    function s2ab(s) { 
        var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        var view = new Uint8Array(buf);  //create uint8array as viewer
        for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
        return buf;    
    }

    var blob = new Blob([s2ab(wbout)],{type:"application/octet-stream"});

    if (exportFile !== null) {
        window.URL.revokeObjectURL(exportFile);
      }
    exportFile = window.URL.createObjectURL(blob);

    return exportFile;
};

/**
 * Renvoie lien pour l'export en fonction du type souhaité
 * @param {string} type 
 * @returns {function}
 */
const getExportLink = function(type) {
    switch(type) {
        case "csv":
            return getCsvExportLink();
        case "excel":
            return getXlsxExportLink();
        case "kml":
            return getKmlExportLink();
        case "geojson":
            return getGeojsonExportLink();
    }
};

const switchToMaCarte = function() {
    // Cart options
    const bbox = carte.getMap().getView().calculateExtent();
    var opt = {
        active: "true", 
        type: "macarte", 
        premium: "default", 
        bbox: transformExtent(bbox, carte.getMap().getView().getProjection(), 'EPSG:4326') 
    };

    var html = "<i class='fi-check'></i>La carte a été enregistrée avec succès." +
               "<br>" + 
               "Vous pouvez la reprendre pour la modifier (lui ajouter des fonds, des informations, la partager, etc.) ou créer une narration basée sur cette carte.";

    var callback = function(lien) {
        setAlerte(false)
        dialog.show({
            content: html, 
            title: "Enregistrement fichier", 
            className: "save_map",
            buttons: { edit: 'Reprendre la carte', /* story: 'Charger',*/ cancel: 'Continuer sur les adresses' },
            onButton: b => {
                switch (b) {
                    case 'edit':
                        document.location.href = lien;
                        break;
                    case 'story':
                        window.open(options.server + "edition/narration/");
                        break;
                    case 'cancel':
                        dialog.close();
                        break;
                }
            }
        });
    };

    saveCarte(opt, mapOpt => {
        // Write uncompress
        const data = carte.write()
        const postMap = function() {
            dialog.showWait('Enregistrement en cours...')
            api.postMap(mapOpt, data, (e) => {
                if (e.status == 401) {
                    dialog.close();
                    connectDialog(postMap);
                }
                else {
                    callback(getEditorURL(e))
                }
            });
        };

        postMap();
    });
};

export {exportFile, exportDialog, switchToMaCarte}