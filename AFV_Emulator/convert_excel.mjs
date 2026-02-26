import fs from 'fs';
import xlsx from 'xlsx';

function convertExcelToJson(excelPath, jsonPath) {
    try {
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(`Converted ${excelPath} to ${jsonPath}, wrote ${data.length} records.`);
        return data;
    } catch (err) {
        console.error(`Error converting ${excelPath}:`, err.message);
    }
}

// Articulos
const articulosData = convertExcelToJson('c:/Users/arivera/Documents/InduccionDinamica/articulos.xlsx', 'src/data/productos.json');

// Clientes
const clientesData = convertExcelToJson('c:/Users/arivera/Documents/InduccionDinamica/clientes.xlsx', 'src/data/clientes.json');

// Make a list of unique brands (Marcas) from articulos if it has a 'marca' column.
if (articulosData && articulosData.length > 0) {
    const sample = articulosData[0];
    const keys = Object.keys(sample);
    console.log("Articulos columns:", keys);
    const brandCol = keys.find(k => k.toLowerCase().includes('marca') || k.toLowerCase().includes('linea') || k.toLowerCase().includes('brand'));
    if (brandCol) {
        const marcasSet = new Set(articulosData.map(a => a[brandCol]).filter(Boolean));
        const marcasData = Array.from(marcasSet).map(m => ({ id: m, nombre: m }));
        fs.writeFileSync('src/data/marcas.json', JSON.stringify(marcasData, null, 2));
        console.log(`Generated src/data/marcas.json with ${marcasData.length} brands (used column ${brandCol}).`);
    } else {
        // default mock if no column found
        fs.writeFileSync('src/data/marcas.json', JSON.stringify([{ id: 'BOSCH', nombre: 'BOSCH' }, { id: 'GATES', nombre: 'GATES' }], null, 2));
        console.log('No brand column found, using mock marcas.');
    }
}
