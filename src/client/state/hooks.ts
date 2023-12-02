import { useMemo } from "react";
import { feature, mesh } from "topojson";
import usGeo from "../data/swiss-maps.json";


export function useSwissAtlas() {
  const stateBorders = useMemo(() => {
    const processedStateBorders = feature(
      usGeo as any,
      usGeo.objects.country as TopoJSON.GeometryCollection,
    );
    //console.log("Processed Features:", processedFeatures);
    return processedStateBorders;
  }, []);

 const cantonBorders = useMemo(() => {
    const processedCantonBorders = mesh(
      usGeo as any,
      usGeo.objects.cantons as TopoJSON.GeometryCollection,
      (a, b) => a !== b,
    );
    //console.log("Processed Canton Borders:", processedCantonBorders);
    return processedCantonBorders;
  }, []);

  const municipalityBorders = useMemo(() => {
    const processedMunicipalityBorders = mesh(
      usGeo as any,
      usGeo.objects.municipalities as TopoJSON.GeometryCollection,
      (a, b) => a !== b,
    );
    //console.log("Processed Municipality Borders:", processedMunicipalityBorders);
    return processedMunicipalityBorders;
  }, []);

  return { stateBorders, cantonBorders, municipalityBorders };
}
