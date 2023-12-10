import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Canton: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
}

interface CantonID {
  name: string;
  id: number;
}

let cantonPower: {
  [id: number]: {
    [mainCategory: string]: {
      [subCategory: string]: number;
    };
  };
} = {};


let cantonIDMap: { [name: string]: number } = {};
let subCategoryDefinitions: { [code: string]: string } = {};

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
                const mainCategoryEn = mainCategoryDefinitions[row.MainCategory];
                const subCategoryEn = subCategoryDefinitions[row.SubCategory];
                
                if (!mainCategoryEn || !subCategoryEn) {
                  console.warn(`Undefined category for MainCategory: ${row.MainCategory}, SubCategory: ${row.SubCategory}`);
                  return; // Skip this row or handle it as needed
                }
                let Canton = row.Canton;
                let id = cantonIDMap[Canton];
                if(!id){
                  console.log("problem with:" + Canton);
                }else{
                  if (!cantonPower[id]) {
                    cantonPower[id] = {};
                  }
                  let data = cantonPower[id]![mainCategoryEn!];
                  if (!data) {
                    cantonPower[id]![mainCategoryEn!] = {};
                    data = cantonPower[id]![mainCategoryEn!];
                  }

                  if (!data![subCategoryEn!]) {
                    data![subCategoryEn!] = 0;
                  }
                  // Now you can safely update the data
                  data![subCategoryEn!] += parseFloat(row.TotalPower);
                }})
              .on('end', () => {
                // Output the aggregated data
                let output = 'ID,MainCategory,SubCategory,TotalPower\n';
                for (let id in cantonPower) {
                  for (let mainCategory in cantonPower[id]) {
                    let data = cantonPower[id];
                    if (data != undefined){
                      let data1 = data [mainCategory];
                      if (data1!= undefined){
                        for (let subCategory in data1) {
                          let data2= data1 [subCategory];
                          if (data2!= undefined){
                             let totalPower= data2.toFixed(2);
                            output += `${id},${mainCategory},${subCategory},${totalPower}\n`;
                          } 
                          }
                            

                      }
                    }
                    
                  }
                }
                // Write the results to a CSV file
                fs.writeFileSync('src/server/data/cantonsPower.csv', output);
                console.log('CSV file successfully processed');
              });
          });
 
