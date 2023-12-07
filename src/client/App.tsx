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
  Canton?: string;
  Municipality?: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
};

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [data, setData] = useState<DataType[] | null>(null);
  const [currentView, setCurrentView] = useState<"canton" | "municipality">("canton");
  const [selectedEnergySource, setSelectedEnergySource] = useState('All');


  const handleViewChange = (view: "canton" | "municipality") => {
    setCurrentView(view);
    requestData(view); // Fetch data based on the selected view
  };

  const requestData = async (view: "canton" | "municipality") => {
    try {
      const endpoint = view === "canton" ? "/hello" : "/municipalities";
      const response = await fetch(endpoint);
      const dat = await response.json();
      setData(dat.message.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    requestData(currentView);
  }, [currentView]);

  useEffect(() => {
    if (data) {
      const filteredData = selectedEnergySource === 'All' 
        ? data 
        : data.filter(d => d.SubCategory === selectedEnergySource);

      const powerValues = filteredData.map(d => parseFloat(d.TotalPower));

      if (currentView === "canton") {
        // Update cantons
        const minPower = Math.min(...powerValues);
        const maxPower = Math.max(...powerValues);
        const powerScale = scaleLinear().domain([minPower, maxPower]).range([0, 1]);
        cantons.features.forEach(canton => {
          const cantonData = filteredData.find(d => d.ID === canton.properties.id.toString());
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
         
        //const municipalityMap = new Map<number, any>(municipalities.features.map(feature => [feature.properties.id, feature]));
        //const powerValuesNumbers = data.map(d => parseFloat(d.TotalPower)).filter((v): v is number => !isNaN(v));
    
        // Use a quantile scale for the color mapping
        /*const colorScale = scaleQuantile<number>()
          .domain(powerValuesNumbers)
          .range([
            "#f7fbff", "#deebf7", "#c6dbef", 
            "#9ecae1", "#6baed6", "#4292c6", 
            "#2171b5", "#08519c", "#08306b"  // This range can be any set of colors you choose
          ]);*/
          /*const minPower = Math.min(...powerValuesNumbers);
          const maxPower = Math.max(...powerValuesNumbers);

          // Create a quantize scale with the numeric power values
          /*const colorScale = scaleQuantize<number>()
            .domain([minPower, maxPower])
            .range([
              // Define your range of colors
              "#f7fbff", "#deebf7", "#c6dbef", 
              "#9ecae1", "#6baed6", "#4292c6", 
              "#2171b5", "#08519c", "#08306b"
            ]);*/

            municipalities.features.forEach(municipality => {
              const municipalityData = filteredData.find(d => d.ID === municipality.properties.id.toString());
              const power = municipalityData ? parseFloat(municipalityData.TotalPower) : 0;
              const scaledPower = powerScale(power);
              console.log(scaledPower);
          
              const properties = municipality.properties as municipalityPropertiesType;
              properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)}, 1)`;
              municipality.properties = properties;
              /*if (!isNaN(power)) {
              properties.fill = colorScale(power) as string;
            } else {
              console.error(`Invalid power value for ID: ${d.ID} with power: ${d.TotalPower}`);
            }*/
            });
      }
    }
  }, [data, currentView]); // Add currentView as a dependency

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
