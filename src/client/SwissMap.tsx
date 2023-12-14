import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartProps, defaultChartProps } from './types/chart';

interface SwissMapProps extends Partial<ChartProps> {
  state: GeoJSON.FeatureCollection;
  cantons?: GeoJSON.FeatureCollection; // Optional
  municipalities?: GeoJSON.FeatureCollection; // Optional
  currentView: "canton" | "municipality";
}

type cantonPropertiesType = { 
  id: number
  name : string
  fill : string
  stroke: string
}

type municipalitiesPropertiesType = {
  id: number
  name: string
  ktnr: number
  fill: string
}

const SwissMap: React.FC<SwissMapProps> = ({
  state,
  cantons,
  municipalities,
  currentView,
  width = defaultChartProps.width,
  height = defaultChartProps.height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = d3.geoMercator().fitSize([width, height], state);
    const path = d3.geoPath().projection(projection);

    svg.select("#state")
      .selectAll("path")
      .data(state.features)
      .join('path')
      .attr('class', 'state')
      .attr('d', path)
      .style("fill", "#808080");

    // Depending on the current view, clear and render the appropriate paths
    if (currentView === "canton" && cantons) {
      svg.select("#municipalities").selectAll("path").remove(); // Clear municipalities
      svg.select("#cantons")
        .selectAll("path")
        .data(cantons.features)
        .join("path")
        .attr("d", path)
        .attr("fill", c => (c.properties as cantonPropertiesType).fill);
    } else if (currentView === "municipality" && municipalities) {
      svg.select("#cantons").selectAll("path").remove(); // Clear cantons
      svg.select("#municipalities")
      .selectAll("path")
      .data(municipalities.features)
      .join("path")
      .attr("d", path)
      .attr("fill", c => (c.properties as municipalitiesPropertiesType).fill);    
    }
  }, [state, cantons, municipalities, currentView, width, height]);

  return (
    <svg ref={svgRef} id="SwissMap" width={width} height={height}>
      <g id="state"></g>
      <g id="cantons"></g>
      <g id="municipalities"></g>
    </svg>
  );
};

export default SwissMap;
