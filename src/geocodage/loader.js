import { parseResults } from "../import/selectFile";
import { requestListByPack, altiRequestListByPack } from "./requests";
import { geocodage, setStopGeocode } from "./geocode";
import dialog from "mcutils/dialog/dialog";

/**
 * Création de la patience de géocodage
 * @param {string} type : type de patience (géocodage, alticodage, geocodage inversée)
 * @param {booléen} unique : booléen pour savoir si c'est un géocodage unique ou non
 */
const setGeocodePatience = function (type, unique) {
  var cnt = "<label id='progress'>0.00%</label><button id='stop_geoc' class='button button-ghost'>Arrêter la localisation</button>";
  var title = "Localisation en cours...";
  if (type == "altitude") {
    title = "Récupération de l'altitude en cours...";
    geocodage.altiTotalSeconds = 0;
  } else if (type == "reverse") {
    title = "Récupération de l'adresse en cours..."
  }
  var dataLength = parseResults.data.length;

  if (unique) {
    dataLength = 1;
  }

  dialog.show({
    content: cnt,
    title: title,
    closeBox: false,
    className: 'import_patience',
    max: dataLength,
    progress: 0
  });

  document.getElementById("stop_geoc").addEventListener("click", () => {
    setStopGeocode(true);
    document.getElementById("stop_geoc").outerHTML = "<p id='stop_geoc' class='in_progress'>Arrêt en cours...</p>";
  });

  var progressLabel = document.getElementById("progress");
  geocodage.totalSeconds = 0;

  var interval = setInterval(setTime, 1000);

  function setTime() {
    if (progressLabel.innerHTML.includes("100.00")) {
      clearInterval(interval);
    } else {
      if (type == "altitude") {
        geocodage.altiTotalSeconds++
      } else {
        geocodage.totalSeconds++;
      }
    }
  }
};

/**
 * Met à jour le contenu de la patience affichée pendant un géocodage
 * @param {array} proms_batch : les requêtes (Promises) en cours de traitement
 * @param {string} type : type de traitement en cours; "enhancement" pour amélioration du géocodage, "altitude" pour géocodage (facultatif)
 */
 const updatePatience = function(proms_batch, type) {
    let d = 0;
    let percentage;
    document.getElementById(type + "_progress").classList.toggle("hidden");
    for(const p of proms_batch) {
      p.then(() => {
        d++;
        percentage = ((d * 100) / proms_batch.length).toFixed(2) + "%";
  
        if(type == "enhancement") {
          document.getElementById("enhancement_span").innerHTML = percentage;
        }
        else if(type == "altitude") {
          if(!document.getElementById("enhancement_progress").classList.contains("hidden")) {
            document.getElementById("enhancement_progress").classList.toggle("hidden");
          }
          if(document.getElementById("altitude_progress").classList.contains("hidden")){
            document.getElementById("altitude_progress").classList.toggle("hidden");
          }
          document.getElementById("altitude_span").innerHTML = percentage;
        }
      });
    }
  };
  
  /**
   * Gestion de la patience affichée pour chaque paquet de requête lors d'un géocodage
   * @param {array} proms_batch : les requêtes (Promises) en cours de traitement
   * @param {string} type : default, altitude, reverse
   * @param {boolean} unique : si "true", géocodage unique en cours
   */
  const geocodePatience = function(proms_batch, type, unique) {
    let d;
    var requests = [0];
    if(!unique) {
      requests = requestListByPack;
    }
    var secondsIndex = "totalSeconds";
    var currentPack = geocodage.currentPack;
    var dataLength = parseResults.data.length;
    if(type == "altitude") {
      requests = altiRequestListByPack;
      secondsIndex = "altiTotalSeconds";
      currentPack = geocodage.altiCurrentPack;
    } 
    
    let l;
    if(unique) {
      l = 1;
    }
    else {
      l = ((requests.length - 1) * geocodage.packLength) + (requests[requests.length - 1].length);
    }
    
    if(unique) {
      l = 1;
      currentPack = 0;
      dataLength = 1;
    }
  
      d = currentPack * geocodage.packLength;
      for (const p of proms_batch) {
        p.then(() => {
          d++;
          var per = (d * 100) / l;
          var secondsToGo = ((geocodage[secondsIndex]*100)/per) - geocodage[secondsIndex];
          if((type == "default" || !type) && currentPack < 6 && requests.length > 5) {
            secondsToGo = secondsToGo + ((requests.length)*(6-currentPack));
            if(geocodage.altitude && currentPack == 0) {
              secondsToGo = secondsToGo + secondsToGo*0.33;
            }
          }
  
          var min = parseInt(secondsToGo/60);
          var sec = secondsToGo%60;
  
          sec = sec.toFixed(0);
          if(sec.length < 2) {
            sec = "0" + sec;
          }
  
          var message = "<i class='fi-location'> " + d + " adresses traitées sur " + dataLength + "</i> - ";
          message += "<i class='fi-clock'> Temps restant : <label id='minutes'>" + min + " </label> mn<label id='seconds'> " + sec + " s</label></i></br>";
          message += "<label id='enhancement_progress' class='hidden'>Amélioration du géocodage: <span id='enhancement_span'>0.00%</span> </label>";
          message += "<label id='altitude_progress' class='hidden'>Récupération de l'altitude: <span id='altitude_span'>0.00%</span> </label>";
          dialog.setProgress(d, dataLength, message);
          document.getElementById("progress").innerHTML =  ((d * 100) / l).toFixed(2) + "%";
        });
      }
  };

  export {setGeocodePatience, updatePatience, geocodePatience};