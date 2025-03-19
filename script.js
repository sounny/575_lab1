// Initialize the map
var map = L.map('map').setView([20, 0], 2); // Centered globally

// Add a tile layer (basemap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON data
fetch('data.geojson')
    .then(response => response.json())
    .then(data => {
        processGeoJSON(data);
    })
    .catch(error => console.error('Error loading GeoJSON data:', error));

// Function to process and display GeoJSON data
var cityLayer;
function processGeoJSON(data) {
    cityLayer = L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.populations[String(currentYear)]), 
                fillColor: "blue",
                color: "#000",
                weight: 1,
                fillOpacity: 0.7
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`<b>${feature.properties.city}, ${feature.properties.country}</b><br>
                             Population (${currentYear}): ${feature.properties.populations[currentYear].toLocaleString()}`);
        }
    }).addTo(map);
}

// Function to calculate proportional symbol radius
function getRadius(population) {
    return Math.sqrt(population) / 500; // Scale factor for better visibility
}

// Handle time slider interaction
var currentYear = 1970;
var slider = document.getElementById("time-slider");
var yearLabel = document.getElementById("year-label");

slider.addEventListener("input", function() {
    currentYear = parseInt(this.value);
    yearLabel.textContent = currentYear;
    updateMap();
});

// Function to update map when slider changes
function updateMap() {
    if (cityLayer) {
        map.removeLayer(cityLayer);
    }

    fetch('data.geojson')
        .then(response => response.json())
        .then(data => {
            cityLayer = L.geoJSON(data, {
                pointToLayer: function(feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: getRadius(feature.properties.populations[String(currentYear)]),
                        fillColor: "blue",
                        color: "#000",
                        weight: 1,
                        fillOpacity: 0.7
                    });
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(`<b>${feature.properties.city}, ${feature.properties.country}</b><br>
                                     Population (${currentYear}): ${feature.properties.populations[String(currentYear)].toLocaleString()}`);
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error updating map:', error));
}

