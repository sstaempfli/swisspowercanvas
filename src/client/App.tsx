import { useState, useEffect } from 'react';
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";
import { scaleLinear } from 'd3-scale';


type cantonPropertiesType = {
  id: number
  name : string
  fill : string
  stroke: string
}


type DataType = {
  ID: string;
  Canton: string;
  TotalPower: string;
};

// Declare your state variable with a type annotation





function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  const [data, setData] = useState<DataType[] | null>(null);

  const requestData = async () => {
    try {
      const response = await fetch("/hello");
      const dat = await response.json();

      setData(dat.message.data)
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    requestData();
  }, []);

  useEffect(() => {
    if (data) {
      console.log(data)
      const powerValues = data.map(d => parseFloat(d.TotalPower));
      const minPower = Math.min(...powerValues);
      const maxPower = Math.max(...powerValues);

      const powerScale = scaleLinear()
          .domain([minPower, maxPower])
          .range([0, 1]);

      // Update the fill color of the cantons based on the total power
      data.forEach(d => {
        const cantonID = parseInt(d.ID)-1;
        const power = parseFloat(d.TotalPower);
        const scaledPower = powerScale(power);


          // Convert the scaled power value to a blue color
        // @ts-ignore
        (cantons.features[cantonID].properties as cantonPropertiesType).fill = `rgba(0, 0, ${Math.round(scaledPower * 255)})`;

      });
    }
  }, [data]); // Add data as a dependency to this useEffect

  return (
      <Layout>
        <SwissMap state= {state} cantons= {cantons} municipalities= {municipalities}/>
      </Layout>
  );
}

export default App;

