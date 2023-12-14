import { feature } from "topojson";
import swissGeo from "../data/swiss-maps.json";


export function useSwissAtlas() {
  const state = feature(
      swissGeo as any,
      swissGeo.objects.country as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Features:", processedFeatures);


 const cantons = feature(
      swissGeo as any,
      swissGeo.objects.cantons as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Canton Borders:", processedCantonBorders);


  const municipalities = feature(
      swissGeo as any,
      swissGeo.objects.municipalities as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Municipality Borders:", processedMunicipalityBorders);


  return { state, cantons, municipalities }
}
