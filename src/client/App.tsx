import { useState, useEffect } from 'react';
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
import { scaleLinear } from 'd3-scale';
import { scaleLog } from 'd3-scale';
//import { scaleQuantize, scaleQuantile } from 'd3-scale';

const energySources = [
  'Hydroelectric power',
  'Photovoltaic',
  'Wind energy',
  'Biomass',
  'Geothermal energy',
  'Nuclear energy',
  'Crude oil',
  'Natural gas',
  'Coal',
  'Waste'
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
  ID: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
};

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [currentView, setCurrentView] = useState<"canton" | "municipality">("canton");
  const [selectedEnergySource, setSelectedEnergySource] = useState('All');


  const handleViewChange = (view: "canton" | "municipality") => {
    setCurrentView(view);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = currentView === "canton" ? "/cantons" : "/municipalities";
        const response = await fetch(endpoint);
        const data = ((await response.json()).message.data)as DataType[];
  
        const filteredData = selectedEnergySource === 'All' ? data : data.filter(d => d.SubCategory === selectedEnergySource);
        const powerValues = filteredData.map(d => parseFloat(d.TotalPower));
  
        if (currentView === "canton") {
          // Update cantons
          const minPower = Math.min(...powerValues);
          const maxPower = Math.max(...powerValues);
          const powerScale = scaleLog().domain([minPower, maxPower]).range([0, 1]);
          cantons.features.forEach(canton => {
            const cantonData = filteredData.find(d => d.ID === (canton.properties as cantonPropertiesType).id.toString());
            const power = cantonData ? parseFloat(cantonData.TotalPower) : 0;
            const scaledPower = powerScale(power);
            const properties = canton?.properties as cantonPropertiesType;
  
            if (properties) {
              properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)})`;
            }
          });
        } else {
          const minPower = Math.max(0.1, Math.min(...powerValues));
          const maxPower = Math.max(...powerValues);
          // Use a logarithmic scale for better differentiation of small values
          const powerScale = scaleLog().domain([minPower, maxPower]).range([0, 1]);
  
          municipalities.features.forEach(municipality => {
            const municipalityData = filteredData.find(d => d.ID === (municipality.properties as municipalityPropertiesType).id.toString());
            const power = municipalityData ? parseFloat(municipalityData.TotalPower) : 0;
            const scaledPower = powerScale(power);
            const properties = municipality.properties as municipalityPropertiesType;
            properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)}, 1)`;
            //console.log("fill changed for: "+ properties.name)
            municipality.properties = properties;
          });
        }
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
      <button onClick={() => handleViewChange("municipality")}>Municipalities</button>
      <select onChange={(e) => setSelectedEnergySource(e.target.value)}>
        <option value="All">All Energy Sources</option>
        {energySources.map(source => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>
    </div>
    <SwissMap
      state={state}
      cantons={cantons}
      municipalities={municipalities}
      currentView={currentView}
    />
  </Layout>
);
}

export default App;
