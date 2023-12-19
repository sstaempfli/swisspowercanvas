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
  Date:number;
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
  const graphData =  (req.body) as graphData;
  let path = "";
  if (graphData.isCanton){
    path = "src/server/data/cantonsGraph.csv";
  }else{
    path = "src/server/data/municipalitiesGraph.csv"
  }
  function processData(path:string, graphData:graphData){
    return new Promise((resolve, reject) => {
      let output = 'Date,TotalPower\n';
      let sumObject: { [date: string]: number } = {};

      fs.createReadStream(path).pipe(csv()).on('data', (row: lineData) => {
        if ((row.ID == graphData.id || graphData.id == "-1") && (row.SubCategory == graphData.energySource || graphData.energySource == 'All')){    
          if (!sumObject[row.Date]) {
            sumObject[row.Date] = 0;
          }
          sumObject[row.Date] += parseFloat(row.TotalPower);
        }
      })
      .on("end", () => {
        const sortedDates = Object.keys(sumObject).sort();
        sortedDates.forEach((date) => {
          output += `${date},${sumObject[date]}\n`;
        });
        resolve(output);
      })
      .on('error', (error) => {
        reject(error); // Reject the promise if there's an error during processing
      });
    })

  }
  processData(path,graphData).then((result) => {
  let a = result as string;
  let json = papa.parse(a,{header: true, skipEmptyLines: true,});
  res.status(200).json({ message: json });
  })
  .catch((error) => {
    console.error('Error occurred:', error);
  });
});

// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
