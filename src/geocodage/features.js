import { geocodage } from "./geocode";
import { parseResults } from "../import/selectFile";
import { getFeatureLayer } from "../carte";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
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
      for(var j in feat.get("alternatives")) {
        alternativeFeatArray.push(createFeat(feat.get("alternatives")[j], parseResults.data[geocodage.results.olFeatures.length]));
      }
      feat.set("alternatives", alternativeFeatArray);
      feat.set("originalIndex", geocodage.results.olFeatures.length);
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
    var feat = new Feature({});if(item.coordinates) {
      feat = new Feature({
        geometry: new Point(fromLonLat(item.coordinates))
      });
    }
    feat.set("properties", {});
  
    for(let i in item) {
      if(i == "alternatives") {
        feat.set("alternatives", item[i]);
      }
      else {
        feat.get("properties")[i] = item[i];
      }
    }

    feat.get("properties").geocodedAddress = getAddressLabelFromFeat(feat);
  
    feat.set("data", {});
  
    var st = Object.assign({}, getFeatureLayer().getIgnStyle());
  
    if(feat.get("properties")._score > 0.8) {
      st.pointColor = colors.veryGood;
      feat.setIgnStyle(st);
    }
    else if(feat.get("properties")._score > 0.5) {
      st.pointColor = colors.good;
      feat.setIgnStyle(st);
    }
    else {
      st.pointColor = colors.medium;
      feat.setIgnStyle(st);
    }
  
    for(let i in parseResults.header) {
      feat.get("data")[parseResults.header[i]] = data[i];
    }
      return feat;
  };

  /**
 * Renvoie l'adresse associée à une feature
 * @param {object} f : la feature
 * @param {boolean} separated : si "true", l'adresse est décomposé en [numéro + rue] et [code postal + commune]
 * @returns {string or array of string} l'adresse
 */
const getAddressLabelFromFeat = function (f, separated) {
  if (!f.getGeometry()) {
      return "Cette adresse n'a pas pu être géocodée";
  }
  if (!isParcel()) {
      var n = f.get("properties").number ? f.get("properties").number + " " : "";
      var s = f.get("properties").street ? f.get("properties").street + " " : "";
      var p = f.get("properties").postalCode ? f.get("properties").postalCode + " " : "";
      var c = f.get("properties").city ? f.get("properties").city : "";
      var t = f.get("properties").toponyme ? f.get("properties").toponyme : "";
      if (separated) {
          return [n + s, p + c + t];
      }
      return n + s + p + c + t;
  }
  if (separated) {
      return [f.get("properties").id, f.get("properties").city];
  }
  return f.get("properties").id + " " + f.get("properties").city;
};

  export {createFeat, addFeat, getAddressLabelFromFeat};