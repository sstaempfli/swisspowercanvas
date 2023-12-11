import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Municipality: string;
  PostCode: string;
  MainCategory: string;
  SubCategory: string;
  TotalPower: string;
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


let municipalityPower: {
  [id: number]: {
    totalPower: number;
    categories: {
      [mainCategory: string]: {
        [subCategory: string]: number;
      };
    };
  };
} = {};

let municipalityPLZMap: { [key: number]: [number] } = {};
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
    let i = 0;
    fs.createReadStream('src/server/data/ElectricityProductionPlant.csv')
      .pipe(csv())
      .on('data', (row: PowerData) => {
        
        let plz = parseInt(row.PostCode);
        let id = municipalityPLZMap[plz];
        if (!id){
          i += 1;
        }else if (id.length === 1){
          let uid = id[0]
          let totalPower = parseFloat(row.TotalPower) || 0;
          let municipalityEntry = municipalityPower[uid];
          if (!municipalityEntry) {
            // Initialize the entry if it doesn't exist
            municipalityPower[uid] = {
            totalPower: totalPower,
            categories: {
              [mainCategoryDefinitions[row.MainCategory]!]: {
                [subCategoryDefinitions[row.SubCategory]!]: totalPower
                }
              }
            };
          } else {
            // Update the existing entry
            municipalityEntry.totalPower += totalPower;
            let categoryEntry = municipalityEntry.categories[mainCategoryDefinitions[row.MainCategory]!];
            if (!categoryEntry) {
              // Initialize the category entry if it doesn't exist
              municipalityEntry.categories[mainCategoryDefinitions[row.MainCategory]!] = {
                [subCategoryDefinitions[row.SubCategory]!]: totalPower
              };
            } else {
              // Update the existing category entry
              let subCategoryTotal = categoryEntry[subCategoryDefinitions[row.SubCategory]!] || 0;
              categoryEntry[subCategoryDefinitions[row.SubCategory]!] = subCategoryTotal + totalPower;
            }
          }
        }else{
          let totalPower = parseFloat(row.TotalPower) || 0;
          totalPower = totalPower / id.length;
          id.forEach(uid => {
            let municipalityEntry = municipalityPower[uid];
            if (!municipalityEntry) {
              // Initialize the entry if it doesn't exist
              municipalityPower[uid] = {
                totalPower: totalPower,
                categories: {
                  [mainCategoryDefinitions[row.MainCategory]!]: {
                    [subCategoryDefinitions[row.SubCategory]!]: totalPower
                  }
                }
              };
            } else {
              // Update the existing entry
              municipalityEntry.totalPower += totalPower;
              let categoryEntry = municipalityEntry.categories[mainCategoryDefinitions[row.MainCategory]!];
              if (!categoryEntry) {
                // Initialize the category entry if it doesn't exist
                municipalityEntry.categories[mainCategoryDefinitions[row.MainCategory]!] = {
                  [subCategoryDefinitions[row.SubCategory]!]: totalPower
                };
              } else {
                // Update the existing category entry
                let subCategoryTotal = categoryEntry[subCategoryDefinitions[row.SubCategory]!] || 0;
                categoryEntry[subCategoryDefinitions[row.SubCategory]!] = subCategoryTotal + totalPower;
              }
            }
          })
        }
      })
      .on('end', () => {
        // Compile the CSV output
        let output = 'ID,MainCategory,SubCategory,TotalPower\n';
        for (let id in municipalityPower) {
          let municipality = municipalityPower[id];
          for (let mainCategory in municipality!.categories) {
            for (let subCategory in municipality!.categories[mainCategory]) {
              let catTotalPower = municipality!.categories[mainCategory]![subCategory];
              output += `${id},${mainCategory},${subCategory},${catTotalPower!.toFixed(2)}\n`;
            }
          }
        }
        // Write the results to a CSV file
        fs.writeFileSync('src/server/data/municipalitiesPower.csv', output);
      console.log('Municipality CSV file processed => ' + i + " had no PLZ in mapping.");
    });
  });
  
  
