const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Path to events.json
const eventsFilePath = path.join(__dirname, 'data', 'events.json');

// Helper function to read events
function readEvents() {
  try {
    const data = fs.readFileSync(eventsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading events.json:', error);
    return [];
  }
}

// Helper function to write events
function writeEvents(events) {
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
  } catch (error) {
    console.error('Error writing to events.json:', error);
  }
}

// GET /events - Serve events
app.get('/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

// POST /events - Add new event
app.post('/events', (req, res) => {
  const { title, type, date, description } = req.body;

  // Basic validation
  if (!title || !type || !date || !description) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const events = readEvents();

  // Create new event object
  const newEvent = {
    id: Date.now(), // Simple ID generation
    title,
    type,
    date,
    description,
    location: 'TBD', // Default location
    link: '#' // Default link
  };

  events.push(newEvent);
  writeEvents(events);

  res.status(201).json({ message: 'Event submitted successfully', event: newEvent });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
