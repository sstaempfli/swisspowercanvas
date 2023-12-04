import { feature } from "topojson";
import usGeo from "../data/swiss-maps.json";


export function useSwissAtlas() {
  const state = feature(
      usGeo as any,
      usGeo.objects.country as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Features:", processedFeatures);


 const cantons = feature(
      usGeo as any,
      usGeo.objects.cantons as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Canton Borders:", processedCantonBorders);


  const municipalities = feature(
      usGeo as any,
      usGeo.objects.municipalities as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Municipality Borders:", processedMunicipalityBorders);


  return { state, cantons, municipalities }
}
