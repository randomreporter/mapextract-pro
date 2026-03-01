const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs');
chromium.use(stealth);

const sleep = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));

async function scrapeMaps({ keyword, location, maxResults = 10, proxyUrl, visible = false }) {
    const query = `${keyword} ${location}`;
    const launchArgs = {
        headless: !visible,
        args: ['--disable-blink-features=AutomationControlled']
    };
    if (proxyUrl) {
        launchArgs.proxy = { server: proxyUrl };
    }

    const browser = await chromium.launch(launchArgs);
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    // Anti-detection init scripts
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    });

    const page = await context.newPage();
    const results = [];

    try {
        console.log("Navigating to Google Maps...");
        await page.goto('https://maps.google.com', { waitUntil: 'load', timeout: 30000 });
        console.log("Navigation complete. Taking initial screenshot.");
        await page.screenshot({ path: 'debug_initial.png' });

        // Try to handle consent popup if it exists
        try {
            const consentButton = await page.$('button:has-text("Accept all"), button:has-text("I agree")');
            if (consentButton && await consentButton.isVisible()) {
                await consentButton.click();
                await sleep(1000, 2000);
            }
        } catch (e) {
            // Ignore if no consent popup
        }

        try {
            console.log("Looking for search box...");
            const inputLocator = page.locator('#searchboxinput, input[name="q"], input[aria-label="Search Google Maps"]');
            await inputLocator.first().waitFor({ state: 'visible', timeout: 15000 });
            await inputLocator.first().click();
            await sleep(500, 1000);
            await inputLocator.first().pressSequentially(query, { delay: 80 });
            await page.keyboard.press('Enter');
            console.log("Entered query and searching...");
        } catch (e) {
            console.log("Failed to enter query. Saving error screenshot and DOM.");
            await page.screenshot({ path: 'debug_searchbox_error.png' });
            throw e;
        }

        await sleep(4000, 5000);
        await page.screenshot({ path: 'debug_after_search.png' });

        const feedSelector = '[role="feed"]';
        try {
            await page.waitForSelector(feedSelector, { timeout: 15000 });
            console.log("Feed found.");
        } catch (e) {
            console.log("Feed not found, query might have gone to a single result or no results.");
            await page.screenshot({ path: 'debug_feed_error.png' });
            fs.writeFileSync('debug_dom.html', await page.content());
        }

        let attempts = 0;
        let previousHeight = 0;

        // Scroll feed to load listings
        while (results.length < maxResults && attempts < (maxResults * 2)) {
            const feedHandle = await page.$(feedSelector);
            if (!feedHandle) break; // Might be a single place page

            // Get all listing cards currently loaded
            const listings = await page.$$('a[href*="/maps/place/"]');

            for (let i = results.length; i < listings.length && results.length < maxResults; i++) {
                const listing = listings[i];
                await listing.scrollIntoViewIfNeeded();
                await listing.click();
                await sleep(1800, 3200); // Random wait after click

                // Extract data
                const url = page.url();

                let lat = null, lng = null;
                const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                    lat = parseFloat(match[1]);
                    lng = parseFloat(match[2]);
                }

                const data = {
                    name: await extractText(page, 'h1.DUwDvf'),
                    address: await extractText(page, 'button[data-item-id="address"]'),
                    phone: await extractText(page, 'button[data-item-id*="phone"]'),
                    website: await extractAttribute(page, 'a[data-item-id="authority"]', 'href'),
                    mapsUrl: url,
                    category: await extractText(page, 'button[jsaction*="category"]'),
                    rating: await extractText(page, 'span[aria-hidden].ceNzKf'),
                    reviewCount: await extractText(page, 'span[aria-label*="review"]'),
                    hours: await extractAttribute(page, '[aria-label*="Hours"]', 'aria-label'),
                    latitude: lat,
                    longitude: lng
                };

                // Clean up data
                if (data.website && data.website.includes('/url?q=')) {
                    data.website = decodeURIComponent(data.website.split('/url?q=')[1].split('&')[0]);
                }
                if (data.rating) data.rating = parseFloat(data.rating);
                if (data.reviewCount) data.reviewCount = parseInt(data.reviewCount.replace(/,/g, '').replace(/\D/g, ''));
                if (data.hours) {
                    // It usually looks like "Hours: 9 AM to 5 PM" or similar
                    // Removing the "Hide open hours for the week" part
                    data.hours = data.hours.replace('Hide open hours for the week', '').trim();
                }

                results.push(data);
                if (visible) console.log(`[${results.length}/${maxResults}] Extracted: ${data.name}`);

                // Go back if we are on a detail page and want more results from the feed list
                // Since the detail pane takes over, clicking 'back to results' is safer or just use the browser back, but actually Playwright just opens the side panel. 
                // We don't always need to go back, clicking another listing will just update the panel.
            }

            if (results.length >= maxResults) break;

            // Scroll down to load more
            await page.evaluate(`document.querySelector('${feedSelector}').scrollTop = document.querySelector('${feedSelector}').scrollHeight`);
            await sleep(2000, 3000);

            currentHeight = await page.evaluate(`document.querySelector('${feedSelector}').scrollHeight`);
            if (currentHeight === previousHeight) attempts++; // Try a few times if height doesn't change
            else attempts = 0;
            previousHeight = currentHeight;
        }
    } catch (error) {
        console.error("Scraping error:", error);
    } finally {
        await browser.close();
    }

    return results;
}

async function extractText(page, selector) {
    try {
        const el = await page.$(selector);
        if (el) {
            return (await el.innerText()).trim();
        }
    } catch (e) { }
    return null;
}

async function extractAttribute(page, selector, attr) {
    try {
        const el = await page.$(selector);
        if (el) {
            return (await el.getAttribute(attr))?.trim();
        }
    } catch (e) { }
    return null;
}

module.exports = { scrapeMaps };
