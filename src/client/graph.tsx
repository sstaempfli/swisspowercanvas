import React from "react";
import * as d3 from "d3";

interface DataProps {
  Date: number;
  TotalPower: number;
}

interface GraphProps {
  data: DataProps[];
  currentlySelected: string;
  selectedEnergySource: string;
}

const Graph: React.FC<GraphProps> = ({
  data,
  currentlySelected,
  selectedEnergySource,
}) => {
  const uniqueDates = [...new Set(data.map((d) => Math.floor(d.Date)))];
  console.log(data);
  let maxTotalPower = Math.max(...data.map((d) => d.TotalPower));
  maxTotalPower = isFinite(maxTotalPower) ? maxTotalPower : 0;
  console.log("Max Total Power:", maxTotalPower);

  React.useEffect(() => {
    d3.select("#graph").selectAll("*").remove();
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.Date) ?? 0,
        d3.max(data, (d) => d.Date) ?? 0,
      ])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d.toString())
          .tickValues(uniqueDates)
      );

    const y = d3.scaleLinear().domain([0, maxTotalPower]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y).tickFormat((d) => `${d} kW`));

    svg
      .append("path")
      .datum(data.map((d) => [x(d.Date), y(d.TotalPower)])) // map data to array of tuples
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line());
  }, [data]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h3>
        Timeline when new power plants were added in {currentlySelected} in the
        category {selectedEnergySource}
      </h3>
      <div id="graph" style={{ textAlign: "center" }} />
    </div>
  );
};

export default Graph;
