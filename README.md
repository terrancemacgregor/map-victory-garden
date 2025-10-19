# USDA Plant Hardiness Zone Map

An interactive web application for visualizing USDA Plant Hardiness Zones across the United States. This project provides gardeners, farmers, and agricultural professionals with an easy-to-use tool to find their hardiness zone and understand temperature ranges for plant selection.

## Features

- **Interactive Map**: Visualize hardiness zones on a Leaflet.js map
- **ZIP Code Lookup**: Find your hardiness zone by entering a ZIP code
- **Zone Toggle**: Show/hide specific zones on the map
- **Color-coded Visualization**: Temperature-based color scheme from blue (coldest) to red (warmest)
- **Multiple Data Formats**: Optimized GeoJSON files for different performance needs
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Option 1: Docker (Recommended)
```bash
# Build and run with Docker Compose
docker-compose up --build

# The application will be available at:
# http://localhost:3333
```

### Option 2: Direct File Access
1. **View the Map**: Open `web/index.html` in your web browser
2. **Find Your Zone**: Enter your ZIP code in the sidebar
3. **Explore Zones**: Toggle different zones on/off to see their boundaries

### Docker Commands
```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Stop the application
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f
```

## Project Structure

```
victory_map/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore file
├── scripts/                     # Python processing scripts
│   ├── convert_kml_to_geojson.py
│   ├── convert_kml_with_colors.py
│   ├── simplify_geojson.py
│   ├── balanced_simplify_geojson.py
│   └── ultra_simplify_geojson.py
├── data/                        # All data files
│   ├── source/                  # Original source data
│   │   └── phzm_us_zones_kml_2023.kml
│   ├── geojson/                 # Processed GeoJSON files
│   │   ├── original/            # First conversion from KML
│   │   ├── balanced/            # Balanced simplification (~10-20MB)
│   │   ├── simplified/           # Standard simplification
│   │   ├── ultra/               # Ultra-aggressive (<100KB per file)
│   │   └── with_colors/         # With original KML colors
│   └── samples/                 # Sample/test files
├── web/                         # Web application files
│   └── index.html               # Main HTML file
├── docs/                        # Documentation
│   ├── api.md                   # API documentation
│   ├── data-processing.md       # Data processing guide
│   └── deployment.md           # Deployment instructions
├── Dockerfile                   # Docker configuration
├── docker-compose.yml          # Docker Compose setup
└── .dockerignore               # Docker ignore file
```

## Data Processing

The project includes several Python scripts for processing the original USDA KML data:

### Scripts Overview

- **`convert_kml_to_geojson.py`**: Converts the original KML file to individual GeoJSON files
- **`convert_kml_with_colors.py`**: Extracts and preserves KML styling information
- **`simplify_geojson.py`**: Standard geometry simplification for reduced file sizes
- **`balanced_simplify_geojson.py`**: Balanced approach maintaining good coverage
- **`ultra_simplify_geojson.py`**: Aggressive simplification for minimal file sizes

### Running the Scripts

```bash
# Install dependencies
pip install -r requirements.txt

# Convert KML to GeoJSON
python scripts/convert_kml_to_geojson.py

# Simplify the data
python scripts/balanced_simplify_geojson.py
```

## Hardiness Zones

The map displays USDA Plant Hardiness Zones from 3a to 12a:

| Zone | Temperature Range | Color |
|------|------------------|-------|
| 3a   | -40 to -35°F     | Dark Blue |
| 3b   | -35 to -30°F     | Blue |
| 4a   | -30 to -25°F     | Medium Blue |
| 4b   | -25 to -20°F     | Light Blue |
| 5a   | -20 to -15°F     | Blue |
| 5b   | -15 to -10°F     | Light Blue |
| 6a   | -10 to -5°F      | Sky Blue |
| 6b   | -5 to 0°F        | Light Green |
| 7a   | 0 to 5°F         | Green |
| 7b   | 5 to 10°F        | Medium Green |
| 8a   | 10 to 15°F       | Light Green |
| 8b   | 15 to 20°F       | Lime |
| 9a   | 20 to 25°F       | Yellow |
| 9b   | 25 to 30°F       | Amber |
| 10a  | 30 to 35°F       | Orange |
| 10b  | 35 to 40°F       | Deep Orange |
| 11a  | 40 to 45°F       | Red |
| 11b  | 45 to 50°F       | Dark Red |
| 12a  | 50 to 60°F       | Dark Red |

## Data Sources

- **Primary Data**: [PRISM Climate Group, Oregon State University](https://prism.oregonstate.edu/phzm/)
- **Original KML**: USDA Plant Hardiness Zone Map 2023
- **Geocoding**: OpenStreetMap Nominatim service for ZIP code lookup

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js 1.9.4
- **Data Format**: GeoJSON
- **Coordinate System**: WGS84 (EPSG:4326)
- **Simplification**: Douglas-Peucker algorithm

## Performance Optimization

The project includes multiple data optimization levels:

- **Original**: Full detail from KML conversion
- **Balanced**: ~10-20MB total, good coverage maintained
- **Simplified**: Standard reduction for web use
- **Ultra**: <100KB per file, minimal detail

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please see the LICENSE file for details.

## Acknowledgments

- **PRISM Climate Group, Oregon State University** for the original hardiness zone data
- **OpenStreetMap contributors** for the base map tiles
- **Leaflet.js** for the mapping library
- **USDA** for maintaining the plant hardiness zone standards

## Support

For questions, issues, or contributions, please open an issue on the project repository.
