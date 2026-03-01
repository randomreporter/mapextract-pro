const ExcelJS = require('exceljs');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function exportExcel(data, filename) {
    const filePath = path.join(OUTPUT_DIR, `${filename}.xlsx`);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    const columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Phone', key: 'phone', width: 20 },
        { header: 'Website', key: 'website', width: 30 },
        { header: 'Maps URL', key: 'mapsUrl', width: 40 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Reviews', key: 'reviewCount', width: 10 },
        { header: 'Hours', key: 'hours', width: 30 },
        { header: 'Latitude', key: 'latitude', width: 15 },
        { header: 'Longitude', key: 'longitude', width: 15 }
    ];

    worksheet.columns = columns;

    data.forEach(item => {
        const row = worksheet.addRow(item);
        if (item.website) {
            row.getCell('website').value = { text: item.website, hyperlink: item.website };
        }
        if (item.mapsUrl) {
            row.getCell('mapsUrl').value = { text: 'View on Maps', hyperlink: item.mapsUrl };
        }
    });

    worksheet.getRow(1).font = { bold: true };
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

async function exportCSV(data, filename) {
    const filePath = path.join(OUTPUT_DIR, `${filename}.csv`);
    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'name', title: 'Name' },
            { id: 'address', title: 'Address' },
            { id: 'phone', title: 'Phone' },
            { id: 'website', title: 'Website' },
            { id: 'mapsUrl', title: 'Maps URL' },
            { id: 'category', title: 'Category' },
            { id: 'rating', title: 'Rating' },
            { id: 'reviewCount', title: 'Reviews' },
            { id: 'hours', title: 'Hours' },
            { id: 'latitude', title: 'Latitude' },
            { id: 'longitude', title: 'Longitude' }
        ]
    });

    await csvWriter.writeRecords(data);
    return filePath;
}

module.exports = { exportExcel, exportCSV };
