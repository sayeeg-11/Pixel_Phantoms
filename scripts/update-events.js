import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we have a `fetch` implementation available in older Node versions.
// In Node 18+ `global.fetch` exists; otherwise dynamically import `node-fetch`.
let fetchFunc;
if (typeof fetch === 'function') {
    fetchFunc = fetch;
} else {
    fetchFunc = (...args) => import('node-fetch').then(mod => mod.default(...args));
}

// URL from your js/events.js
const API_URL = "https://script.google.com/macros/s/AKfycbza1-ZyT4B8hU3h87Agc_jkPQ8dAjQBJkXkvxYfQ4SNAUENQtlXmYzdXgkC_Kj_zt-B/exec";
const TARGET_FILE = path.join(__dirname, '../data/events.json');

async function syncEvents() {
    try {
        console.log("Fetching data from Google Sheet...");
        const response = await fetchFunc(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cloudData = await response.json();

        if (!Array.isArray(cloudData)) {
            throw new Error("Invalid API response format");
        }

        // 1. Filter for 'Approved' events
        const validEvents = cloudData
            .filter(e => e.status && e.status.toString().toLowerCase().trim() === "approved")
            .map(e => ({
                // Map fields to match data/events.json schema
                title: e.title || "Untitled Event",
                description: e.description || "",
                date: e.date || "TBD",
                // Calculate a countdown date or default to date
                countdownDate: e.date ? new Date(e.date).toISOString() : null,
                location: e.location || "TBD",
                status: "UPCOMING", // Default status for approved events
                registrationOpen: true, // Default to true if approved
                registrationLink: e.link || "" // Map 'link' from Sheet to 'registrationLink'
            }));

        // 2. Sort by Date
        validEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Write to events.json
        fs.writeFileSync(TARGET_FILE, JSON.stringify(validEvents, null, 4));
        
        console.log(`✅ Successfully synced ${validEvents.length} events to data/events.json`);

    } catch (error) {
        console.error("❌ Sync failed:", error.message);
        process.exit(1);
    }
}

syncEvents();
