import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Municipality: string;
  PostCode: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
  BeginningOfOperation:string;
}
interface MunicipalityPLZ{
  Ortschaftsname: string;
  PLZ: string;
  Zusatzziffer: string;
  Gemeindename: string;
  BFS_Nr: string;
  Kantonskürzel: string;
  E: string;
  N: string;
  Sprache: string;

}


type municipalityPower = {
  id: number;
  mainCategory: string;
  subCategory: string;
  date: string;
  amount: string;
}

let municipalityPLZMap: { [key: number]: [number] } = {};
let subCategoryDefinitions: { [code: string]: string } = {};
let sumArray = [] as municipalityPower[]

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
// Read the PLZ to ID and name mapping


fs.createReadStream("src/server/data/PLZO_CSV_LV95.csv")
.pipe(csv())
.on("data", (row: MunicipalityPLZ) => {
  if (!municipalityPLZMap[parseInt(row.PLZ)]){
    municipalityPLZMap[parseInt(row.PLZ)] = [parseInt(row.BFS_Nr)];
  }else{
    municipalityPLZMap[parseInt(row.PLZ)]?.push(parseInt(row.BFS_Nr));
  }
})
.on("end", () => {
  // Process the power data
  fs.createReadStream('src/server/data/ElectricityProductionPlant.csv')
  .pipe(csv())
  .on('data', (row: PowerData) => {      
    let plz = parseInt(row.PostCode);
    let id = municipalityPLZMap[plz];
    if (!id){
      console.log("problem with:" + row);
    }else{
      id.forEach((id) => {
        const mainCategory = mainCategoryDefinitions[row.MainCategory];
        const subCategory = subCategoryDefinitions[row.SubCategory];
        const date = row.BeginningOfOperation;
        const amount = row.TotalPower;
        if(!mainCategory || !subCategory ||!date || !amount){
          console.log("problem with:" + row);
        }else{
          const temp = {id,mainCategory,subCategory, date, amount} as municipalityPower;
          sumArray.push(temp)
        }
      });
    }
  })
  .on('end', () => {
    // Output the aggregated data
    let output = 'ID,MainCategory,SubCategory,TotalPower,Date\n';
    // Write the results to a CSV file
    sumArray.forEach((i) => {
      output += `${i.id},${i.mainCategory},${i.subCategory},${i.amount},${i.date}\n`;
    })
    fs.writeFileSync('src/server/data/municipalitiesGraph.csv', output);
    console.log('Municipality CSV file processed');
  });
});
  
  
