document.addEventListener('DOMContentLoaded', () => {
    const findLocationButton = document.getElementById('findLocation');
    const locationInput = document.getElementById('location');
    const complaintForm = document.getElementById('complaintForm');
    let map = L.map('map').setView([51.505, -0.09], 13);
    let marker;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    findLocationButton.addEventListener('click', () => {
        const location = locationInput.value;
        if (location) {
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const { lat, lon } = data[0];
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        marker = L.marker([lat, lon]).addTo(map)
                            .bindPopup(`<b>${location}</b>`)
                            .openPopup();
                        map.setView([lat, lon], 13);
                    } else {
                        alert('Location not found. Please enter a valid location.');
                    }
                })
                .catch(error => {
                    console.error('Error fetching location:', error);
                    alert('Error fetching location. Please try again.');
                });
        } else {
            alert('Please enter a location.');
        }
    });

    complaintForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const location = locationInput.value;
        const photo = document.getElementById('photo').value;

        fetch('/submit-complaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category, description, location, photo }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert('Complaint submitted successfully!');
            complaintForm.reset();
            if (marker) {
                map.removeLayer(marker);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting complaint');
        });
    });
});
