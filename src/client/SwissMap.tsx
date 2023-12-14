import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { ChartProps, defaultChartProps } from "./types/chart";

interface SwissMapProps extends Partial<ChartProps> {
  state: GeoJSON.FeatureCollection;
  cantons?: GeoJSON.FeatureCollection; // Optional
  municipalities?: GeoJSON.FeatureCollection; // Optional
  currentView: "canton" | "municipality";
  colors: Record<string, string>;
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
  width = defaultChartProps.width,
  height = defaultChartProps.height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);

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
          setTooltip(`Canton: ${d.properties?.["name"]}`);
        })
        .on("mouseout", function (event, d) {
          // Hide tooltip
          setTooltip(null);
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
          setTooltip(`Municipality: ${d.properties?.["name"]}`);
        })
        .on("mouseout", function (event, d) {
          // Hide tooltip
          setTooltip(null);
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
      {tooltip && <div className="tooltip">{tooltip}</div>}
    </div>
  );
};

export default SwissMap;
