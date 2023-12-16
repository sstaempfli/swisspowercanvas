import React from "react";
import * as d3 from "d3";

interface DataProps {
  year: number;
  value: number;
}

interface GraphProps {
  data: DataProps[];
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const uniqueYears = [...new Set(data.map((d) => Math.floor(d.year)))];
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
        d3.min(data, (d) => d.year) ?? 0,
        d3.max(data, (d) => d.year) ?? 0,
      ])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => `${Math.floor(d)}`)
          .tickValues(uniqueYears)
      );

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y).tickFormat((d) => `${d} kW`));

    svg
      .append("path")
      .datum(data.map((d) => [x(d.year), y(d.value)])) // map data to array of tuples
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line());
  }, [data]);

  return <div id="graph" />;
};

export default Graph;
