import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";



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
  const { stateBorders, cantonBorders, municipalityBorders } = useSwissAtlas();
  console.log(stateBorders.features[0]?.properties);
  console.log(JSON.stringify(stateBorders.features[0]?.properties));
  return (
    <Layout>
      <SwissMap state= {stateBorders} cantons= {cantonBorders} municipalities= {municipalityBorders}  />
      <button onClick={requestData}>Very good on press button event</button>
    </Layout>
  );
}

export default App;

