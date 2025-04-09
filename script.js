// Initialize the map
var map = L.map('map').setView([20, 0], 2); // Centered globally

// Add a tile layer (basemap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define variables
var cityLayer;
var currentYear = 1970;
var slider = document.getElementById("time-slider");
var yearLabel = document.getElementById("year-label");

// Function to calculate proportional symbol radius
// Population is used as input to create a scaled circle size
function getRadius(population) {
    return Math.sqrt(population) / 500; // Scale factor for better visibility
}

// Create a legend control to display circle size meanings
function createLegend() {
    // Create a Leaflet control for the legend
    var legend = L.control({position: 'bottomright'});
    
    // Add HTML content when the legend is added to the map
    legend.onAdd = function (map) {
        // Create a div with a 'legend' class
        var div = L.DomUtil.create('div', 'legend');
        
        // Define population values for the legend (in millions)
        var populationValues = [1000000, 5000000, 10000000, 20000000];
        
        // Add a title to the legend
        div.innerHTML = '<h4>Population (millions)</h4>';
        
        // Loop through population values to create legend items
        populationValues.forEach(function(value) {
            var radius = getRadius(value);
            div.innerHTML +=
                '<i style="background: blue; width: ' + (radius * 2) + 'px; height: ' + (radius * 2) + 'px; border-radius: 50%; display: inline-block;"></i> ' +
                (value / 1000000) + 'M<br>';
        });
        
        return div;
    };
    
    // Add the legend to the map
    legend.addTo(map);
}

// Function to update map when slider changes
function updateMap() {
    if (cityLayer) {
        map.removeLayer(cityLayer);
    }

    fetch('data.geojson')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
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

// Handle time slider interaction
slider.addEventListener("input", function() {
    currentYear = parseInt(this.value);
    yearLabel.textContent = currentYear;
    updateMap();
});

// Function to set up timeline controls with navigation arrows
function setupTimelineControls() {
    // Get the slider container
    const sliderContainer = document.getElementById('slider-container');
    
    // Create left arrow element
    const leftArrow = document.createElement('button');
    leftArrow.innerHTML = '◀';
    leftArrow.className = 'timeline-arrow';
    leftArrow.id = 'prev-year';
    leftArrow.title = 'Previous decade';
    
    // Create right arrow element
    const rightArrow = document.createElement('button');
    rightArrow.innerHTML = '▶';
    rightArrow.className = 'timeline-arrow';
    rightArrow.id = 'next-year';
    rightArrow.title = 'Next decade';
    
    // Insert arrows into the slider container
    sliderContainer.insertBefore(leftArrow, slider);
    sliderContainer.appendChild(rightArrow);
    
    // Add click handlers to arrows
    leftArrow.addEventListener('click', function() {
        // Decrease year by one decade (respecting minimum value)
        let newYear = Math.max(parseInt(slider.min), currentYear - 10);
        if (newYear !== currentYear) {
            currentYear = newYear;
            slider.value = currentYear;
            yearLabel.textContent = currentYear;
            updateMap();
        }
    });
    
    rightArrow.addEventListener('click', function() {
        // Increase year by one decade (respecting maximum value)
        let newYear = Math.min(parseInt(slider.max), currentYear + 10);
        if (newYear !== currentYear) {
            currentYear = newYear;
            slider.value = currentYear;
            yearLabel.textContent = currentYear;
            updateMap();
        }
    });
    
    // Add CSS styles for the timeline controls
    const style = document.createElement('style');
    style.textContent = `
        #slider-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 15px auto;
            width: 80%;
            max-width: 600px;
        }
        
        .timeline-arrow {
            background: #3388ff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin: 0 10px;
            padding: 0;
            transition: background-color 0.2s ease;
        }
        
        .timeline-arrow:hover {
            background: #0056b3;
        }
        
        #time-slider {
            flex-grow: 1;
            margin: 0 10px;
        }
        
        #year-label {
            font-weight: bold;
            margin-left: 10px;
            min-width: 50px;
        }
    `;
    document.head.appendChild(style);
}

// When the DOM content is fully loaded, initialize the map and timeline controls
document.addEventListener('DOMContentLoaded', function() {
    // Set up the slider container with navigation arrows
    setupTimelineControls();
    
    // Load initial map data for starting year (1970)
    updateMap();
    
    // Create and add the population legend to the map
    createLegend();
});

