const API_URL = "https://script.google.com/macros/s/AKfycbza1-ZyT4B8hU3h87Agc_jkPQ8dAjQBJkXkvxYfQ4SNAUENQtlXmYzdXgkC_Kj_zt-B/exec"; 
const LOCAL_JSON_PATH = "data/events.json";

let allEvents = [];
const EVENTS_PER_PAGE = 6; 
let countdownInterval = null; 

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    initOrganizeForm();
});

// 1. LOAD EVENTS (MERGE: Local + Google Sheet)
async function loadEvents() {
    const container = document.getElementById("events-container");
    container.innerHTML = `<p class="loading-msg">Syncing events...</p>`;

    let mergedEvents = [];

    // STEP A: Fetch Local JSON (Base Content)
    try {
        const localRes = await fetch(LOCAL_JSON_PATH);
        if (localRes.ok) {
            const localData = await localRes.json();
            mergedEvents = [...localData];
            console.log("✅ Local events loaded");
        }
    } catch (e) {
        console.warn("Local data fetch failed");
    }

    // STEP B: Fetch Google Sheet API (Live Content)
    try {
        if (API_URL) {
            console.log("Fetching Google Sheet data...");
            const apiRes = await fetch(API_URL);
            
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                
                if (Array.isArray(apiData)) {
                    // Filter: Only Approved
                    const validApiEvents = apiData.filter(e => 
                        e.status && e.status.toString().toLowerCase().trim() === "approved"
                    );
                    
                    mergedEvents = [...mergedEvents, ...validApiEvents];
                    console.log(`✅ Google Sheet: Added ${validApiEvents.length} events`);
                } else {
                    console.error("Google Sheet API Error:", apiData);
                }
            }
        }
    } catch (e) {
        console.warn("⚠️ Google Sheet API unreachable (using local only)");
    }

    // STEP C: Deduplicate & Sort
    const uniqueMap = new Map();
    // Use `event.title.trim().toLowerCase()` for case-insensitive deduplication
    mergedEvents.forEach(e => uniqueMap.set(e.title.trim().toLowerCase(), e));
    allEvents = Array.from(uniqueMap.values());

    } catch (error) {
        container.innerHTML = `<p class="error-msg">Unable to load events 😢</p>`;
    }
}

function renderPage(page) {
    const container = document.getElementById("events-container");
    container.innerHTML = "";
    
    const start = (page - 1) * EVENTS_PER_PAGE;
    const end = start + EVENTS_PER_PAGE;
    const eventsToShow = allEvents.slice(start, end);

    if (eventsToShow.length === 0) {
        container.innerHTML = `<div style="text-align:center; grid-column:1/-1;">No upcoming events found.</div>`;
        return;
    }

    // Determine "Featured/Live" event for highlighting
    const now = new Date();
    const nextEvent = allEvents.find(e => {
        const d = new Date(e.date);
        if (isNaN(d.getTime())) return false; 
        
        d.setHours(23, 59, 59); // Consider event active until end of day
        return d > now;
    });

    eventsToShow.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("event-card");
        
        // Highlight logic
        if (nextEvent && event.title === nextEvent.title) {
            card.style.borderColor = "var(--accent-color)";
            card.style.boxShadow = "0 0 15px rgba(0, 170, 255, 0.15)";
        }

        let dateStr = event.date;
        try {
            const d = new Date(event.date);
            if(!isNaN(d.getTime())) dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
        } catch(e){}

        card.innerHTML = `
            ${(nextEvent && event.title === nextEvent.title) ? '<div style="color:var(--accent-color); font-weight:bold; font-size:0.8rem; margin-bottom:8px; text-transform:uppercase;">🔥 Featured</div>' : ''}
            <h2>${event.title}</h2>
            <p class="event-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</p>
            <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location || 'TBD'}</p>
            <p class="event-description">${event.description || 'No details available.'}</p>
            <a href="${event.link || '#'}" class="btn-event" target="_blank">View Details</a>
        `;
        container.appendChild(card);
    });

    renderPaginationControls(page);
}

function renderPaginationControls(page) {
    const container = document.getElementById('pagination-controls');
    if(!container) return;
    
    const totalPages = Math.ceil(allEvents.length / EVENTS_PER_PAGE);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <button class="pagination-btn" ${page === 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
            <i class="fas fa-chevron-left"></i> Prev
        </button>
        <span class="page-info">Page ${page} of ${totalPages}</span>
        <button class="pagination-btn" ${page === totalPages ? 'disabled' : ''} onclick="changePage(${page + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

window.changePage = function(newPage) {
    renderPage(newPage);
    document.querySelector('.events-container').scrollIntoView({ behavior: 'smooth' });
};

// 2. COUNTDOWN LOGIC (Includes Live Status)
function setupCountdown(events) {
    const now = new Date();
    
    // Clear any existing timer to prevent duplicates
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // Filter to find the current active or next upcoming event
    const activeOrUpcoming = events.find(e => {
        const eventEnd = new Date(e.date);
        if (isNaN(eventEnd.getTime())) return false;

        // Set end time to midnight of the NEXT day to ensure a full 24-hour live window
        eventEnd.setDate(eventEnd.getDate() + 1); 
        eventEnd.setHours(0, 0, 0, 0); 

        return eventEnd > now;
    });

    const section = document.getElementById('countdown-section');

    if (activeOrUpcoming) {
        initCountdownTimer(activeOrUpcoming);
    } else {
        if (section) section.classList.add('countdown-hidden');
    }
}

function initCountdownTimer(event) {
    const section = document.getElementById('countdown-section');
    if(!section) return;

    section.classList.remove('countdown-hidden');
    
    renderStandardTimer(event);

    const targetDate = new Date(event.date).getTime(); 
    const oneDay = 24 * 60 * 60 * 1000;
    const liveEndWindow = targetDate + oneDay;

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // --- LIVE STATE HANDLING (Event started, but less than 24 hours ago) ---
        if (distance < 0 && now < liveEndWindow) {
            
            // RENDER LIVE UI
            section.innerHTML = `
                <div style="text-align:center; padding:10px; animation: fadeIn 0.5s;">
                    <h2 style="color:#ff0055; margin-bottom:10px; font-size:2rem; text-shadow:0 0 15px rgba(255,0,85,0.4);">
                        <i class="fas fa-satellite-dish"></i> LIVE NOW
                    </h2>
                    <h3 style="margin-bottom:10px;">${event.title}</h3>
                    <p style="color:var(--text-secondary);">Stream is currently active. Join us!</p>
                    <a href="${event.link}" target="_blank" class="btn-event" style="background:#ff0055; border-color:#ff0055; color:white; margin-top:15px; display:inline-block;">
                        Join Event
                    </a>
                </div>
            `;
            return;
        } 
        
        // --- ENDED STATE HANDLING ---
        if (distance < 0 && now >= liveEndWindow) {
            section.innerHTML = `<h3>${event.title} has ended.</h3>`;
            clearInterval(countdownInterval);
            countdownInterval = null;
            return;
        }

        // --- STANDARD COUNTDOWN ---
        const dEl = document.getElementById("days");
        if (!dEl) { 
             renderStandardTimer(event); 
        } 

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = String(days).padStart(2, '0');
        document.getElementById("hours").innerText = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerText = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerText = String(seconds).padStart(2, '0');
    };

    countdownInterval = setInterval(updateTimer, 1000);
    updateTimer(); 
}

function renderStandardTimer(event) {
    const section = document.getElementById('countdown-section');
    if (section) {
        section.innerHTML = `
            <h3>Next Big Event Starts In:</h3>
            <div id="countdown-timer">
                <div class="time-unit"><span id="days">00</span><label>Days</label></div>
                <div class="time-unit"><span id="hours">00</span><label>Hours</label></div>
                <div class="time-unit"><span id="minutes">00</span><label>Mins</label></div>
                <div class="time-unit"><span id="seconds">00</span><label>Secs</label></div>
            </div>
            <p id="next-event-name" class="highlight-event">Counting down to: <span style="color:var(--accent-color)">${event.title}</span></p>
        `;
    }
}

// 3. ORGANIZE FORM LOGIC
function initOrganizeForm() {
    const form = document.getElementById('organize-form');
    const feedback = document.getElementById('organize-feedback');
    
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.innerText;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
            feedback.textContent = "";
            feedback.className = "feedback-message";

            const formData = {
                title: document.getElementById('event-title').value,
                type: document.getElementById('event-type').value,
                date: document.getElementById('event-date').value,
                description: document.getElementById('event-desc').value,
                location: "TBD",
                link: "#",
                status: "Pending"
            };

            try {
                await fetch(API_URL, {
                    method: "POST",
                    mode: "no-cors", 
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(formData)
                });

                feedback.innerHTML = '<i class="fas fa-check-circle"></i> Proposal sent successfully!';
                feedback.className = "feedback-message success";
                form.reset();

            } catch (error) {
                console.error("Submission failed:", error);
                feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to connect.';
                feedback.className = "feedback-message error";
            } finally {
                btn.disabled = false;
                btn.innerText = originalText;
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    setTimeout(() => { 
                        feedback.textContent = ""; 
                        feedback.className = "feedback-message";
                        feedback.style.opacity = '1';
                    }, 500);
                }, 5000);
            }
        });
    }
}