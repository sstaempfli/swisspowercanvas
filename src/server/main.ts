import express from "express";
import ViteExpress from "vite-express";
import * as fs from "fs";
import papa from "papaparse";


// creates the expres app do not change
const app = express();

// add your routes here

// example route which returns a message
app.get("/cantons", async function (_req, res) {
  let file =  fs.readFileSync("src/server/data/cantonsPower.csv").toString();
  let json = papa.parse(file,{header: true, skipEmptyLines: true,});
  res.status(200).json({ message: json });
});

app.get("/municipalities", async function (_req, res) {
  let file = fs.readFileSync("src/server/data/municipalitiesPower.csv").toString();
  let json = papa.parse(file, { header: true, skipEmptyLines: true });
  res.status(200).json({ message: json });
});

// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
