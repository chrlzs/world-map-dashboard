document.addEventListener("DOMContentLoaded", function () {
    const map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    const canvas = document.createElement('canvas');
    canvas.id = "pixel-canvas";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "1000"; // Ensure the canvas is on top
    document.getElementById('map').appendChild(canvas);
    
    function drawPixelGrid() {
        const ctx = canvas.getContext('2d');
        canvas.width = map.getSize().x;
        canvas.height = map.getSize().y;

        const pixelSize = 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        
        for (let x = 0; x < canvas.width; x += pixelSize) {
            for (let y = 0; y < canvas.height; y += pixelSize) {
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }

    function animateRadarEffect() {
        const ctx = canvas.getContext('2d');
        const pixelSize = 10;
        const width = canvas.width;
        const height = canvas.height;
        const totalColumns = Math.ceil(width / pixelSize);
        
        function animateColumn(column) {
            ctx.clearRect(0, 0, width, height);
            drawPixelGrid();
            
            ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Semi-transparent green
            for (let y = 0; y < height; y += pixelSize) {
                ctx.fillRect(column * pixelSize, y, pixelSize, pixelSize);
            }

            column = (column + 1) % totalColumns;
            requestAnimationFrame(() => animateColumn(column));
        }

        animateColumn(0);
    }
    
    fetch('data/countries.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function (feature) {
                    return {
                        color: "black",
                        fillColor: "lightgreen",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.ADMIN) {
                        layer.bindPopup(feature.properties.ADMIN, { closeOnClick: false, autoClose: false });
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading GeoJSON:', error));

    map.on('resize moveend zoomend', drawPixelGrid);
    drawPixelGrid();
    animateRadarEffect();
});