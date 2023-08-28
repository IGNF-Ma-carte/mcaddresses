import { parseResults } from "../import/selectFile";
import formatAddress  from "./formatAddress";

/**
 * Pondère le score d'une réponse de l'API de géocodage en fonction de certains critères
 * @param {*} feat : la feature renvoyée par l'API de géocodage
 * @param {*} data : les données relatives à l'adresse dans le fichier importé
 * @returns 
 */
const calcIndice = function(feat, data) {
    var properties = formatAddress(feat);
    var input;
  
    if (parseResults.columnCorrespondance["[Adresse complète]"]) {
      input = data[parseResults.columnCorrespondance["[Adresse complète]"] - 1];
    }
    else {
      input = data[parseResults.columnCorrespondance["[Code postal]"] - 1];
    }
  
    var depAndPostalCode = getDepAndPostalCode(input);
    var dep = depAndPostalCode[0];
    var cpost = depAndPostalCode[1];
  
    var score = properties._score;
  
    var correctDep = true;
    if (dep && properties.department) {
      if (dep == "20" && properties.department != "2A" && properties.department != "2B" && properties.department !="20") {
        score *= 0.4;
        correctDep = false;
      }
      else if (dep != "20" && properties.department != dep) {
        if (properties.department.length == 2 && dep.length == 3 && properties.department[0] == dep[0] && properties.department[1] == dep[1]) {
          score *= 1;
        }
        else {
          score *= 0.4;
          correctDep = false;
        }
      }
    }
    
    if (correctDep && cpost != properties.postalCode) {
      score *= 0.8;
    }
    return score;
  };
  
  /**
   * Récupère le département et le code postal d'une adresse
   * @param {string} input : l'adresse
   * @returns {array} : tableau contenant le département et le code postal
   */
  const getDepAndPostalCode = function (input) {
    if (!input) {
      return [false, false];
    }

    var dep, cpost;
    
    if(input.match(/[0-9]{5}/g)) {
        dep = cpost = input.match(/[0-9]{5}/g)[0];
    }
    else if(input.match(/[0-9]{4}/g)){
        dep = cpost = input.match(/[0-9]{4}/g)[0];
    }
    else {
        return [false, false];
    }
  
    if (dep.length == 4) {
        dep = cpost = "0" + dep;
    }
  
    if (/^9[7|8]/.test(dep)) {
        dep = dep.substring(0,3);
    }
    else {
        dep = dep.substring(0,2);
    }
  
    return [dep, cpost];
  };

  export { calcIndice };