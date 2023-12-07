import * as fs from 'fs';
import csv from 'csv-parser';

interface PowerData {
  Municipality: string;
  PostCode: string;
  MainCategory: string;
  SubCategory: string;
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
    categories: {
      [mainCategory: string]: {
        [subCategory: string]: number;
      };
    };
  };
} = {};

let municipalityIDPLZMap: {
  [PLZ: string]: {
    id: string;
    name: string;
  };
} = {};

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




// Manually defined category mappings (same as before)

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
        let postCode = row.PostCode;
        let municipalityInfo = municipalityIDPLZMap[postCode];
        if (municipalityInfo) {
          let totalPower = parseFloat(row.TotalPower) || 0;
          let municipalityEntry = municipalityPower[municipalityInfo.id];

          if (!municipalityEntry) {
            // Initialize the entry if it doesn't exist
            municipalityPower[municipalityInfo.id] = {
              totalPower: totalPower,
              name: municipalityInfo.name,
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
        }
      })
      .on('end', () => {
        // Compile the CSV output
        let output = 'ID,Municipality,MainCategory,SubCategory,TotalPower\n';
        for (let id in municipalityPower) {
          let municipality = municipalityPower[id];
          for (let mainCategory in municipality!.categories) {
            for (let subCategory in municipality!.categories[mainCategory]) {
              let catTotalPower = municipality!.categories[mainCategory]![subCategory];
              output += `${id},${municipality!.name},${mainCategory},${subCategory},${catTotalPower!.toFixed(2)}\n`;
            }
          }
        }
        // Write the results to a CSV file
        fs.writeFileSync('src/server/data/municipalitiesTotalPower.csv', output);
        console.log('Municipality CSV file successfully processed');
      });
  });
