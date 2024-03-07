import { geocodage } from "../geocodage/geocode";
import { getAddressLabelFromFeat } from "../geocodage/features";
import carte from "../carte";
import FeatureList from "ol-ext/control/FeatureList"

let setList = function(){
    setFeaturesProperties();
    let listCtrl = new FeatureList({
        title: 'Liste de géocodage',
        collapsed: false,
        features: geocodage.results.olFeatures,
      });
      carte.getMap().addControl (listCtrl);
      console.log(geocodage.results.olFeatures);
      listCtrl.setColumns(getColumns());

};

let getColumns = function() {
    let columns = ["#", "Score", "Qualité", "Adresse géocodée"];
    if(geocodage.altitude) {
        columns.push("Altitude");
    }

    for(let i in geocodage.results.olFeatures[0].get("data")) {
        columns.push(i);
    }

    columns.push("Code INSEE");
    columns.push("Longitude");
    columns.push("Latitude");
    return columns;
};

let setFeaturesProperties = function() {
    let features = geocodage.results.olFeatures;
    let columns = [];

    for(let i in features){
        let prop = features[i].get("properties");

        features[i].set("#", Number(i)+1);

        features[i].set("Score", Math.round(prop._score*100)/100);

        features[i].set("Qualité", prop.quality||"");

        features[i].set("Adresse géocodée", getAddressLabelFromFeat(features[i]));

        if(geocodage.altitude) {
            features[i].set("Altitude", prop.altitude);
        }

        for(let j in features[i].get("data")) {
            features[i].set(j, features[i].get("data")[j]);
        }

        features[i].set("Code INSEE",prop.inseeCode||"");

        if(prop.coordinates)
        {
            features[i].set("Longitude",prop.coordinates[0]);
            features[i].set("Latitude",prop.coordinates[1]);
        } else{
            features[i].set("Longitude","");
            features[i].set("Latitude","");
        }
        columns.push("Longitude");
        columns.push("Latitude");

    }
};

export {setList};