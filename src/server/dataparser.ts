import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
    Canton: string;
    TotalPower: string;
}

interface CantonID {
    id: string;
    name: string;
}

let cantonPower: { [key: string]: number } = {};
let cantonIDMap: { [key: string]: string } = {};

// Read the canton ID mapping
fs.createReadStream('src/server/data/cantonIDMapping.csv')
    .pipe(csv())
    .on('data', (row: CantonID) => {
        cantonIDMap[row.name] = row.id;
    })
    .on('end', () => {
        // Process the power data
        fs.createReadStream('src/server/data/ElectricityProductionPlant.csv')
            .pipe(csv())
            .on('data', (row: PowerData) => {
                if (row.Canton in cantonPower) {
                    cantonPower[row.Canton] += parseFloat(row.TotalPower);
                } else {
                    cantonPower[row.Canton] = parseFloat(row.TotalPower);
                }
            })
            .on('end', () => {
                let output = 'ID,Canton,TotalPower\n';
                for (let canton in cantonPower) {
                    if (cantonPower.hasOwnProperty(canton)) {
                        let totalPower = cantonPower[canton];

                        // Check if totalPower is not undefined before calling toFixed(2)
                        if (totalPower !== undefined) {
                            let formattedPower = totalPower.toFixed(2);
                            let id = cantonIDMap[canton];
                            output += `${id},${canton},${formattedPower}\n`;
                        }
                    }
                }
                fs.writeFileSync('src/server/data/cantonsTotalPower.csv', output);
                console.log('CSV file successfully processed');
            });
    });
