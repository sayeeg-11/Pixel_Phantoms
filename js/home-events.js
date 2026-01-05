document.addEventListener('DOMContentLoaded', function () {
  fetch('data/events.json')
    .then(response => response.json())
    .then(events => {
      if (!events || events.length === 0) return;

      const event = events[0]; // show first event on home page

      document.getElementById('home-event-title').textContent = event.title;
      document.getElementById('home-event-desc').textContent = event.description;
      document.getElementById('home-event-date').innerHTML =
        `<i class="far fa-calendar-alt"></i> ${event.date}`;
      document.getElementById('home-event-location').innerHTML =
        `<i class="fas fa-map-marker-alt"></i> ${event.location}`;
      document.getElementById('home-event-status').textContent = event.status;
    })
    .catch(error => {
      console.error('Error loading events:', error);
    });
});
