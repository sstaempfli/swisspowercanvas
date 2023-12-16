import express from "express";
import ViteExpress from "vite-express";
import * as fs from "fs";
import papa from "papaparse";
import csv from 'csv-parser';

interface graphData {
  id:string;
  isCanton:boolean;
  energySource:string;
}

interface lineData {
  ID: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
  Date:string;
}

// creates the expres app do not change
const app = express();

app.use(express.json());

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

app.post("/graphData", async function (req, res) {
  const grpahData =  (req.body) as graphData;
  console.log(grpahData);
  let path = "";
  if (grpahData.isCanton){
    path = "src/server/data/cantonsGraph.csv";
  }
  let output = 'ID,MainCategory,SubCategory,TotalPower,Date\n';
  let sumArray = [] as lineData[]
  fs.createReadStream(path).pipe(csv()).on('data', (row: lineData) => {
    //console.log(row.ID + "|" + grpahData.id);
    if (row.ID == grpahData.id){
      sumArray.push(row);
    }
  })
  .on("end", () => {
    sumArray.forEach((i) => {
      output += `${i.ID},${i.MainCategory},${i.SubCategory},${i.TotalPower},${i.Date}\n`;
    })
  });
  console.log(output)
  let json = papa.parse(output, { header: true, skipEmptyLines: true });
  res.status(200).json({ message: json});
});

// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
