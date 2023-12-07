import { useState, useEffect } from 'react';
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
import { scaleLinear } from 'd3-scale';
import { scaleLog } from 'd3-scale';
//import { scaleQuantize, scaleQuantile } from 'd3-scale';


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
  TotalPower: string;
};

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [data, setData] = useState<DataType[] | null>(null);
  const [currentView, setCurrentView] = useState<"canton" | "municipality">("canton");

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
      console.log(data);
      const powerValues = data.map(d => parseFloat(d.TotalPower));

      if (currentView === "canton") {
        // Update cantons
        const minPower = Math.min(...powerValues);
        const maxPower = Math.max(...powerValues);
        const powerScale = scaleLinear().domain([minPower, maxPower]).range([0, 1]);
        data.forEach(d => {
          const cantonID = parseInt(d.ID) - 1;
          const power = parseFloat(d.TotalPower);
          const scaledPower = powerScale(power);
          const canton = cantons.features[cantonID];
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
         
        const municipalityMap = new Map<number, any>(municipalities.features.map(feature => [feature.properties.id, feature]));
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

        data.forEach(d => {
          const municipalityID = parseInt(d.ID);
          const municipality = municipalityMap.get(municipalityID);
          const power = parseFloat(d.TotalPower);
          const scaledPower = powerScale(power);
        
          if (!municipality) {
            console.error(`No municipality found for ID: ${d.ID}`);
            return;
          }
      
          const properties: municipalityPropertiesType = municipality.properties 
          properties.fill = `rgba(0, 0, ${Math.round(scaledPower * 255)}, 1)`;
            /*if (!isNaN(power)) {
              properties.fill = colorScale(power) as string;
            } else {
              console.error(`Invalid power value for ID: ${d.ID} with power: ${d.TotalPower}`);
            }*/
      
          // Assign the modified properties back to the municipality
          municipality.properties = properties;
        });
      }
    }
  }, [data, currentView]); // Add currentView as a dependency

  return (
    <Layout>
      <div>
        <button onClick={() => handleViewChange("canton")}>Cantons</button>
        <button onClick={() => handleViewChange("municipality")}>Municipalities</button>
      </div>
      <SwissMap
        state={state}
        cantons={cantons}
        municipalities={municipalities}
        currentView={currentView} // Pass the current view as a prop
      />
    </Layout>
  );
}

export default App;
