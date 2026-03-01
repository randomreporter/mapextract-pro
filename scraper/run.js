const { scrapeMaps } = require('./mapScraper');
const { exportExcel, exportCSV } = require('./exporter');

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node run.js "<keyword>" "<location>" [--max <number>] [--visible]');
        process.exit(1);
    }

    const keyword = args[0];
    const location = args[1];
    let maxResults = 10;
    let visible = false;

    for (let i = 2; i < args.length; i++) {
        if (args[i] === '--max' && args[i + 1]) {
            maxResults = parseInt(args[i + 1], 10);
            i++;
        }
        if (args[i] === '--visible') {
            visible = true;
        }
    }

    console.log(`Starting scrape for "${keyword} ${location}" (Max: ${maxResults})`);

    const startTime = Date.now();
    const results = await scrapeMaps({ keyword, location, maxResults, visible });

    console.log(`\nFinished in ${(Date.now() - startTime) / 1000}s. Found ${results.length} results.`);

    if (results.length > 0) {
        const filename = `${keyword.replace(/\W+/g, '_')}_${location.replace(/\W+/g, '_')}_${Date.now()}`;
        const excelPath = await exportExcel(results, filename);
        console.log(`Exported Excel to: ${excelPath}`);
    } else {
        console.log('No results found. Export skipped.');
    }
}

main();
