/**
 * Récupère et formate les informations d'une adresse renvoyée par l'API de géocodage
 * @param {objet} apiFeature : la feature renvoyée par l'API
 * @returns 
 */
function formatAddress(apiFeature) {
var result;
if(!apiFeature) {
    result = {"_score" : 0, "_type" : "none"};
    return result;
}

var prop = apiFeature.properties;

result = {"_score" : prop.score,
             "quality" : getAddressQuality(prop),
             "coordinates" : [apiFeature.geometry.coordinates[0], apiFeature.geometry.coordinates[1]],
             "alternatives": prop.alternatives
         };

if(prop._type == "ban" || prop._type == "address")
{
    result._type = "address";
    result.inseeCode = prop.citycode;
    result.department = getDepartment(prop.postcode);
    result.postalCode = prop.postcode;
    result.city = prop.city;
    if(prop.type == "street" || prop.type == "locality") {
      result.street = prop.name;
    }
    else {
      result.street = prop.street;
    }
    result.number = prop.housenumber;
    return result;
}

if(prop._type == "poi")
{
    result._type = prop._type;

    if(prop.citycode) {
      result.inseeCode = prop.citycode[0];
      result.department = prop.citycode[1];
    } else {
      result.inseeCode = "undefined";
      result.department = "undefined";
    }
    
    if(prop.postcode) {
      result.postalCode = prop.postcode[0];
    } else {
      result.postalCode = "undefined";
    }

    result.city = prop.toponym;
    if(prop.city) {
      result.city += " " + prop.city?prop.city[0]:"";
    }
    return result;
}

if(prop._type == "cadastral" || "parcel")
{
    result._type = "cadastral";
    result._score = 1;
    result.id = prop.id;
    result.department = prop.departmentcode;
    result.city = prop.city;
    result.inseeCode = prop.departmentcode + prop.municipalitycode;
    result.trueGeometry = prop.truegeometry;
    return result;
}
};

const getAddressQuality = function(properties) {
    var quality = "Parcelle";
    if(properties._type == "poi") {
        quality = "Point d'intérêt";
        for(let i in properties.category) {
            if(properties.category[i] == "région") {
          quality = "Région";
            }
            if(properties.category[i] == "département") {
          quality = "Département";
            }
            if(properties.category[i][i] == "commune") {
          quality = "Ville";
            }
        }
    }
    else if(properties._type == "ban" || properties._type == "address") {
      if(properties.type == "housenumber") {
        quality = "Numéro";
      }
      else if (properties.type == "street") {
        quality = "Rue";
      }
      else if(properties.type == "locality") {
        quality = "Point d'intérêt";
      }
      else if(properties.postcode) {
        quality = "Code postal";
      }
      else {
        quality = "Ville";
      }
    }
    return quality;
  };

  const getDepartment = function (postalCode) {
    if(!postalCode) return;
    var dep;
    //outre-mer
    if (/^9[7|8]/.test(postalCode)) 
    {
        dep = postalCode.substr(0,3);
    }
    else 
    {
        dep = postalCode.substr(0,2);
    }
    return dep;

  };

export default formatAddress;

