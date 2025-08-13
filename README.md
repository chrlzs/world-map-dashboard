![GitHub license](https://img.shields.io/github/license/chrlzs/world-map-dashboard)
![GitHub contributors](https://img.shields.io/github/contributors/chrlzs/world-map-dashboard)
![GitHub stars](https://img.shields.io/github/stars/chrlzs/world-map-dashboard?style=social)
![GitHub forks](https://img.shields.io/github/forks/chrlzs/world-map-dashboard?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/chrlzs/world-map-dashboard)

# World Map Dashboard

This project is a dynamic, interactive world map built with [Leaflet.js](https://leafletjs.com/) and GeoJSON data. It allows users to view and interact with a world grid overlay, with countries highlighted on hover and additional features like clickable popups displaying country names. This dashboard can be adapted for various applications such as geographical data visualization, global statistics tracking, or educational tools.

## Features

- **Interactive World Grid**: Displays a grid across the world map.
- **Country Highlighting**: Hover over countries to see their borders highlighted.
- **Popups**: Click on any country to reveal a dismissible popup displaying its name.
- **GeoJSON Data Integration**: Country boundaries are defined using GeoJSON for accuracy and ease of use.
- **Leaflet.js**: Lightweight library for creating interactive maps, providing a responsive and smooth map experience.

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chrlzs/world-map-dashboard.git
   cd world-map-dashboard
   ```

### Running the Project

To run the project locally, you can use a simple HTTP server. Here are a few methods:

#### Using Python's HTTP Server

If you have Python installed, you can use its built-in HTTP server:

1. Open a terminal in the project directory.
2. Run the following command:
   ```bash
   python -m http.server
   ```
3. Open your browser and navigate to `http://localhost:8000`.

#### Using Node.js HTTP Server

If you have Node.js installed, you can use the `http-server` package:

1. Install `http-server` globally:
   ```bash
   npm install -g http-server
   ```
2. Open a terminal in the project directory.
3. Run the following command:
   ```bash
   http-server
   ```
4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:8080`).

#### Using Live Server Extension (Visual Studio Code)

If you are using Visual Studio Code, you can use the Live Server extension:

1. Install the Live Server extension from the VS Code marketplace.
2. Open the project directory in VS Code.
3. Right-click on `index.html` and select "Open with Live Server".

### Usage

Once the project is running, you can interact with the map by hovering over countries to highlight them and clicking on countries to see their names in popups.

### Customization

- **Grid and Map Layers**: The world grid and country boundaries are defined in `world-map/public/js/core/grid.js` and `globe.js`. To customize the grid, modify the `Grid.js` file.
- **Country Data**: GeoJSON files are used to store country boundary data and are rendered via Leaflet.js.
- **Visual Effects**: The project includes hover and click effects, which can be adjusted in `map.js`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
