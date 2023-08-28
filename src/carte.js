import Carte from 'mcutils/Carte';
import VectorSource from 'ol/source/Vector';
import VectorStyle from 'mcutils/layer/VectorStyle';
import colors from './colors';

/**
 * Renvoie le layer des features
 * @returns {object} le layer
 */
export const getFeatureLayer = function() {
  var layers = carte.getMap().getLayers().getArray();

  var l;
  for (var i in layers) {
    if (layers[i].get("name") == "Features") {
      l = layers[i];
      break;
    }
  }
  return l
};

/**
 * Renvoie le layer des features temporaires
 * @returns {object} le layer
 */
export const getTempFeatureLayer = function() {
  var layers = carte.getMap().getLayers().getArray();

  var l;
  for (var i in layers) {
    if (layers[i].get("name") == "Features temporaires") {
      l = layers[i];
      break;
    }
  }
  return l
}; 

const carte = new Carte({
  url: './carte.carte',
  target: document.querySelector('[data-role="map"]'),
});

carte.on('read', (e) => {
  var featLayer = new VectorStyle({
    type: 'Vector',
    source: new VectorSource(), 
    title: "Geocodage",
    name: "Features", 
    displayInLayerSwitcher: false
  });
  featLayer.setMode("cluster");
  
  var layerStyle = {
    pointForm: 'marker',
    symbolColor: 'transparent',
    pointStrokeColor: '#fff',
    pointColor: colors.veryGood,
    pointGlyph: 'maki-circle'
  };
  
  featLayer.setIgnStyle(layerStyle);
  
  var tempFeatLayer = new VectorStyle({
    source: new VectorSource(), 
    name: "Features temporaires", 
    displayInLayerSwitcher: false
  });
  tempFeatLayer.setIgnStyle(layerStyle);
  
  carte.getMap().addLayer(featLayer);
  carte.getMap().addLayer(tempFeatLayer);
  
  carte.setSelectStyle({type: "default"});

  carte.getControl("searchBar").setMap(carte.getMap());
})

export default carte;
