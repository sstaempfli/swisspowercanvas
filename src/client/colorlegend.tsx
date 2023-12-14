import { scaleSequential, interpolateViridis } from "d3";
import {useEffect } from "react";

interface ColorLegendProps {
  min: number;
  max: number;
}

const formatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0, 
});


const ColorLegend: React.FC<ColorLegendProps> = ({ min, max }) => {
  const colorScale = scaleSequential(interpolateViridis).domain([0, 1]);
  const minText =isFinite(max) ? formatter.format(min) + " kW" : "N/A"; //displays N/A on scale if no energy of that type produced in CH
  const maxText =isFinite(max) ? (formatter.format(max) + " kW") : "N/A";


  //see when max changes
  useEffect(() => {
    console.log(`Max value changed: ${max}`);
  }, [max]);


  return (
    <svg width="300" height="80">
      <text x="0" y="40">
        {minText}
      </text>
      <text x="300" y="40" textAnchor="end">
        {maxText}
      </text>
      {[...Array(300).keys()].map((value) => (
        <rect
          key={value}
          x={value * 3}
          height="20"
          width="4"
          fill={colorScale(value / 100)}
        />
      ))}
    </svg>
  );
};

export default ColorLegend;
