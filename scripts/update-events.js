const fs = require('fs');
const path = require('path');

// URL from your js/events.js
const API_URL = "https://script.google.com/macros/s/AKfycbza1-ZyT4B8hU3h87Agc_jkPQ8dAjQBJkXkvxYfQ4SNAUENQtlXmYzdXgkC_Kj_zt-B/exec";
const TARGET_FILE = path.join(__dirname, '../data/events.json');

async function syncEvents() {
    try {
        console.log("Fetching data from Google Sheet...");
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cloudData = await response.json();

        // 1. Filter for 'Approved' events only (matching logic in js/events.js)
        if (!Array.isArray(cloudData)) {
            throw new Error("Invalid API response format");
        }

        const validEvents = cloudData
            .filter(e => e.status && e.status.toString().toLowerCase().trim() === "approved")
            .map(e => ({
                // Map fields to match the structure in data/events.json
                title: e.title || "Untitled Event",
                date: e.date || "TBD",
                location: e.location || "TBD",
                description: e.description || "",
                link: e.link || "#"
            }));

        // 2. Sort by Date
        validEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Write to events.json (This handles both Updates and Deletions automatically)
        // By overwriting the file with the fresh fetch, any event deleted from the Sheet 
        // will naturally disappear from this list.
        fs.writeFileSync(TARGET_FILE, JSON.stringify(validEvents, null, 4));
        
        console.log(`✅ Successfully synced ${validEvents.length} events to data/events.json`);

    } catch (error) {
        console.error("❌ Sync failed:", error.message);
        process.exit(1); // Exit with error code to fail the workflow
    }
}

syncEvents();