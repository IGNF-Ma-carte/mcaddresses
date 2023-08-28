import { parseResults } from "../import/selectFile";
import { geocodage, stopGeocode } from "./geocode";

/**
 * Compte le nombre d'adresses géocodées en fonction de leur score
 * @returns {object}
 */
 const getScoreCount = function() {
    var scoreCount = {"veryGood": 0, "good": 0, "medium": 0, "noGeoc": 0, "ignore": 0};
  
    for(var i in geocodage.results.apiFeatures) {
      if(geocodage.results.apiFeatures[i]) {
        if(geocodage.results.apiFeatures[i]._score > 0.8) {
          scoreCount.veryGood++;
        }
        else if(geocodage.results.apiFeatures[i]._score > 0.5) {
          scoreCount.good++;
        }
        else if(geocodage.results.apiFeatures[i]._score > 0) {
          scoreCount.medium++;
        }
      }
    }
  
    scoreCount.noGeoc = geocodage.results.apiFeatures.length - scoreCount.veryGood - scoreCount.good - scoreCount.medium;
    scoreCount.ignore = parseResults.data.length - geocodage.results.apiFeatures.length;
  
    return scoreCount;
  };
  
  /**
   * Crée le html pour le rapport de géocodage
   * @returns {string} le html
   */
  const getReportHtml = function() {
    var html = "<h3 id='nb_points'> Résultat du géocodage</h3>";
    html += "<div class='chart_container'><canvas id='my_chart' width='350' height='350'></canvas></div>"
  
    html += "<div class='chart_text'><h2>Sur " + parseResults.data.length + " adresses </h2>";
    var scoreCount = getScoreCount();
  
    if(scoreCount.veryGood < 2) {
      html+= "<p><i class='fi-location very_good_points'></i><span>" + scoreCount.veryGood + " adresse</span> est géocodée avec un très bon score</p>";
    }
    else {
      html+= "<p><i class='fi-location very_good_points'></i><span>" + scoreCount.veryGood + " adresses</span> sont géocodées avec un très bon score</p>";
    }
    if(scoreCount.good < 2) {
      html+= "<p><i class='fi-location good_points'></i><span>" + scoreCount.good + " adresse</span> est géocodée avec un bon score</p>";
    }
    else {
      html+= "<p><i class='fi-location good_points'></i><span>" + scoreCount.good + " adresses</span> sont géocodées avec un bon score</p>";
    }
    if(scoreCount.medium < 2) {
      html+= "<p><i class='fi-location medium_points'></i><span>" + scoreCount.medium + " adresse</span> est géocodée avec un score moyen</p>";
    }
    else {
      html+= "<p><i class='fi-location medium_points'></i><span>" + scoreCount.medium + " adresses</span> sont géocodées avec un score moyen</p>";
    }
    if(scoreCount.noGeoc < 2) {
      html+= "<p><i class='fi-location no_point'></i><span>" + scoreCount.noGeoc + " adresse</span> n'a pas pu être géocodée</p>";
    }
    else {
      html+= "<p><i class='fi-location no_point'></i><span>" + scoreCount.noGeoc + " adresses</span> n'ont pas pu être géocodées</p>";
    }
  
    if(stopGeocode) {
      if(scoreCount.nbIgnore < 2) {
        html += "<p class='ignore'><span>" + scoreCount.ignore + " adresses</span> n'a pas été traitée<p/>"  
      }
      else {
        html += "<p class='ignore'><span>   " + scoreCount.ignore + " adresses</span> n'ont pas été traitées<p/>"
      }
    }
  
    html += "</div>";
    return html;
  };

  export {getScoreCount, getReportHtml};