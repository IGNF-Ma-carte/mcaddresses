import { getReverseRequest } from "./requests";
import { setGeocodePatience, geocodePatience } from "./loader";
import formatAddress from "./formatAddress";

var timer;

/**
 * Géocodage inverse unique
 * @param {object} feature: la feature sur laquelle porte le géocodage inverse 
 * @param {function} callback 
 */
const uniqueReverseGeocode = function(feature, callback) {
    var rqst = getReverseRequest(feature);
  
    var proms_batch = [rqst].map(url => fetch(url, { method: 'GET', mode: 'cors', cache: 'default' }));
  
    setGeocodePatience("reverse", true)
    geocodePatience(proms_batch, "reverse", true);
  
    fetchWithTimeout(rqst, {timeout: 15000, error: callback}).then(function(resp) {
      if(!resp.ok) {
        return
      }
      else {
        return resp.json();  
      }
    })
    .then(function(res) {
      if(res && res.features && res.features.length) {
        callback(formatAddress(res.features[0]));
      }
      else {
        callback();
      }
    })
  };

  /**
 * Requête fetch avec un timeout
 * @param {string} url: url de la requête
 * @param {object} options: options.timeout => le temps en millisecondes avant timeout (2500 par défaut)
 *                          options.error => callback en cas de timeout
 * @returns 
 */
 const fetchWithTimeout = (url, options = {}) => {
    const { timeout = 2500, ...fetchOptions } = options;
    const error = options.error;
    return Promise.race([
      fetch(url, fetchOptions),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          reject(
            error(),
          )
        }, timeout)
      }),
    ])
  };

  export {uniqueReverseGeocode, timer};