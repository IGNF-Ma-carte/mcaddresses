import { geocodage } from "./geocode";
import { parseResults } from "../import/selectFile";
import { getFeatureLayer } from "../carte";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat} from 'ol/proj';
import colors from "../colors";
import { isParcel } from "../modification_adresse/address_fct";
/**
 * Ajout des features openlayers dans la carte à partir des features renvoyées par l'api de géocodage
 */
 const addFeat = function () {
    getFeatureLayer().activateCluster(false);
    for(var i = (geocodage.currentPack - 1) * geocodage.packLength; i < geocodage.results.apiFeatures.length; i++) {

      var feat = createFeat(geocodage.results.apiFeatures[i], parseResults.data[geocodage.results.olFeatures.length]);

      var alternativeFeatArray = [];
      for(var j in feat._api_properties.alternatives) {
        alternativeFeatArray.push(createFeat(feat._api_properties.alternatives[j], parseResults.data[geocodage.results.olFeatures.length]));
      }
      feat._api_properties.alternatives = alternativeFeatArray;

      geocodage.results.olFeatures.push(feat);

      if(feat.getGeometry()) {
        getFeatureLayer().getSource().addFeature(feat);
      }
    }
    getFeatureLayer().activateCluster(true);
  };
  
  /**
   * Crée une feature openlayers à partir d'une feature renvoyée par l'api de géocodage
   * @param {object} item : feature renvoyée par l'api de géocodage
   * @param {*} data : données parsées associées à la feature
   * @returns {object} feature openlayers
   */
  const createFeat = function(item, data) {
    var feat = new Feature({});
    if(item.coordinates) {
      if(geocodage.type == "parcel" && geocodage.trueGeometry) {
        let fromLonLatCoords = [];
        if(item.trueGeometry.coordinates.length > 1 && typeof(item.trueGeometry.coordinates[0][0][0]) != "number") {
          item.trueGeometry.coordinates = item.trueGeometry.coordinates[0];
        }
        for(let i in item.trueGeometry.coordinates) {
          for(let j in item.trueGeometry.coordinates[i]) {
            fromLonLatCoords.push(fromLonLat(item.trueGeometry.coordinates[i][j]));
          }
        } 
        feat = new Feature({
          geometry: new Polygon([fromLonLatCoords])
        });
      } else {
        feat = new Feature({
          geometry: new Point(fromLonLat(item.coordinates))
        });
      }
    }
    feat._api_properties = {};
    for(let i in item) {
      if(i == "alternatives") {
        feat._api_properties.alternatives = item[i];
      }
      else {
        feat._api_properties[i] = item[i]
      }
    }

    feat._api_properties.geocodedAddress = getAddressLabelFromFeat(feat);
  
    feat._data = {};
  
    var st = Object.assign({}, getFeatureLayer().getIgnStyle());

    if(geocodage.type == "parcel" && geocodage.trueGeometry) {
      st = {};
      //st.strokeColor = colors.veryGood;
      feat.setIgnStyle(st);
    } else {
        if(feat._api_properties._score > 0.8) {
          st.pointColor = colors.veryGood;
          feat.setIgnStyle(st);
        }
        else if(feat._api_properties._score > 0.5) {
          st.pointColor = colors.good;
          feat.setIgnStyle(st);
        }
        else {
          st.pointColor = colors.medium;
          feat.setIgnStyle(st);
        }
      }
  

    
  
    for(let i in parseResults.header) {
      feat._data[parseResults.header[i]] = data[i];
    }
      //retourne la feature avec les attributs qui vont bien pour la création de la liste d'adresses
      return setPropertiesForList(feat);
  };

  /**
   * Formate la feature pour avoir les attributs nécessaires à la création de la liste d'adresses
   * @param {*} feat 
   * @returns 
   */
  const setPropertiesForList = function(feat) {
    let prop = feat._api_properties;

    feat.set("#", geocodage.results.olFeatures.length + 1);

    feat.set("Score", Math.round(prop._score*100)/100);

    feat.set("Qualité", prop.quality||"");

    feat.set("Adresse géocodée", prop.geocodedAddress);

    if(prop.altitude) {
      feat.set("Altitude", prop.altitude);
    }

    for(let i in feat._data) {
        feat.set(i, feat._data[i]);
    }

    feat.set("Code INSEE",prop.inseeCode||"");

    if(prop.coordinates)
    {
        feat.set("Longitude",prop.coordinates[0]);
        feat.set("Latitude",prop.coordinates[1]);
    } else{
        feat.set("Longitude","");
        feat.set("Latitude","");
    }
    return feat;
  }

  /**
 * Renvoie l'adresse associée à une feature
 * @param {object} f : la feature
 * @param {boolean} separated : si "true", l'adresse est décomposé en [numéro + rue] et [code postal + commune]
 * @returns {string or array of string} l'adresse
 */
const getAddressLabelFromFeat = function (f, separated) {
  let prop = f._api_properties
  if (!f.getGeometry()) {
      return "Cette adresse n'a pas pu être géocodée";
  }
  if (!isParcel()) {
      var n = f._api_properties.number ? f._api_properties.number + " " : "";
      var s = f._api_properties.street ? f._api_properties.street + " " : "";
      var p = f._api_properties.postalCode ? f._api_properties.postalCode + " " : "";
      var c = f._api_properties.city ? f._api_properties.city : "";
      var t = f._api_properties.toponyme ? f._api_properties.toponyme : "";
      if (separated) {
          return [n + s, p + c + t];
      }
      return n + s + p + c + t;
  }
  if (separated) {
      return [f._api_properties.id, f._api_properties.city];
  }
  return f._api_properties.id + " " + f._api_properties.city;
};

  export {createFeat, addFeat, getAddressLabelFromFeat, setPropertiesForList};