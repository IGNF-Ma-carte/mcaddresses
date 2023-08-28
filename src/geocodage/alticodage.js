import { geocodage, stopGeocode, geocode, endGeocodAction } from "./geocode";
import { createAltiRequestListByPack, altiGeocodLink, requestListByPack } from "./requests";
import { updateListAddress } from "../liste_adresses/listUpdate";
import { toLonLat } from 'ol/proj'
import { setGeocodePatience, updatePatience, geocodePatience } from "./loader";
import dialog from "mcutils/dialog/dialog";

/**
 * Alticodage d'un paquet d'adresses
 * @returns 
 */
const altiGeocode = function() 
 {
   if(!geocodage.altitudeArray) {
     geocodage.altitudeArray = [];
   }
   var altiRequestListByPack = createAltiRequestListByPack();
   var proms_batch = altiRequestListByPack[0].map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
   var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});

   updatePatience(timeout_proms_batch, "altitude");

   return Promise.all(timeout_proms_batch)
     .then(response => {
       var r = [];
       for(let i in response) {
         if(response[i].ok){
           r.push(response[i]);
         }
         else {
           if(!geocodage.altiError) {
             geocodage.altiError = [];
           }
           geocodage.altiError.push({promise: response[i], index: geocodage.results.apiFeatures.length + Number(i)});
         }
       }
       Promise.all(r.map(resp => resp.text()))
     .then(function (res) {
       if(!res || !res.length) {
         updateAltiArrayWithErrors();
         for(let i = start; i<geocodage.altitudeArray.length; i++) {
           geocodage.results.olFeatures[i].get("properties").altitude = geocodage.altitudeArray[i];
         }
         geocodage.altiCurrentPack++;
         if (geocodage.currentPack < requestListByPack.length && !stopGeocode) {
           geocode();
         }
         else {
           endGeocodAction();
         }
           return;
       }
       var alti = undefined;
       var start = geocodage.altitudeArray.length;
       for (let i in res) {
         if(res[i].match(/z>.*<\/z>/)) {
           alti = Number(res[i].match(/z>.*<\/z>/)[0].replace("z>","").replace("</z>", ""));
         }
         if (alti == -99999.0) {
           alti = undefined;
         }
         geocodage.altitudeArray.push(alti);
       }
       updateAltiArrayWithErrors();
       for(let i = start; i<geocodage.altitudeArray.length; i++) {
         geocodage.results.olFeatures[i].get("properties").altitude = geocodage.altitudeArray[i];
       }
       geocodage.altiCurrentPack++;
       if (geocodage.currentPack < requestListByPack.length && !stopGeocode) {
         geocode();
       }
       else {
         endGeocodAction();
       }
     })
   });
 };
 
 /**
  * alticodage d'une adresse
  * @param {object} feature : la feature openlayers associée à l'adresse que l'on veut alticoder 
  * @param {function} callback
  */
 const uniqueAltiGeocod = function(feature, callback) {
   var lonlat = [0,0];
 
   if(feature.getGeometry()) {
     var coord = feature.getGeometry().getCoordinates();
     lonlat = toLonLat(coord); 
   }
 
   var request = altiGeocodLink + "&lon=" + lonlat[0] + "&lat=" + lonlat[1] + "&indent=false&crs='CRS:84'&zonly=false";
 
   var proms_batch = [request].map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
   var timeout_proms_batch = proms_batch.map(p => {return Promise.race([p, Promise.delay({ok: false})])});
   
   setGeocodePatience("altitude", true)
   geocodePatience(timeout_proms_batch, "altitude", true);
 
   return Promise.all(timeout_proms_batch)
     .then(response => {
       var r = [];
       for(let i in response) {
         if(response[i].ok){
           r.push(response[i]);
         }
       }
       Promise.all(r.map(resp => resp.text()))
       .then(function (res) {
         var alti = undefined;
         if(res.length && res[0].match(/z>.*<\/z>/)) {
           alti = Number(res[0].match(/z>.*<\/z>/)[0].replace("z>","").replace("</z>", ""));
         }
         if (alti == -99999.0) {
           alti = undefined;
         }
         geocodage.altitudeArray[geocodage.getFeatureIndex(feature)] = alti;
         feature.get("properties").altitude = alti;
         updateListAddress("modify");
         dialog.close();
         if(callback) {
           callback();
         }
     });
   })
 };

 /**
 * Met à jour la variable "geocodage.altitudeArray" pour prendre en compte les requêtes ayant renvoyé une erreur
 */
  const updateAltiArrayWithErrors = function() {
    for(var i in  geocodage.altiError) {
      var ind =  geocodage.altiError[i].index;
      var borne = (geocodage.packLength * (geocodage.currentPack))-1;
      if(ind > borne) {
        geocodage.altitudeArray.splice(ind,0,undefined);
      }
    }
  };

  export {altiGeocode, uniqueAltiGeocod};