import "./App.css";
import Layout from "./Layout";
import SwissMap from "./SwissMap";
import { useSwissAtlas } from "./state/hooks";

function App() {
  const { features, cantonBorders, municipalityBorders } = useSwissAtlas();
  return (
    <Layout>
      <SwissMap features= {features} cantons={ cantonBorders} municipalities= {municipalityBorders}  />
    </Layout>
  );
}

export default App;

