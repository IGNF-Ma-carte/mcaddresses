import { geocodage, stopGeocode, geocode, endGeocodAction } from "./geocode";
import { createAltiRequestListByPack, altiGeocodLink, requestListByPack } from "./requests";
import { toLonLat } from 'ol/proj'
import { setGeocodePatience, updatePatience, geocodePatience } from "./loader";
import dialog from "mcutils/dialog/dialog";
import { listCtrl } from "../liste_adresses/setList";

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
           geocodage.altitudeArray.push(-1)
         }
         else {
           geocodage.altitudeArray.push("undefined");
         }
       }
       Promise.all(r.map(resp => resp.text()))
     .then(function (res) {
       if(!res || !res.length) {
         for(let i = start; i<geocodage.altitudeArray.length; i++) {
           geocodage.results.olFeatures[i].get("properties").altitude = "undefined";
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
       var start = (geocodage.currentPack-1)*geocodage.packLength;
       var jsonRes;
       for (let i in res) {

          jsonRes = JSON.parse(res[i]);
          alti = jsonRes.elevations[0].z;
          if (alti == -99999.0) {
             alti = undefined;
          }
          for(var j in geocodage.altitudeArray) {
            if(geocodage.altitudeArray[j] == -1) {
              geocodage.altitudeArray[j] = alti;
              break;
            }
          }
       }

       for(let i = start; i<geocodage.altitudeArray.length; i++) {
         geocodage.results.olFeatures[i].get("properties").altitude = geocodage.altitudeArray[i];
         geocodage.results.olFeatures[i].set("Altitude", geocodage.altitudeArray[i]);
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
 
   var request = altiGeocodLink + "&lon=" + lonlat[0] + "&lat=" + lonlat[1];
 
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
          var jsonRes = JSON.parse(res[0]);
          alti = jsonRes.elevations[0].z;
         
          if (alti == -99999.0) {
            alti = undefined;
          }
          geocodage.altitudeArray[geocodage.getFeatureIndex(feature)] = alti;
          feature.get("properties").altitude = alti;
          feature.set("Altitude", alti);
          listCtrl.setColumns(listCtrl.getColumns());
          dialog.close();
          if(callback) {
            callback();
          }
      });
    })
  };

  export {altiGeocode, uniqueAltiGeocod};