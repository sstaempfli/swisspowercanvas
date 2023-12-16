import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Canton: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
  BeginningOfOperation:string;
}

interface CantonID {
  name: string;
  id: number;
}

type cantonPower = {
  id: number;
  mainCategory: string;
  subCategory: string;
  date: string;
  amount: string;
}


let cantonIDMap: { [name: string]: number } = {};
let subCategoryDefinitions: { [code: string]: string } = {};
let sumArray = [] as cantonPower[]

// Manually define the subcategory mappings
subCategoryDefinitions['subcat_1'] = 'Hydroelectric power';
subCategoryDefinitions['subcat_2'] = 'Photovoltaic';
subCategoryDefinitions['subcat_3'] = 'Wind energy';
subCategoryDefinitions['subcat_4'] = 'Biomass';
subCategoryDefinitions['subcat_5'] = 'Geothermal energy';
subCategoryDefinitions['subcat_6'] = 'Nuclear energy';
subCategoryDefinitions['subcat_7'] = 'Crude oil';
subCategoryDefinitions['subcat_8'] = 'Natural gas';
subCategoryDefinitions['subcat_9'] = 'Coal';
subCategoryDefinitions['subcat_10'] = 'Waste';

let mainCategoryDefinitions: { [code: string]: string } = {};

// Manually define the category mappings
mainCategoryDefinitions['maincat_1'] = 'Hydroelectric power';
mainCategoryDefinitions['maincat_2'] = 'Other renewable energies';
mainCategoryDefinitions['maincat_3'] = 'Nuclear energy';
mainCategoryDefinitions['maincat_4'] = 'Fossil fuel';
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
    // Use the English definitions for main and subcategories
    const mainCategory = mainCategoryDefinitions[row.MainCategory];
    const subCategory = subCategoryDefinitions[row.SubCategory];
    const date = row.BeginningOfOperation;
    const amount = row.TotalPower;
    
    let Canton = row.Canton;
    let id = cantonIDMap[Canton];
    if(!id || !mainCategory || !subCategory ||!date || !amount){
      console.log("problem with:" + Canton);
    }else{
      const temp = {id,mainCategory,subCategory, date, amount} as cantonPower;
      sumArray.push(temp)
    }
  })
  .on('end', () => {
    // Output the aggregated data
    let output = 'ID,MainCategory,SubCategory,TotalPower,Date\n';
    // Write the results to a CSV file
    sumArray.forEach((i) => {
      output += `${i.id},${i.mainCategory},${i.subCategory},${i.amount},${i.date}\n`;
    })
    fs.writeFileSync('src/server/data/cantonsGraph.csv', output);
    console.log('CSV file successfully processed');
  });
});
 
