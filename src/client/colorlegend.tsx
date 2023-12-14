import { scaleSequential, interpolateViridis } from "d3";

interface ColorLegendProps {
  min: number;
  max: number;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ min, max }) => {
  const colorScale = scaleSequential(interpolateViridis).domain([0, 1]);

  return (
    <svg width="300" height="80">
      <text x="0" y="40">
        {min}
      </text>
      <text x="300" y="40" textAnchor="end">
        {max}
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
