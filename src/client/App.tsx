import { useState, useEffect } from "react";
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
import { interpolateViridis } from "d3";
import { scaleLog, scaleSequential } from "d3-scale";
import ColorLegend from "./colorlegend";
import Graph from "./graph";
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

type GraphDataType = {
  Date: number;
  TotalPower: number;
};
const allEnergySources = ["All", "Renewable Energy", ...energySources];

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [currentView, setCurrentView] = useState<"canton" | "municipality">(
    "canton"
  );
  const [selectedEnergySource, setSelectedEnergySource] = useState("All");
  const [colors, setColors] = useState<Record<string, string>>({});
  const [energyData, setEnergyData] = useState<Record<string, string>>({});
  const [graphData, setGraphData] = useState<GraphDataType[]>([]); //
  const [currentlySelected, setCurrentlySelected] =
    useState<string>("Switzerland");
  const [currentlySelectedID, setCurrentlySelectedID] = useState<number>(-1);
 // const renewableEnergySources = ["Hydroelectric power", "Photovoltaic", "Wind energy", "Biomass", "Geothermal energy"];
  const renewableEnergyCategories = ["Hydroelectric power", "Other renewable energies"];
 // const [renewableSourcesPresent, setRenewableSourcesPresent] = useState<Set<string>>(new Set());



  const [minV, _setMinV] = useState(1);
  const [maxV, setMaxV] = useState(10000000);

  const handleViewChange = (view: "canton" | "municipality") => {
    setCurrentlySelected("Switzerland");
    setCurrentlySelectedID(-1);
    setCurrentView(view);
  };

  const requestDataGraph = async (
    id: number,
    isCanton: boolean,
    energySource: string
  ) => {
    const sendData = { id, isCanton, energySource };
    //console.log(sendData);
    try {
      const response = await fetch("/graphData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendData),
      });

      const graphDataIn = (await response.json()).message
        .data as GraphDataType[];
      setGraphData(graphDataIn);
      //console.log(graphDataIn);
    } catch (error) {
      console.error("Error sending parameters:", error);
    }
  };
  useEffect(() => {
    requestDataGraph(
      currentlySelectedID,
      currentView == "canton",
      selectedEnergySource
    );
  }, [currentlySelectedID, currentView, selectedEnergySource]);

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
          : data.filter((d) => {
              if (selectedEnergySource === "Renewable Energy") {
                return renewableEnergyCategories.includes(d.MainCategory);
              } else {
                return d.SubCategory === selectedEnergySource;
              }
            });
            
           
          
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
        setMaxV(max);

        const newColors: Record<string, string> = {};
        const newEnergyData: Record<string, string> = {};

        if (currentView === "canton") {
          // Update cantons
          //console.log(min + "|" + max );
          const powerScale = scaleLog().domain([min, max]).range([0, 1]);
          const colorMaker = scaleSequential()
            .domain([0, 1])
            .interpolator(interpolateViridis);

          cantons.features.forEach((canton) => {
            const cantonData = filteredData.filter(
              (d) => d.ID == (canton.properties as cantonPropertiesType).id
            );
            var power = 0;
            cantonData.forEach((k) => (power += parseFloat(k.TotalPower)));
            const scaledPower = powerScale(power);
            const properties = canton.properties as cantonPropertiesType;
            if (properties) {
              if (power == 0) {
                newColors[properties.id] = "rgba(128, 128, 128, 1)";
              } else {
                newColors[properties.id] = colorMaker(scaledPower);
              }
              newEnergyData[properties.name] = power.toFixed(2);
            }
          });
        } else {
          // Use a logarithmic scale for better differentiation of small values
          const powerScale = scaleLog().domain([min, max]).range([0, 1]);
          const colorMaker = scaleSequential()
            .domain([0, 1])
            .interpolator(interpolateViridis);

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
              if (power == 0) {
                newColors[properties.id] = "rgba(128, 128, 128, 1)";
              } else {
                newColors[properties.id] = colorMaker(scaledPower);
              }
              newEnergyData[properties.name] = power.toFixed(2);
            }
          });

          /*var a = [] as number[]
          filteredData.forEach(x => {if(municipalities.features.filter(mun => (mun.properties as municipalityPropertiesType).id == x.ID).length >= 1){}else{console.log(x.ID + " nomatch")}});
          municipalities.features.forEach(x => {if(filteredData.filter(mun => (mun.ID == (x.properties as municipalityPropertiesType).id)).length >= 1){}else{console.log((x.properties as municipalityPropertiesType).id + " is white")}});
          filteredData.forEach(x => {if(a.includes(x.ID)){
          }else{a.push(x.ID)}})
          console.log(municipalities.features.length + "|" + filteredData.length + "|" + a.length);
          */
        }
        setColors(newColors);
        setEnergyData(newEnergyData);
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
          {allEnergySources.map((source) => (
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
        energyData={energyData}
        setCurrentlySelectedID={setCurrentlySelectedID}
        setCurrentlySelected={setCurrentlySelected}
        selectedEnergySource={selectedEnergySource}
      />

      <ColorLegend min={minV} max={maxV} />

      <Graph
        data={graphData}
        currentlySelected={currentlySelected}
        selectedEnergySource={selectedEnergySource}
      />
    </Layout>
  );
}

export default App;
