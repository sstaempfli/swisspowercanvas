import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Municipality: string;
  PostCode: string; 
  TotalPower: string;
}

interface MunicipalityIDPLZ {
  id: string;
  name: string;
  PLZ: string;
}

let municipalityPower: {
  [id: string]: {
    totalPower: number;
    name: string;
  };
} = {};
let municipalityIDPLZMap: {
  [PLZ: string]: {
      id: string;
      name: string;
  };
} = {};
// Read the PLZ to ID and name mapping
fs.createReadStream('src/server/data/municipalityIDPLZmapping.csv')
  .pipe(csv())
  .on('data', (row: MunicipalityIDPLZ) => {
    municipalityIDPLZMap[row.PLZ] = { id: row.id, name: row.name };
  })
  .on('end', () => {
    // Process the power data
    fs.createReadStream('src/server/data/ElectricityProductionPlant.csv')
      .pipe(csv())
      .on('data', (row: PowerData) => {
        let PostCode = row.PostCode;
        let data = municipalityIDPLZMap[PostCode];
        if (data) {
          let totalPower = parseFloat(row.TotalPower) || 0;
          if (municipalityPower[data.id]) {
            municipalityPower[data.id]!.totalPower += totalPower;
          } else {
            municipalityPower[data.id] = {
              totalPower: totalPower,
              name: data.name,
            };
          }
        }
      })
      .on('end', () => {
        let output = 'ID,Municipality,TotalPower\n';
        for (let id in municipalityPower) {
          if (municipalityPower.hasOwnProperty(id)) {
            let data = municipalityPower[id];
            if (data != undefined){
              let formattedPower = data.totalPower.toFixed(2);
              output += `${id},${data.name},${formattedPower}\n`;
            }
          }
        }
        fs.writeFileSync('src/server/data/municipalitiesTotalPower.csv', output);
        console.log('Municipality CSV file successfully processed');
      });
  });