import { parseResults } from "../import/selectFile.js";
import { requestListByPack } from "./requests.js";
import carte from '../carte.js';
import dialog from "mcutils/dialog/dialog";
import { createList, listHeader, listHeaderShow, setListHeader } from "../liste_adresses/createList.js";
import { updatePanelView } from "../modification_adresse/address_fct.js";
import Chart from "chart.js/auto";
import colors from "../colors";
import formatAddress from "./formatAddress.js";
import { updatePatience, geocodePatience } from "./loader.js";
import { getScoreCount, getReportHtml } from "./report.js";
import {createAddress, createRequestList} from "./requests.js";
import { calcIndice } from "./scoreWeighting.js";
import { altiGeocode} from "./alticodage.js";
import { addFeat } from "./features.js";

var geocodage = {};

var stopGeocode = false;

/**
 * Met à jour la variable permettant de savoir si un géocodage doit continuer ou non
 * @param {Booléen} bool 
 */
const setStopGeocode = function(bool) {
  stopGeocode = bool;
};

/**
 * Récupère l'index d'une feature dans les tableaux geocodage.results.apiFeatures et geocodage.results.olFeatures
 * @param {objet} f : feature dont on veut connaitre l'index
 * @returns 
 */
const getFeatureIndex = function(f) {
  var ind = f.get("originalIndex"); 
  if(!geocodage.removedIndex.length) {
    return ind;
  }
  var count = 0;
  for(var i in geocodage.removedIndex) {
    if(ind > geocodage.removedIndex[i]) {
      count++;
    }
  }
  return ind - count;
};

/**
 * Réinitialise la variable "geocodage"
 */
const clearGeocodage = function() {
  stopGeocode = false;
  geocodage = {};
  geocodage.packLength = 100;
  geocodage.removedIndex = [];
  geocodage.getFeatureIndex = getFeatureIndex;
  geocodage.results = { olFeatures: [], apiFeatures : [] };
  geocodage.results.tryAgain = [];
  window.geoc = geocodage;
}

geocodage.packLength = 100;
geocodage.removedIndex = [];
geocodage.getFeatureIndex = getFeatureIndex;
geocodage.results = { apiFeatures: [], olFeatures: [], apiFeatures : [] };
geocodage.results.tryAgain = [];
window.geoc = geocodage;

/**
 * Promise avec timeout
 * @param {Object} val: valeur renvoyé par la promesse 
 * @param {integer} t: temps en millisecondes avant le timeout 
 * @returns 
 */
Promise.delay = function(val, t) {
  if(!t) {
    t = 15000;
  }
  return new Promise(resolve => {
      setTimeout(resolve.bind(null, val), t);
  });
};

/**
 * Géocodage des adresses tirées d'un fichier parsée
 * Les géocodages sont effectués par paquet de 100 adresses
 */
 const geocode = function() {
  //Paquet de 100 requêtes à envoyer à l'API de géocodage
  var proms_batch = requestListByPack[geocodage.currentPack].map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
  //On ajoute un timeout pour ces requêtes
  var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});

  geocodePatience(timeout_proms_batch);

  //On envoie les requêtes - Promise.all permet d'attendre d'avoir toutes les réponses avant de passer à la suite et garde les réponses dans l'ordre d'envoie des requêtes
  Promise.all(timeout_proms_batch)
    .then(response => {
      var r = [];
      for(let i in response) {
        if(response[i].ok){
          r.push(response[i]);
        }
        else {
          if(!geocodage.error) {
            geocodage.error = [];
          }
          geocodage.error.push({promise: response[i], index: geocodage.results.apiFeatures.length + Number(i)});
        }
      }
      Promise.all(r.map(resp => resp.json()))
      .then(function (res) {
        if(!res || !res.length) {
          updateFeaturesArrayWithErrors();

          if(geocodage.altitude) {
            geocodage.currentPack++;
            addFeat();
            altiGeocode();
          }
          else if ((geocodage.currentPack + 1) < requestListByPack.length && !stopGeocode){
            geocodage.currentPack++;
            geocode();
          }
          else {
            endGeocodAction();
          }
          return;
        }
        for (let i in res) {
          var ind = Number(i) + (geocodage.currentPack * geocodage.packLength);
          if (res[i].features && res[i].features.length && !parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
            var bestScoreInd = getBestScoreIndex(res[i].features, parseResults.data[ind])
            res[i].features[bestScoreInd].properties.alternatives = getAlternatives(res[i].features, res[i].features[bestScoreInd]);
            geocodage.results.apiFeatures.push(formatAddress(res[i].features[bestScoreInd]));
            
            
            if (res[i].features[0].properties._score < 0.8) {
              geocodage.results.tryAgain.push(ind);
            }
          }
          else if(res[i].features && res[i].features.length && parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
            geocodage.results.apiFeatures.push(formatAddress(res[i].features[0]));
          }
          else {
            geocodage.results.apiFeatures.push(formatAddress());
            geocodage.results.tryAgain.push(ind);
          }
        }

        if (geocodage.results.tryAgain.length && !parseResults.columnCorrespondance["[Numéro de parcelle]"]) {
          var data = [];
          for (let i in geocodage.results.tryAgain) {
            data.push(parseResults.data[geocodage.results.tryAgain[i]]);
          }
          geocodeAgain(createRequestList(data, "address", false, true), true);
        }
        else {
          updateFeaturesArrayWithErrors();
          if(geocodage.altitude) {
            geocodage.currentPack++;
            addFeat();
            altiGeocode();
          }
          else if((geocodage.currentPack + 1) < requestListByPack.length && !stopGeocode) {
            geocodage.currentPack++;
            geocode();
          }
          else {
            endGeocodAction();
          }
        }
      });
    });
    //en attendant que les promises du paquet actuel soient résolues, on ajoute dans la carte les adresses géocodées lors du paquet précédent
    if(geocodage.currentPack && !geocodage.altitude) {
      addFeat();
    }
};

/**
 * Nouvelle tentative de géodage pour les adresses dont la première tentative n'a pas renvoyé de résultat avec un score suffisant
 * @param {array} rqstList : les url pour les requêtes
 * @param {booléen} firstIteration : booléen pour savoir si c'est la première fois que l'on rentre dans cette fonction pour le paquet d'adresse en cours de géocodage
 */
const geocodeAgain = function (rqstList, firstIteration) {
  var proms_batch = rqstList.map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
  var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});

  updatePatience(timeout_proms_batch, "enhancement");

  return Promise.all(timeout_proms_batch)
    .then(response => {
      var r = [];
      for(let i in response) {
        if(response[i].ok){
          r.push(response[i]);
        }
        else {
          geocodage.againError = [];
          geocodage.againError.push(i);
        }
      }
      Promise.all(r.map(resp => resp.json()))
    .then(function (res) {
      if(!res) {
        updateFeaturesArrayWithErrors();

        geocodage.stopTrying = false;
        
        if(geocodage.altitude) {
          geocodage.currentPack++;
          addFeat();
          altiGeocode();
        }

        else if ((geocodage.currentPack + 1) < requestListByPack.length && !stopGeocode) {
          geocodage.currentPack++;
          geocode();
        }
        else {
          endGeocodAction();
        }
      }
      var tryOnceMore = [];
      for(let i in geocodage.againError) {
        res.splice(geocodage.againError[i],0,false);
      }
      for (let i in res) {
        if(!res[i]) {
          continue;
        }
        var ind;
        if(!geocodage.stopTrying) {
          ind = geocodage.results.tryAgain[i];
        }
        else {
          ind = geocodage.results.tryAgain[i][0];
        }

        if (res[i].features && res[i].features.length) {
          var bestScoreInd = getBestScoreIndex(res[i].features, parseResults.data[ind]);
          
          var alternativesCandidates = res[i].features;

          alternativesCandidates.push(geocodage.results.apiFeatures[ind])

          for(let j in geocodage.results.apiFeatures[ind].alternatives) {
            alternativesCandidates.push(geocodage.results.apiFeatures[ind].alternatives[j]);
          }

          if(res[i].features[bestScoreInd].properties._score > geocodage.results.apiFeatures[ind]._score) {
            geocodage.results.apiFeatures[ind] = formatAddress(res[i].features[bestScoreInd]);
          }

          geocodage.results.apiFeatures[ind].alternatives = getAlternatives(alternativesCandidates,  geocodage.results.apiFeatures[ind]);

          if(firstIteration && geocodage.results.apiFeatures[ind]._score < 0.8 && !geocodage.stopTrying) {
            tryOnceMore.push(ind);
          }
          else if(geocodage.results.apiFeatures[ind]._score < 0.8 && !geocodage.stopTrying
          && geocodage.results.apiFeatures[ind]._type == "address") {
              var address = createAddress(parseResults.data[ind]).toUpperCase().replace(/-/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              if(geocodage.results.apiFeatures[ind].city 
                && !address.match(geocodage.results.apiFeatures[ind].city.toUpperCase().replace(/-/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, ""))) {
                  tryOnceMore.push([geocodage.results.tryAgain[i], geocodage.results.apiFeatures[ind].city]);
              }
          }
        }
      }

      geocodage.results.tryAgain = tryOnceMore;

      if(geocodage.results.tryAgain.length && firstIteration) {
        var data = [];
        for (let i in geocodage.results.tryAgain) {
          data.push(parseResults.data[geocodage.results.tryAgain[i]]);
        }
        geocodeAgain(createRequestList(data, "poi"));
      }
      else if(geocodage.results.tryAgain.length) {
        var data = [];
        var newCities = [];
        for (let i in geocodage.results.tryAgain) {
          data.push(parseResults.data[geocodage.results.tryAgain[i][0]]);
          newCities.push(geocodage.results.tryAgain[i][1]);
        }
        geocodage.stopTrying = true;
        geocodeAgain(createRequestList(data, "address", newCities));
      }
      else {
        updateFeaturesArrayWithErrors();

        geocodage.stopTrying = false;
        if(geocodage.altitude) {
          geocodage.currentPack++;
          addFeat();
          altiGeocode();
        }
        else if((geocodage.currentPack + 1) < requestListByPack.length && !stopGeocode) {
          geocodage.currentPack++;
          geocode();
        }
        else {
          endGeocodAction();
        }
      }
    });
  });
};

/**
 * Met à jour la variable "geocodage.results.feature" pour prendre en compte les requêtes ayant renvoyé une erreur
 */
 const updateFeaturesArrayWithErrors = function() {
  for(var i in geocodage.error) {
    var ind = geocodage.error[i].index;
    var borne = (geocodage.packLength * (geocodage.currentPack))-1;
    if(ind > borne) {
      geocodage.results.apiFeatures.splice(ind,0,formatAddress());
    }
  }
};

/**
 * Récupère l'index de la feature ayant le meilleur score après pondération parmi les réponses de l'API de géocodage
 * @param {*} elem : les réponses de l'API
 * @param {*} data : les données du fichier d'import relative à l'adresse recherchée
 * @returns 
 */
const getBestScoreIndex = function(elem, data) {
  var bestScoreInd = 0;
  var bestScore = 0;
  for (let i in elem) {
    elem[i].properties._score = calcIndice(elem[i], data);

    if (elem[i].properties._score > bestScore) {
      bestScore = elem[i].properties._score;
      bestScoreInd = i;
    }
  }
  return bestScoreInd;
};

/**
 * Récupère les adresses alternatives associée à une adresse géocodée
 * @param {array} featArray : array des features renvoyées par l'api de géocodage
 * @param {integer} bestScore : la meilleure réponse
 * @returns {array} : les alternatives ayant un score supérieur à 80% du meilleur score classées par score décroissant
 */
 const getAlternatives = function(featArray, bestFeature) {
  var alternatives = [];
  for(let i in featArray) {
    if(!featArray[i]._type && featArray[i].coordinates != bestFeature.coordinates) {
      featArray[i] = formatAddress(featArray[i]);
    }
    if(featArray[i]._score > 0.8 * bestFeature._score && featArray[i].coordinates != bestFeature.coordinates) {
      alternatives.push(featArray[i]);
    }
    alternatives.sort(function(a, b) {
      return b._score-a._score
    });
  }
  return alternatives;
};

/**
 * Actions à effectuer à la fin d'un géocodage
 */
 const endGeocodAction = function() {
  if(!geocodage.altitude){
    geocodage.currentPack++;
    addFeat();
  }
  dialog.set("max", false);
  dialog.show({content: getReportHtml(), className: "rapport", progress: 0,
              buttons: {cancel: 'Fermer'},
                          onButton: (click) => {
                            if(click == "cancel") {
                              dialog.close();
                            }
                          }
  });

  var scoreCount = getScoreCount();
  const ctx = document.getElementById('my_chart');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Très bon', 'Bon', 'Moyen', 'Pas géolocalisée'],
        datasets: [{
            label: 'Score du géocodage',
            data: [ scoreCount.veryGood, scoreCount.good, scoreCount.medium, scoreCount.noGeoc ],
            backgroundColor: [ colors.veryGood, colors.good, colors.medium, colors.noGeoc ],
            borderColor: [ colors.veryGood, colors.good, colors.medium, colors.noGeoc ],
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

  setTimeout(() => carte.getMap().updateSize(), 300);
  var header = ["Score", "Qualité", "Adresse géocodée"];
  if(geocodage.altitude) {
      header.push("Altitude");
  }
  for(let i in parseResults.header) {
      header.push(parseResults.header[i]);
  }
  header.push("Code INSEE");
  header.push("Longitude");
  header.push("Latitude");

  setListHeader(header);
  for(let i in listHeader) { //eslint-disable-line no-unused-vars
    listHeaderShow.push(true);
  }
  createList(); 
  updatePanelView("unselect");
};

export {geocodage, stopGeocode, setStopGeocode, clearGeocodage, geocode, getBestScoreIndex, getAlternatives, endGeocodAction};