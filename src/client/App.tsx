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
  const { features, cantonBorders, municipalityBorders } = useSwissAtlas();
  return (
    <Layout>
      <SwissMap features= {features} cantons={ cantonBorders} municipalities= {municipalityBorders}  />
      <button onClick={requestData}>Very good on press button event</button>
    </Layout>
  );
}

export default App;

