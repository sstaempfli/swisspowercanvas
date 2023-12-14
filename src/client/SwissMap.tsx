import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ChartProps, defaultChartProps } from "./types/chart";
import Tooltip from "./tooltip";

interface SwissMapProps extends Partial<ChartProps> {
  state: GeoJSON.FeatureCollection;
  cantons?: GeoJSON.FeatureCollection; // Optional
  municipalities?: GeoJSON.FeatureCollection; // Optional
  currentView: "canton" | "municipality";
  colors: Record<string, string>;
  energyData: Record<string, string>;
}

type cantonPropertiesType = {
  id: number;
  name: string;
  fill: string;
  stroke: string;
};

type municipalitiesPropertiesType = {
  id: number;
  name: string;
  ktnr: number;
  fill: string;
};

const SwissMap: React.FC<SwissMapProps> = ({
  state,
  cantons,
  municipalities,
  colors,
  currentView,
  energyData,
  width = defaultChartProps.width,
  height = defaultChartProps.height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    name: string | null;
    power: string | null;
    x: number;
    y: number;
  }>({ name: null, power: null, x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const projection = d3.geoMercator().fitSize([width, height], state);
    const path = d3.geoPath().projection(projection);

    svg
      .select("#state")
      .selectAll("path")
      .data(state.features)
      .join("path")
      .attr("class", "state")
      .attr("d", path)
      .style("fill", "#808080");

    // Depending on the current view, clear and render the appropriate paths
    if (currentView === "canton" && cantons) {
      svg.select("#municipalities").selectAll("path").remove(); // Clear municipalities
      svg
        .select("#cantons")
        .selectAll("path")
        .data(cantons.features)
        .join("path")
        .attr("d", path)
        .attr(
          "fill",
          (c) => colors[(c.properties as cantonPropertiesType).id] || "white"
        )
        .on("mouseover", function (event, d) {
          // Set tooltip to municipality name
          setTooltip({
            name: `Canton: ${d.properties?.["name"]}`,
            power: `Power: ${energyData[d.properties?.["name"]]} kW`,
            x: event.clientX,
            y: event.clientY,
          });
        })
        .on("mousemove", function (event, d) {
          // Update tooltip position
          setTooltip({
            name: `Canton: ${d.properties?.["name"]}`,
            power: `Power: ${energyData[d.properties?.["name"]]} kW`,
            x: event.clientX,
            y: event.clientY,
          });
        })
        .on("mouseout", function (_event, _d) {
          // Hide tooltip
          setTooltip({ name: null, power: null, x: 0, y: 0 });
        }); // use the color associated with the canton ID or a default color
    } else if (currentView === "municipality" && municipalities) {
      svg.select("#cantons").selectAll("path").remove(); // Clear cantons
      svg
        .select("#municipalities")
        .selectAll("path")
        .data(municipalities.features)
        .join("path")
        .attr("d", path)
        .attr(
          "fill",
          (c) =>
            colors[(c.properties as municipalitiesPropertiesType).id] || "white"
        )
        .on("mouseover", function (event, d) {
          // Set tooltip to municipality name
          setTooltip({
            name: `Municipality: ${d.properties?.["name"]}`,
            power: `Power: ${energyData[d.properties?.["name"]]} kW`,
            x: event.clientX,
            y: event.clientY,
          });
        })
        .on("mousemove", function (event, d) {
          // Update tooltip position
          setTooltip({
            name: `Municipality: ${d.properties?.["name"]}`,
            power: `Power: ${energyData[d.properties?.["name"]]} kW`,
            x: event.clientX,
            y: event.clientY,
          });
        })
        .on("mouseout", function (_event, _d) {
          // Hide tooltip
          setTooltip({ name: null, power: null, x: 0, y: 0 });
        }); // use the color associated with the Municipality ID or a default color
    }
  }, [state, cantons, municipalities, currentView, width, height]);

  return (
    <div>
      <svg ref={svgRef} id="SwissMap" width={width} height={height}>
        <g id="state"></g>
        <g id="cantons"></g>
        <g id="municipalities"></g>
      </svg>
      <Tooltip
        name={tooltip.name}
        power={tooltip.power}
        x={tooltip.x}
        y={tooltip.y}
      />
      ;
    </div>
  );
};

export default SwissMap;
