import { geocodage } from "./geocode";
import { parseResults } from "../import/selectFile";
import { toLonLat } from 'ol/proj'

// var geocodLink = "https://geocodage.ign.fr/look4/";
var geocodLink = "https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/";
var altiGeocodLink = "https://wxs.ign.fr/calcul/alti/rest/elevation.xml?gp-access-lib=3.0.6";
var requestListByPack;
/**
 * Met à jour la variable "requestListByPack"
 * @param {*} val 
 */
var setRequestListByPack = function(val) {
    requestListByPack = val;
}

var altiRequestListByPack;

/**
 * Renvoie l'url des requêtes de géocodage par paquet d'array de taille 100
 * @param {array} data : les données parsées
 * @param {string} geocodingType : le type de géocodage (address ou poi)
 * @returns {array of array} les requêtes par paquet de 100
 */
 const createRequestListByPack = function(data, geocodingType) {
    var rqstList = [];
  
    var recursive_fct = function (d, start) {
      var end = start + geocodage.packLength;
      
      if (d.length < start + geocodage.packLength) {
        end = d.length;
      }
  
      rqstList.push(createRequestList(d.slice(start, end), geocodingType));
  
      if (d.length > end) {
        return recursive_fct(d, end);
      }
      else {
        return rqstList;
      }
    };
    return recursive_fct(data, 0);
  };

  /**
 * Récupère l'url des requêtes d'alticodage par paquet d'array de taille 100
 * @returns {array of array} les requêtes par paquet de 100
 */
const createAltiRequestListByPack = function() {
    var data = geocodage.results.olFeatures;
    var rqstList = [];
    var recursive_fct = function(d, start) {
      var end = start + geocodage.packLength;
  
      if (d.length < start + geocodage.packLength) {
        end = d.length;
      }
  
      rqstList.push(createAltiRequestList(data.slice(start, end)));
  
      if (d.length > end) {
        return recursive_fct(d, end);
      }
      else {
        return rqstList;
      }
    }
    return recursive_fct(data, (geocodage.currentPack - 1) * geocodage.packLength);
  };
  
  /**
   * Crée un array d'url pour les requêtes de géocodage
   * @param {array} data : les données parsées
   * @param {string} geocodingType : le type de géocodage (address ou poi)
   * @param {array} newCities : communes à utiliser dans les requêtes à la place de celles dans data (facultatif)
   * @param {booléen} noPostCode : booléen pour savoir si on doit faire des requêtes avec ou sans code postal
   * @returns {array} les url
   */
  const createRequestList = function (data, geocodingType, newCities, noPostCode) {
    var address;
    var res = [];
    for (var i in data) {
      if(newCities) {
        address = createAddress(data[i], newCities[i]);
      }
      else {
        address = createAddress(data[i], false, noPostCode);
      }
      // var r = geocodLink + geocodingType + "/search?q=" + encodeURIComponent(address);
      var r = geocodLink + "search?q=" + encodeURIComponent(address) + "&index=" + geocodingType;
  
      // if(geocodage.departement && parseResults.columnCorrespondance["[Département]"]) {
      //   var dep = data[i][parseResults.columnCorrespondance["[Département]"] - 1];
      //   if(dep.length == 1) {
      //     dep = "0" + dep;
      //   }
      //   r += "&filters[inseeCode]=" + dep;
      // }
      res.push(r);
    }
  
    return res;
  };
  
  /**
   * Crée un array d'url pour les requêtes d'alticodage
   * @param {array} data : les données parsées
   * @returns {array} les urls
   */
  const createAltiRequestList = function(data) {
    var res = [];
    var lonlat;
    for(var i in data) {
      lonlat = [0,0];
      if(data[i].getGeometry()) {
        var coord = data[i].getGeometry().getCoordinates();
        lonlat = toLonLat(coord); 
      }
      res.push(altiGeocodLink + "&lon=" + lonlat[0] + "&lat=" + lonlat[1] + "&indent=false&crs='CRS:84'&zonly=false"); 
    }
    return res;
  };
  
  /**
   * Création d'une requête de géocodage inverse
   * @param {objet} feature 
   * @returns 
   */
  const getReverseRequest = function(feature) {
    var lonlat;
    lonlat = [0,0];
    if(feature.getGeometry()) {
      var coord = feature.getGeometry().getCoordinates();
      lonlat = toLonLat(coord); 
    }
    return geocodLink + 'reverse?index=address&searchgeom={"type":"Circle","coordinates":['+ lonlat[0] +',' + lonlat[1] + '],"radius":10}&returntruegeometry=false';
  };
  
  /**
   * Renvoie l'adresse associèe à une donnée
   * @param {array} data : la donnée parsée
   * @param {string} newCity : la commune à utiliser dans l'adresse à la place de celle de data (facultatif)
   * @param {booléen} noPostCode : booléen pour savoir si on veut une adresse avec ou sans code postal
   * @returns string de l'adresse
   */
  const createAddress = function (data, newCity, noPostCode) {
    var address = "";
    if (parseResults.columnCorrespondance["[Adresse complète]"]) {
      address = data[parseResults.columnCorrespondance["[Adresse complète]"] - 1];
      if(noPostCode && address.match(/[^0-9][0-9]{5}[^0-9]/)) {
        var pc = address.match(/[^0-9][0-9]{5}[^0-9]/)[0];
        pc = pc.substring(1, pc.length-1); 
        address = address.replace(pc, "").replace("  ", " ").trim();
      }
      if(newCity) {
        address += " " + newCity;
      }
    }
    else if(parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
      address = data[parseResults.columnCorrespondance["[Numéro de parcelle]"] - 1];
    }
    else {
      address = data[parseResults.columnCorrespondance["[Rue]"] - 1];
      if(!noPostCode) {
        address += " " + data[parseResults.columnCorrespondance["[Code postal]"] - 1];
      }
      if(newCity) {
        address += " " + newCity;  
      }
      else {
        address += " " + data[parseResults.columnCorrespondance["[Commune]"] - 1];
      }
    }
    address = address.replace(/[Cc][Ee][Dd][Ee][Xx]\s{0,1}[0-9]{0,5}/g, "").replace(/\s\s/g," ").trim();
    address = address.replace(/[Bb][Pp]\s{0,1}[0-9]{0,5}/g, "").replace(/\s\s/g," ").trim();
  
    address = abbreviationManagement(address);
  
    return address;
  };
  
  /**
   * Essaye de détecter les abréviations dans l'adresse pour remettre le mot en entier
   * @param {string} address:  l'adresse
   * @returns {string} l'adresse modifiée
   */
  const abbreviationManagement = function(address) {
    if(address.match(/\s[Rr]\.{0,1}\s/) && !address.match(/\s[Rr][Uu][Ee]\s/)) {
      address = address.replace(/\s[Rr]\.{0,1}\s/, " rue ");
    }
    if(address.match(/\s[Bb][Dd]\.{0,1}\s/) && !address.match(/\s[Bb][Oo][Uu][Ll][Ee][Vv][Aa][Rr][Dd]\s/)) {
      address = address.replace(/\s[Bb][Dd]\.{0,1}\s/, " boulevard ");
    }
    if(address.match(/\s[Aa][Vv]\.{0,1}\s/) && !address.match(/\s[Aa][Vv][Ee][Nn][Uu][Ee]\s/)) {
      address = address.replace(/\s[Aa][Vv]\.{0,1}\s/, " avenue ");
    }
    return address;
  };

  export {createAddress, getReverseRequest, createRequestList,createAltiRequestListByPack, createRequestListByPack, altiGeocodLink, requestListByPack, setRequestListByPack,  altiRequestListByPack};