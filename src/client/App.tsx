import { useState, useEffect } from 'react';
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
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
  ID: number;
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
        
        const powerVal = filteredData.map(k => filteredData.filter(k2 => k.ID == k2.ID).map(k3 => parseFloat(k3.TotalPower)).reduce((a,b) => {return a + b},0))
        const max = Math.max(...powerVal)
        const min = Math.min(...powerVal)
  
        if (currentView === "canton") {
          // Update cantons
          const powerScale = scaleLog().domain([min, max]).range([0, 1]);
          cantons.features.forEach(canton => {
            const cantonData = filteredData.find(d => d.ID == (canton.properties as cantonPropertiesType).id);
            const power = cantonData ? parseFloat(cantonData.TotalPower) : 0;
            const scaledPower = powerScale(power);
            const properties = canton?.properties as cantonPropertiesType;
  
            if (properties) {
              properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)})`;
            }
          });
        } else {
          // Use a logarithmic scale for better differentiation of small values
          const powerScale = scaleLog().domain([min, max]).range([0, 1]);

          
          municipalities.features.forEach(municipality => {
            const municipalityData = filteredData.filter(d => d.ID == (municipality.properties as municipalityPropertiesType).id);

            var power = 0;
            municipalityData.forEach(k => power += parseFloat(k.TotalPower));

            const scaledPower = powerScale(power);
            const properties = municipality.properties as municipalityPropertiesType;
            properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)}, 1)`;
            municipality.properties = properties;
          });

          /*var a = [] as number[]
          filteredData.forEach(x => {if(municipalities.features.filter(mun => (mun.properties as municipalityPropertiesType).id == x.ID).length >= 1){}else{console.log(x.ID + " nomatch")}});
          municipalities.features.forEach(x => {if(filteredData.filter(mun => (mun.ID == (x.properties as municipalityPropertiesType).id)).length >= 1){}else{console.log((x.properties as municipalityPropertiesType).id + " is white")}});
          filteredData.forEach(x => {if(a.includes(x.ID)){
          }else{a.push(x.ID)}})
          console.log(municipalities.features.length + "|" + filteredData.length + "|" + a.length);
          */

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
