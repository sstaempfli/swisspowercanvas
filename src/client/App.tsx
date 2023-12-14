import { useState, useEffect } from "react";
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
import * as d3 from "d3";
//import { scaleQuantize, scaleQuantile } from 'd3-scale';

const energySources = [
  "Hydroelectric power",
  "Photovoltaic",
  "Wind energy",
  "Biomass",
  "Geothermal energy",
  "Nuclear energy",
  "Crude oil",
  "Natural gas",
  "Coal",
  "Waste",
];

type cantonPropertiesType = {
  id: number;
  name: string;
  fill: string;
  stroke: string;
};

type municipalityPropertiesType = {
  id: number;
  name: string;
  fill?: string;
};

type DataType = {
  ID: number;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
};

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [currentView, setCurrentView] = useState<"canton" | "municipality">(
    "canton"
  );
  const [selectedEnergySource, setSelectedEnergySource] = useState("All");
  const [colors, setColors] = useState<Record<string, string>>({});

  const handleViewChange = (view: "canton" | "municipality") => {
    setCurrentView(view);
  };

  const svg = d3.select("#svgLegend");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          currentView === "canton" ? "/cantons" : "/municipalities";
        const response = await fetch(endpoint);
        const data = (await response.json()).message.data as DataType[];

        const filteredData =
          selectedEnergySource === "All"
            ? data
            : data.filter((d) => d.SubCategory === selectedEnergySource);

        const powerVal = filteredData.map((k) =>
          filteredData
            .filter((k2) => k.ID == k2.ID)
            .map((k3) => parseFloat(k3.TotalPower))
            .reduce((a, b) => {
              return a + b;
            }, 0)
        );
        const max = Math.max(...powerVal);
        const min = 1;

        const newColors: Record<string, string> = {};

        if (currentView === "canton") {
          // Update cantons
          //console.log(min + "|" + max );
          const powerScale = d3.scaleLog().domain([min, max]).range([0, 1]);
          const colorMaker = d3.scaleSequential().domain([0,1]).interpolator(d3.interpolateViridis);

          cantons.features.forEach((canton) => {
            const cantonData = filteredData.filter(
              (d) => d.ID == (canton.properties as cantonPropertiesType).id
            );
            var power = 0;
            cantonData.forEach(
              (k) => (power += parseFloat(k.TotalPower))
            )
            const scaledPower = powerScale(power);
            const properties = canton.properties as cantonPropertiesType;
            if (properties) {
              if(power == 0){
                newColors[properties.id] = "rgba(128, 128, 128, 1)";
              }else{
                newColors[properties.id] = colorMaker(scaledPower);
              }
            }
          });

          const delta = (max - min) / 9
          const a = (Array.from({length:10}, (_, i)=> powerScale(i*delta + min)))

        } else {
          // Use a logarithmic scale for better differentiation of small values
          const powerScale = d3.scaleLog().domain([min, max]).range([0, 1]);
          const colorMaker = d3.scaleSequential().domain([0,1]).interpolator(d3.interpolateViridis);

          municipalities.features.forEach((municipality) => {
            const municipalityData = filteredData.filter(
              (d) =>
                d.ID ==
                (municipality.properties as municipalityPropertiesType).id
            );

            var power = 0;
            municipalityData.forEach(
              (k) => (power += parseFloat(k.TotalPower))
            );

            const scaledPower = powerScale(power);
            const properties =
              municipality.properties as municipalityPropertiesType;
            if (properties) {
              if(power == 0){
                newColors[properties.id] = "rgba(128, 128, 128, 1)";
              }else{
                newColors[properties.id] = colorMaker(scaledPower);
              }
            }
          });
          const delta = (max - min) / 9
          const a = (Array.from({length:10}, (_, i)=> powerScale(i*delta + min)));
          svg.select("#gLegend").selectAll("circle").remove(); // Clear municipalities
          svg.select("#gLegend")
          .selectAll("circle")
          .data(a)
          .join("#circle")
          .attr("cx", function(_,i){return 30 + i*60})
          .attr("cy", 19)
          .attr("r", 19)
          .attr("fill", function(d){return colorMaker(d) })
        }
        setColors(newColors);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData(); // Call the async function to fetch and process data
  }, [currentView, selectedEnergySource]); // Add necessary dependencies
  
  return (
    <Layout>
      <div>
        <button onClick={() => handleViewChange("canton")}>Cantons</button>
        <button onClick={() => handleViewChange("municipality")}>
          Municipalities
        </button>
        <select onChange={(e) => setSelectedEnergySource(e.target.value)}>
          <option value="All">All Energy Sources</option>
          {energySources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>
      <SwissMap
        state={state}
        cantons={cantons}
        municipalities={municipalities}
        currentView={currentView}
        colors={colors}
      />
      <svg id="svgLegend" width="1000" height="100">
      <g id="gLegend"></g>
      </svg>
    </Layout>
  );
}

export default App;
