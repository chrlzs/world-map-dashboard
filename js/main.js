import { countries } from "../data/country-data.js";

document.addEventListener("DOMContentLoaded", function () {
  let isMultiSelectMode = false;

  // Add event listeners for Shift key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Shift') {
      isMultiSelectMode = true;
      document.body.classList.add('multi-select-mode');
    }
  });

  document.addEventListener('keyup', function (e) {
    if (e.key === 'Shift') {
      isMultiSelectMode = false;
      document.body.classList.remove('multi-select-mode');
    }
  });

  const themeSwitcher = document.createElement("div");
  themeSwitcher.style.position = "absolute";
  themeSwitcher.style.top = "10px";
  themeSwitcher.style.right = "10px";
  themeSwitcher.style.zIndex = "1000";
  themeSwitcher.id = "map-options";
  themeSwitcher.innerHTML = `
        <button onclick="switchTheme('dracula')">Dracula</button>
        <button onclick="switchTheme('light')">Light</button>
        <button onclick="switchTheme('ocean')">Ocean</button>
        <button onclick="switchTheme('crt')">CRT</button>
    `;
  document.body.appendChild(themeSwitcher);

  function switchTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Initialize with the default theme
  switchTheme("crt");

  const mapContainer = document.getElementById("map");
  mapContainer.style.width = "100vw";
  mapContainer.style.height = "100vh";

  //const map = L.map("map").setView([0, 0], 2);
  //const map = L.map("map", { zoomControl: false }).fitWorld();
  const map = L.map("map", { zoomControl: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors!",
  }).addTo(map);

  const canvas = document.createElement("canvas");
  canvas.id = "pixel-canvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "1000"; // Ensure the canvas is on top
  document.getElementById("map").appendChild(canvas);

  const windows = document.querySelectorAll(".window");

  const windowSpacing = 30; // Adjust spacing between windows
  let startX = 50; // Initial X position
  let startY = 50; // Initial Y position


  windows.forEach((window, index) => {
    const header = window.querySelector(".window-header");
    let isDragging = false;
    let offsetX, offsetY;
    window.style.left = `${startX + (index * windowSpacing * 2)}px`;
    window.style.top = `${startY + (index * windowSpacing)}px`;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - window.offsetLeft;
      offsetY = e.clientY - window.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        window.style.left = `${e.clientX - offsetX}px`;
        window.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Close button functionality
    const closeBtn = window.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => {
      window.style.display = "none";
    });
    // Ensure windows stay within viewport bounds
    const rect = window.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      window.style.left = `${window.innerWidth - rect.width - 20}px`;
    }
    if (rect.bottom > window.innerHeight) {
      window.style.top = `${window.innerHeight - rect.height - 20}px`;
    }
  });

  function drawPixelGrid() {
    const ctx = canvas.getContext("2d");
    canvas.width = map.getSize().x;
    canvas.height = map.getSize().y;

    const pixelSize = 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";

    for (let x = 0; x < canvas.width; x += pixelSize) {
      for (let y = 0; y < canvas.height; y += pixelSize) {
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  }

  function animateRadarEffect() {
    const ctx = canvas.getContext("2d");
    const pixelSize = 10;
    const width = canvas.width;
    const height = canvas.height;
    const totalColumns = Math.ceil(width / pixelSize);

    function animateColumn(column) {
      ctx.clearRect(0, 0, width, height);
      drawPixelGrid();

      ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Semi-transparent green
      for (let y = 0; y < height; y += pixelSize) {
        ctx.fillRect(column * pixelSize, y, pixelSize, pixelSize);
      }

      column = (column + 1) % totalColumns;
      requestAnimationFrame(() => animateColumn(column));
    }

    animateColumn(0);
  }

  // === Geographic Grid Overlay ===
  const GRID_SIZE_DEGREES = 10; // 10° x 10° grid
  let gridLayer = null;

  function createGridLayer() {
    const group = L.layerGroup();
    const bounds = [[-90, -180], [90, 180]]; // World extent
    for (let lat = -90; lat < 90; lat += GRID_SIZE_DEGREES) {
      for (let lng = -180; lng < 180; lng += GRID_SIZE_DEGREES) {
        const cellBounds = [
          [lat, lng],
          [lat + GRID_SIZE_DEGREES, lng + GRID_SIZE_DEGREES],
        ];
        const cellId = `G[${(lat + 90) / GRID_SIZE_DEGREES + 1},${(lng + 180) / GRID_SIZE_DEGREES + 1}]`;
        const rect = L.rectangle(cellBounds, {
          color: '#ff9800',
          weight: 1,
          fillOpacity: 0.05,
          className: 'geo-grid-cell',
        });

        rect.bindTooltip(cellId, { permanent: true, direction: 'center', className: 'geo-grid-label' });

        // Add hover effects
        rect.on('mouseover', function () {
          if (!rect._selected) {
            this.setStyle({ fillOpacity: 0.2, weight: 2 });
          }
        });

        rect.on('mouseout', function () {
          if (!rect._selected) {
            this.setStyle({ fillOpacity: 0.05, weight: 1 });
          }
        });

        rect.on('click', function (e) {
          // Reset all grid cells
          group.eachLayer(function (layer) {
            if (layer !== rect) {
              layer._selected = false;
              layer.setStyle({ fillOpacity: 0.05, weight: 1 });
            }
          });

          // Mark this cell as selected
          rect._selected = true;
          rect.setStyle({ fillOpacity: 0.3, weight: 3, color: '#f44336' });

          window.lastClickedGridId = cellId;
          highlightCountriesInCell(cellBounds);
          addLogEntry(`Grid cell ${cellId} selected`, 'info');

          // Use point-in-polygon to find the actual country under the click
          if (window.geoJsonLayer) {
            const latlng = e.latlng;
            let found = false;
            window.geoJsonLayer.eachLayer(function (layer) {
              if (found) return;
              if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
                // Use Leaflet's built-in method to check if the point is inside the polygon
                if (layer.getLatLngs && L.Polygon.prototype._containsPoint.call(layer, map.latLngToLayerPoint(latlng))) {
                  layer.fire('click', { latlng: latlng, originalEvent: e.originalEvent });
                  found = true;
                }
              } else if (layer.getBounds && layer.getBounds().contains(latlng)) {
                // fallback for MultiPolygon
                layer.fire('click', { latlng: latlng, originalEvent: e.originalEvent });
                found = true;
              }
            });
          }
        });

        group.addLayer(rect);
      }
    }
    return group;
  }

  function highlightCountriesInCell(cellBounds) {
    // Bonus: highlight countries intersecting the cell
    if (!window.geoJsonLayer) return;
    window.geoJsonLayer.eachLayer(function (layer) {
      const featureBounds = layer.getBounds && layer.getBounds();
      if (featureBounds && featureBounds.intersects(L.latLngBounds(cellBounds))) {
        layer.setStyle({ fillColor: '#ffeb3b', color: '#f44336', fillOpacity: 0.8 });
      } else {
        layer.setStyle({ fillColor: 'lightgreen', color: 'black', fillOpacity: 0.7 });
      }
    });
  }

  function addGridLayer() {
    if (!gridLayer) gridLayer = createGridLayer();
    map.addLayer(gridLayer);
  }
  function removeGridLayer() {
    if (gridLayer) map.removeLayer(gridLayer);
    // Reset country styles
    if (window.geoJsonLayer) window.geoJsonLayer.eachLayer(function (layer) {
      layer.setStyle({ fillColor: 'lightgreen', color: 'black', fillOpacity: 0.7 });
    });
  }

  // === Grid Toggle Button in #map-options ===
  const mapOptions = document.getElementById('map-options');
  const gridBtn = document.createElement('button');
  gridBtn.className = 'geo-grid-toggle';
  gridBtn.innerHTML = 'Grid';
  gridBtn.title = 'Toggle grid overlay';
  let gridActive = false;
  gridBtn.onclick = function (e) {
    e.stopPropagation();
    gridActive = !gridActive;
    if (gridActive) {
      addGridLayer();
      gridBtn.classList.add('active');
    } else {
      removeGridLayer();
      gridBtn.classList.remove('active');
    }
  };
  mapOptions.appendChild(gridBtn);

  // Add this after your grid button code
  const clearSelectionBtn = document.createElement('button');
  clearSelectionBtn.className = 'clear-selection-btn';
  clearSelectionBtn.innerHTML = 'Clear Selection';
  clearSelectionBtn.title = 'Clear country selection';
  clearSelectionBtn.onclick = function (e) {
    e.stopPropagation();
    resetAllCountryStyles();
    addLogEntry('Selection cleared', 'info');
  };
  mapOptions.appendChild(clearSelectionBtn);

  // Remove the old Leaflet control version if present
  const oldControl = document.querySelector('.leaflet-control-custom');
  if (oldControl) {
    oldControl.remove();
  }

  // Save geoJsonLayer globally for grid interaction
  fetch("data/countries.geojson")
    .then((response) => response.json())
    .then((data) => {
      const geoJsonLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: "black",
            fillColor: "lightgreen",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7,
          };
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.ADMIN) {
            layer.bindPopup(feature.properties.ADMIN, {
              closeOnClick: false,
              autoClose: false,
            });

            layer.on("click", (e) => {
              const countryName = feature.properties.ADMIN;
              // Find country data by name or code
              const countryData = countries.find(c => c.name === countryName) || {
                population: "N/A",
                capital: "N/A",
                region: "N/A"
              };

              // Update the country info window
              updateCountryInfo(countryName, countryData);

              // Add a log entry
              addLogEntry(`Country selected: ${countryName}`);

              // Highlight the clicked country
              if (isMultiSelectMode) {
                // In multi-select mode, just highlight this country without resetting others
                layer.setStyle({
                  fillColor: '#ffeb3b',
                  color: '#f44336',
                  fillOpacity: 0.8,
                  weight: 2
                });
                if (layer.bringToFront) layer.bringToFront();
              } else {
                // In single-select mode, reset others and highlight this one
                highlightCountry(layer);
              }

              // Stop propagation to prevent the map from receiving the click
              L.DomEvent.stopPropagation(e);
            });
          }
        },
      }).addTo(map);
      window.geoJsonLayer = geoJsonLayer; // <-- for grid interaction
      // Dynamically fit the map to the world while avoiding empty borders
      const bounds = geoJsonLayer.getBounds();
      const paddingOptions = {
        paddingTopLeft: [0, 50], // Adjust padding to avoid top/bottom borders
        paddingBottomRight: [0, 50],
        maxZoom: 6, // Set max zoom level to avoid excessive zoom-out
      };

      map.fitBounds(bounds, paddingOptions);
    })
    .catch((error) => console.error("Error loading GeoJSON:", error));

  map.on("resize moveend zoomend", drawPixelGrid);
  drawPixelGrid();
  animateRadarEffect();
});

function createBlip() {
  const blip = document.createElement("div");
  blip.className = "radar-blip";
  blip.style.top = `${Math.random() * 100}%`;
  blip.style.left = `${Math.random() * 100}%`;
  document.getElementById("radar").appendChild(blip);

  // Remove blip after animation ends
  setTimeout(() => blip.remove(), 2000);
}

// Generate blips every second
setInterval(createBlip, 1000);

window.switchTheme = function (theme) {
  document.documentElement.setAttribute("data-theme", theme);
};

function updateCountryInfo(countryName, countryData) {
  const countryInfoWindow = document.getElementById("country-info-window");
  const content = countryInfoWindow.querySelector(".window-content");

  content.innerHTML = `
        <h3>${countryData.flag ? `<span class="country-flag">${countryData.flag}</span>` : ''}${countryName}</h3>
        <p><strong>Population:</strong> ${countryData.population?.toLocaleString?.() || countryData.population || 'N/A'}</p>
        <p><strong>Capital:</strong> ${countryData.capital || 'N/A'}</p>
        <p><strong>Region:</strong> ${countryData.region || 'N/A'}</p>
        <p><strong>Subregion:</strong> ${countryData.subregion || 'N/A'}</p>
        <p><strong>Area:</strong> ${countryData.area ? countryData.area.toLocaleString() + ' km²' : 'N/A'}</p>
        <p><strong>Languages:</strong> ${countryData.languages ? countryData.languages.join(', ') : 'N/A'}</p>
        <p><strong>Currency:</strong> ${countryData.currency || 'N/A'}</p>
        <p><strong>Timezones:</strong> ${countryData.timezones ? countryData.timezones.join(', ') : 'N/A'}</p>
        <p><strong>Demonym:</strong> ${countryData.demonym || 'N/A'}</p>
    `;

  // Show the window if it's hidden
  countryInfoWindow.style.display = "block";
}

// Example usage
updateCountryInfo("Canada", {
  population: "37,742,154",
  capital: "Ottawa",
  region: "Americas",
  subregion: "Northern America",
  area: "9,984,670 km²",
  languages: ["English", "French"],
  currency: "CAD",
  timezones: ["UTC-03:30", "UTC-08:00"],
  demonym: "Canadian",
  flag: "🇨🇦"
});

function addLogEntry(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString(); // Get current time
  const logsList = document.getElementById('logs-list');
  const logEntry = document.createElement('li');

  // Add a class for the log type (e.g., info, warning, error)
  logEntry.classList.add(`log-${type}`);

  // Include the timestamp and message in the log entry
  logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

  logsList.appendChild(logEntry);

  // Auto-scroll to the latest log
  logsList.scrollTop = logsList.scrollHeight;
}

function filterLogs(type) {
  const logs = document.querySelectorAll('#logs-list li');

  logs.forEach(log => {
    if (type === 'all' || log.classList.contains(`log-${type}`)) {
      log.style.display = 'block'; // Show the log
    } else {
      log.style.display = 'none'; // Hide the log
    }
  });
}

// Example usage
addLogEntry('Country selected: Germany', 'info');
addLogEntry('Warning: Low disk space', 'warning');
addLogEntry('Error: Failed to fetch data', 'error');

// New function to highlight a specific country
function highlightCountry(selectedLayer) {
  // Reset all countries to default style
  window.geoJsonLayer.eachLayer(function (layer) {
    layer.setStyle({
      fillColor: 'lightgreen',
      color: 'black',
      fillOpacity: 0.7,
      weight: 1
    });
  });

  // Highlight the selected country
  selectedLayer.setStyle({
    fillColor: '#ffeb3b',
    color: '#f44336',
    fillOpacity: 0.8,
    weight: 2
  });

  // Bring the selected country to the front
  if (selectedLayer.bringToFront) {
    selectedLayer.bringToFront();
  }
}

// Add this helper function
function resetAllCountryStyles() {
  if (window.geoJsonLayer) {
    window.geoJsonLayer.eachLayer(function (layer) {
      layer.setStyle({
        fillColor: 'lightgreen',
        color: 'black',
        fillOpacity: 0.7,
        weight: 1
      });
    });
  }
}