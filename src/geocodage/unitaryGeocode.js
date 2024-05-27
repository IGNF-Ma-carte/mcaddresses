import { createRequestList, createAddress } from "./requests";
import { setGeocodePatience, geocodePatience } from "./loader";
import { geocodage, getAlternatives, getBestScoreIndex } from "./geocode";
import formatAddress from "./formatAddress";
import carte, {getFeatureLayer, getTempFeatureLayer} from "../carte";
import { selectAddressListAction } from "../liste_adresses/setList";
import { unselectAction } from "../interactions/unselectInteraction";
import { uniqueAltiGeocod } from "./alticodage";
import { parseResults } from "../import/selectFile";
import { createFeat } from "./features";
import dialog from "mcutils/dialog/dialog";
import { listCtrl } from "../liste_adresses/setList";


/**
 * Géocodage d'une adresse
 * @param {array} data : la donnée parsée
 * @param {integer} ind : l'indice de la feature associée à la donnée dans la variable "geocodage.results.feature"
 *                        Si la valeur est -1, la feature associée n'existe pas encore dans la variable
 */
 const unitaryGeocode = function(data, ind) {
  var geocodingType = "address";
  if(geocodage.type == "parcel") {
    geocodingType = "parcel";
  }
    var proms_batch = createRequestList(data, geocodingType).map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
    var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});
    setGeocodePatience(false);
    geocodePatience(timeout_proms_batch, false, true);
  
    return Promise.all(timeout_proms_batch)
      .then(response => {
        var r = [];
        for(let i in response) {
          if(response[i].ok){
            r.push(response[i]);
          }
        }
        if(!r.length) {
          if(ind == -1) {
            geocodage.results.apiFeatures.push(formatAddress());
            ind = geocodage.results.apiFeatures.length-1;
          }
          else {
            geocodage.results.apiFeatures[ind] = formatAddress(); 
          }
          endUnitaryGeocodAction(geocodage.results.apiFeatures[ind], data[0], ind);
          return;
        }
        Promise.all(r.map(resp => resp.json()))
      .then(function (res) {
        if(!res || !res.length) {
          if(ind == -1) {
            geocodage.results.apiFeatures.push(formatAddress());
            ind = geocodage.results.apiFeatures.length-1;
          }
          else { 
            geocodage.results.apiFeatures[ind] = formatAddress(); 
          }
          endUnitaryGeocodAction(geocodage.results.apiFeatures[ind], data[0], ind);
          return;
        }
  
        if(res[0].features && res[0].features.length && !parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
          var bestScoreInd = getBestScoreIndex(res[0].features, data[0]);
          res[0].features[bestScoreInd].properties.alternatives = getAlternatives(res[0].features, res[0].features[bestScoreInd]);
  
          if(ind == -1) {
            geocodage.results.apiFeatures.push(formatAddress(res[0].features[bestScoreInd]));
          }
          else {
            geocodage.results.apiFeatures[ind] = formatAddress(res[0].features[bestScoreInd]);
          }
  
          if (res[0].features[0].properties._score < 0.8) {
            if(ind == -1) {
              geocodage.results.tryAgain.push(geocodage.results.apiFeatures.length-1);  
            }
            else {
              geocodage.results.tryAgain.push(ind);
            }
          }
        }
        else if(res[0].features && res[0].features.length && parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
          if(ind == -1) {
            geocodage.results.apiFeatures.push(formatAddress(res[0].features[0]));
          }
          else { 
            geocodage.results.apiFeatures[ind] = formatAddress(res[0].features[0]);
          }
        }
        else {
          if(ind == -1) {
            geocodage.results.apiFeatures.push(formatAddress());
            geocodage.results.tryAgain.push(geocodage.results.apiFeatures.length-1);
          }
          else {
            geocodage.results.apiFeatures[ind] = formatAddress();
            geocodage.results.tryAgain.push(ind);
          }
        }
  
        if(ind == -1) {
          ind = geocodage.results.apiFeatures.length-1;
        }
  
        if (geocodage.results.tryAgain.length && !parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
          unitaryGeocodeAgain(createRequestList(data, "address", false, true), data, ind, true);
        }
        else {
          endUnitaryGeocodAction(geocodage.results.apiFeatures[ind], data[0], ind);
        }
      })
    })
  } ;
  
  /**
   * Nouvelle tentative de géocodage d'une adresse dans le cas où la première requête n'a pas renvoyé de réponse avec un score suffisant
   * @param {array} rqstList : array de taille 1 avec l'url de la requête
   * @param {array} data : la donnée parsée
   * @param {integer} ind : l'indice de la feature associée à la donnée dans la variable "geocodage.results.feature" 
   * @param {booléen} firstIteration : booléen pour savoir si c'est la première fois que l'on rentre dans cette fonction pour une adresse donnée 
   */
  const unitaryGeocodeAgain = function(rqstList, data, ind, firstIteration) {
    var proms_batch = rqstList.map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
    var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});
  
    return Promise.all(timeout_proms_batch)
      .then(response => {
        var r = [];
        for(let i in response) {
          if(response[i].ok){
            r.push(response[i]);
          }
        }
        Promise.all(r.map(resp => resp.json()))
      .then(function (res) {
        if(!res || !res.length) {
          endUnitaryGeocodAction(geocodage.results.apiFeatures[ind], data[0], ind);
          return;
        }
        var tryOnceMore = [];
  
        if (res[0].features && res[0].features.length) {
          var bestScoreInd = getBestScoreIndex(res[0].features, data[0]);

          var alternativesCandidates = res[0].features;

          alternativesCandidates.push(geocodage.results.apiFeatures[ind]);

          for(var j in geocodage.results.apiFeatures[ind].alternatives) {
            alternativesCandidates.push(geocodage.results.apiFeatures[ind].alternatives[j]);
          }

          if(res[0].features[bestScoreInd].properties._score > geocodage.results.apiFeatures[ind]._score) {
              geocodage.results.apiFeatures[ind] = formatAddress(res[0].features[bestScoreInd]);
          }

          geocodage.results.apiFeatures[ind].alternatives = getAlternatives(alternativesCandidates, geocodage.results.apiFeatures[ind]);

          if(firstIteration && geocodage.results.apiFeatures[ind]._score < 0.8 && !geocodage.stopTrying) {
            tryOnceMore.push(ind);
          }
          else if(geocodage.results.apiFeatures[ind]._score < 0.8 
            && !geocodage.stopTrying
            && geocodage.results.apiFeatures[ind]._type == "address") {
              var address = createAddress(data[0]).toUpperCase().replace(/-/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              if(geocodage.results.apiFeatures[ind].city
                && !address.match(geocodage.results.apiFeatures[ind].city.toUpperCase().replace(/-/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
                    tryOnceMore.push([geocodage.results.tryAgain[0], geocodage.results.apiFeatures[ind].city]);
              }
          }
        }
  
        geocodage.results.tryAgain = tryOnceMore;

        if(geocodage.results.tryAgain.length && firstIteration) {
          unitaryGeocodeAgain(createRequestList(data, "poi"), data, ind);
        }

        else if(geocodage.results.tryAgain.length) {
  
          var newCities = [];
          newCities.push(geocodage.results.tryAgain[0][1]);
      
          geocodage.stopTrying = true;
          unitaryGeocodeAgain(createRequestList(data, "address", newCities), data, ind);
        }
        else {
            endUnitaryGeocodAction(geocodage.results.apiFeatures[ind], data[0], ind);
        }
      });
    })
  };

  /**
* Actions à effectuer à la fin d'un géocodage unique
* @param {object} item : la feature renvoyée par l'api de géocodage
* @param {array} data : les données parsées asssociées à la feature
* @param {integer} ind : indice de la feature openlayers associée à l'adresse dans la variable "geocodage.results.olFeatures" (-1 si aucune feature associée)
*/
const endUnitaryGeocodAction = function(item, data, ind) {
    var feat = createFeat(item, data);
    var alternativeFeatArray = [];
    for(var i in feat._api_properties.alternatives) {
      alternativeFeatArray.push(createFeat(feat._api_properties.alternatives[i], data));
    }
    feat._api_properties.alternatives = alternativeFeatArray;
    if(geocodage.results.olFeatures[ind]) {
      feat.set("#", geocodage.results.olFeatures[ind].get("#"));
    }
    
    carte.getInteraction("select").getFeatures().clear();
    getTempFeatureLayer().getSource().clear();
    
    var updateType = "modify";
    
    if(!geocodage.results.olFeatures[ind]) {
      geocodage.results.olFeatures.push(feat);
      updateType = "add";
    }
    else {
      if(geocodage.results.olFeatures[ind].getGeometry()) {
        getFeatureLayer().getSource().removeFeature(geocodage.results.olFeatures[ind]);
      }
      geocodage.results.olFeatures[ind] = feat;
    }
    
    if(feat.getGeometry()) {
      getFeatureLayer().getSource().addFeature(geocodage.results.olFeatures[ind]);
      carte.getInteraction("select").getFeatures().push(geocodage.results.olFeatures[ind]);
      unselectAction();
    }
    else {
      unselectAction();
    }
    
    if(geocodage.altitude) {
      uniqueAltiGeocod(feat);
    }
    else {
      dialog.close();
    }
    listCtrl.setColumns(listCtrl.getColumns());
    selectAddressListAction(feat);
    };

    export {unitaryGeocode, unitaryGeocodeAgain};