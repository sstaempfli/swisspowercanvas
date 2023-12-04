import * as d3 from 'd3';
import { useMemo } from 'react';
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

const SwissMap: React.FC<SwissMapProps> = ({
  state,
  cantons,
  municipalities,
  width = defaultChartProps.width, 
  height = defaultChartProps.height, 
}) => {


  const svg = d3.select('#SwissMap')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const projection = d3.geoMercator()
    .fitSize([width, height], cantons);

  const path = d3.geoPath().projection(projection);
 
  svg.selectAll('.feature1')
    .data(cantons.features)
    .enter()
    .append('path')
    .attr('class', 'state')
    .attr('d', path)
    .style("fill", function(d) {return (d.properties as cantonPropertiesType).fill;});

  return (
    <svg id="SwissMap" width={width} height={height}>
      
    </svg>
  );
};

export default SwissMap;