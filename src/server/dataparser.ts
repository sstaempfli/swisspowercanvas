import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
    Canton: string;
    TotalPower: string;
}

let cantonPower: { [key: string]: number } = {};

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
        let output = 'Canton,TotalPower\n';
        for (let canton in cantonPower) {
            if (cantonPower.hasOwnProperty(canton)) {
                let totalPower = cantonPower[canton];

                // Check if totalPower is not undefined before calling toFixed(2)
                if (totalPower !== undefined) {
                    let formattedPower = totalPower.toFixed(2);
                    output += `${canton},${formattedPower}\n`;
                }
            }
        }
        fs.writeFileSync('src/server/data/cantonsTotalPower.csv', output);
        console.log('CSV file successfully processed');
    });
