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

  const svg = d3.select('#SwissMap')
    .attr('width', width)
    .attr('height', height);

  const projection = d3.geoMercator()
    .fitSize([width, height], cantons);

  const path = d3.geoPath().projection(projection);

  // Append state data
  svg.select("#state")
    .selectAll("path")
    .data(state.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .style("fill", "##808080");
  
    // Append cantons data
  svg.select("#cantons")
    .selectAll("path")
    .data(cantons.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", function(c) {return (c.properties as cantonPropertiesType).fill;});

    // Append municipalities data
  svg.select("#municipalities")
    .selectAll("path")
    .data(municipalities.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", function(c) {return (c.properties as municipalitiesPropertiesType).fill;});

  return (
    <svg id="SwissMap" width={width} height={height}>
      <g id="state"></g>
      <g id="cantons"></g>
      <g id="municipalities"></g>
    </svg>
  );
};

export default SwissMap;