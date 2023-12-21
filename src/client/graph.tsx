import React from "react";
import * as d3 from "d3";
import { format } from "d3-format";
import Tooltip from "./graphToolTip";

interface DataProps {
  Date: number;
  TotalPower: number;
}

interface GraphProps {
  data: DataProps[];
  currentlySelected: string;
  selectedEnergySource: string;
}

const formatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0, 
});

const Graph: React.FC<GraphProps> = ({
  data,
  currentlySelected,
  selectedEnergySource,
}) => {
  const [tooltip, setTooltip] = React.useState<{
    power: string;
    year: number;
    x: number;
    y: number;
  }>({ power: "0", year: 0, x: 0, y: 0 });
  const formatThousands = format(",");
  let maxTotalPower = Math.max(...data.map((d) => d.TotalPower));
  maxTotalPower = isFinite(maxTotalPower) ? maxTotalPower : 0;

  React.useEffect(() => {
    d3.select("#graph").selectAll("*").remove();
    const margin = { top: 10, right: 30, bottom: 30, left: 80 };
    const width = window.innerWidth - margin.left - margin.right - 60,
      height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", window.innerWidth - 60)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const minYear = Math.min(...data.map((d) => d.Date));
    const maxYear = Math.max(...data.map((d) => d.Date));

    const x = d3
      .scaleLinear()
      .domain(
        data.length > 1 ? [minYear ?? 0, maxYear + 1] : [minYear, maxYear]
      )
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3
          .axisBottom(x)
          .ticks(10) // Adjust this number to change the number of ticks
          .tickFormat((d) => d.toString())
      );

    const y = d3.scaleLinear().domain([0, maxTotalPower]).range([height, 0]);
    svg
      .append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `${formatThousands(d)} kW`));

    const numYears = maxYear - minYear + 1;

    const barWidth = data.length > 1 ? width / numYears : 50; // Set a minimum bar width for single data point

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.Date)) // Adjust the x position
      .attr("y", (d) => y(d.TotalPower))
      .attr("width", barWidth)
      .attr("height", (d) => height - y(d.TotalPower))
      .attr("fill", "steelblue")
      .on("mouseover", function (event, d) {
        setTooltip({
          power: formatter.format(d.TotalPower),
          year: d.Date,
          x: event.clientX,
          y: event.clientY,
        });
      })
      .on("mousemove", function (event, d) {
        setTooltip({
          power: formatter.format(d.TotalPower),
          year: d.Date,
          x: event.clientX,
          y: event.clientY,
        });
      })
      .on("mouseout", function (_event, _d) {
        setTooltip({ power: "0", year: 0, x: 0, y: 0 });
      });
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
        Timeline when new power plants were installed in {currentlySelected} in
        the category {selectedEnergySource}
      </h3>
      <div id="graph" style={{ textAlign: "center" }} />
      <Tooltip
        power={tooltip.power}
        year={tooltip.year}
        x={tooltip.x}
        y={tooltip.y}
      />
    </div>
  );
};

export default Graph;
