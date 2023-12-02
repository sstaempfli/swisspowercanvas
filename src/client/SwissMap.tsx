import * as d3 from 'd3';
import { useMemo } from 'react';
import { ChartProps, defaultChartProps } from './types/chart';

interface SwissMapProps extends Partial<ChartProps> {
  state: GeoJSON.FeatureCollection;
  cantons: GeoJSON.MultiLineString;
  municipalities: GeoJSON.MultiLineString;
}

const SwissMap: React.FC<SwissMapProps> = ({
  state,
  cantons,
  municipalities,
  width = defaultChartProps.width, 
  height = defaultChartProps.height, 
}) => {

  const projection = d3.geoMercator()
    .fitSize([width, height], state);


  const path = d3.geoPath().projection(projection);

  const statePath = useMemo(() => state && path(state), [state, path]);
  const cantonPath = useMemo(() => cantons && path(cantons), [cantons, path]);
  const municipalityPath = useMemo(() => municipalities && path(municipalities), [municipalities, path]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <g>
        {statePath && <path d={statePath} fill="#ccc" stroke="none" />}
        {municipalityPath && <path d={municipalityPath} fill="none" stroke="#999" strokeWidth="1"/>}
        {cantonPath && <path d={cantonPath} fill="none" stroke="black" strokeWidth="1.5"/>}
      </g>
    </svg>
  );
};

export default SwissMap;