import { useMemo } from "react";
import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";

type statePropertiresType = {
  id: string
  name: string
}

type cantonPropertiesType = {
  id: number
  name : string
  fill : string
  stroke: string
}

type municipalitiesPropertiesType = {
  id: number
  name: string
  ktnr: number
}

const requestData = async () => {
  // Use fetch to send the request to the server
  try {
    const response = await fetch("/hello");

    // Process your server's response here
    const data = await response.text();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
  return;
};

function App() {
  const { state, cantons, municipalities } = useSwissAtlas();
  //cantons.features.forEach((f)=> (console.log(((f.properties) as cantonPropertiesType).name)))
  (cantons.features[0]?.properties as cantonPropertiesType).fill = "#FF0000"
  return (
    <Layout>
      {useMemo(() => <SwissMap state= {state} cantons= {cantons} municipalities= {municipalities}/>, [state, cantons, municipalities])}
      <button onClick={requestData}>Very good on press button event</button>
    </Layout>
  );
}

export default App;

