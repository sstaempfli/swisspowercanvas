import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartProps, defaultChartProps } from './types/chart';

interface SwissMapProps extends Partial<ChartProps> {
  state: GeoJSON.FeatureCollection;
  cantons: GeoJSON.FeatureCollection;
  municipalities: GeoJSON.FeatureCollection;
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
                                             width = defaultChartProps.width,
                                             height = defaultChartProps.height,
                                           }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = d3.geoMercator().fitSize([width, height], cantons);
    const path = d3.geoPath().projection(projection);

    svg.select("#state")
        .selectAll("path")
        .data(state.features)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .style("fill", "##808080");

    svg.select("#cantons")
        .selectAll("path")
        .data(cantons.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(c) {return (c.properties as cantonPropertiesType).fill;});

    svg.select("#municipalities")
        .selectAll("path")
        .data(municipalities.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(c) {return (c.properties as municipalitiesPropertiesType).fill;});
  }, [state, cantons, municipalities]);

  return (
      <svg ref={svgRef} id="SwissMap" width={width} height={height}>
        <g id="state"></g>
        <g id="cantons"></g>
        <g id="municipalities"></g>
      </svg>
  );
};

export default SwissMap;
