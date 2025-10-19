# USDA Plant Hardiness Zone Map

An interactive web application for exploring USDA Plant Hardiness Zones across the United States. Find your hardiness zone by ZIP code and visualize zone boundaries on an interactive map.

**🌍 Live Demo: [map.victorygarden.ai](https://map.victorygarden.ai)**

## Features

- **Interactive Map**: Toggle visibility of all 19 hardiness zones (3a-12a)
- **ZIP Code Lookup**: Find your hardiness zone by entering your ZIP code
- **Optimized Data**: Multiple GeoJSON optimization levels for different use cases
- **Responsive Design**: Works on desktop and mobile devices
- **Data Processing Pipeline**: Complete scripts to transform raw USDA data into web-ready GeoJSON

## Quick Start

### Run Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# The application will be available at:
# http://localhost:33332
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker

```bash
# Build and run with Docker
docker build -t victory-map .
docker run -p 3000:3000 victory-map
```

## Project Structure

```
victory_map/
├── src/                         # Next.js application source
│   ├── app/                     # App router pages and API routes
│   │   ├── api/geocode/         # ZIP code geocoding API
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── Header.tsx
│   │   ├── MapComponent.tsx     # Leaflet map integration
│   │   ├── ZipLookup.tsx        # ZIP code search
│   │   ├── ZoneList.tsx         # Zone toggle controls
│   │   └── ...
│   └── lib/                     # Utilities and data
├── public/                      # Static files
│   ├── geojson/                 # Optimized GeoJSON files
│   │   ├── balanced/            # Recommended for web (~5MB per zone)
│   │   ├── simplified/          # Standard simplification
│   │   ├── ultra/               # Ultra-compressed (<100KB per zone)
│   │   └── original/            # Full detail from source
│   └── logo.png                 # Victory Garden logo
├── data/                        # Source data and processing
│   ├── source/                  # Original USDA KML file
│   └── geojson/                 # Processed data
├── scripts/                     # Python data processing scripts
│   ├── convert_kml_to_geojson.py
│   ├── balanced_simplify_geojson.py
│   └── ultra_simplify_geojson.py
├── package.json
├── tsconfig.json
├── next.config.js
├── Dockerfile
└── LICENSE
```

## Technology Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Mapping**: Leaflet.js
- **Geocoding**: OpenStreetMap Nominatim API
- **Styling**: CSS (no framework dependencies)

## Data Processing

The project includes Python scripts to process raw USDA data:

```bash
# Convert KML to GeoJSON
python scripts/convert_kml_to_geojson.py

# Create optimized versions
python scripts/balanced_simplify_geojson.py
python scripts/ultra_simplify_geojson.py
```

### Data Sources
- **Hardiness Zone Data**: PRISM Climate Group, Oregon State University
- **Original File**: `phzm_us_zones_kml_2023.kml` (233MB)
- **Processing**: Douglas-Peucker simplification algorithm

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

## API Routes

### `/api/geocode`

Geocode ZIP codes to coordinates and find hardiness zones.

```typescript
GET /api/geocode?zip=21074

Response:
[{
  lat: "39.4015",
  lon: "-76.7791",
  display_name: "Gambrills, Maryland, ..."
}]
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related Projects

Visit [Victory Garden](https://victorygarden.ai) for AI-powered gardening assistance.

## License

MIT License

Copyright (c) USDA Plant Hardiness Zone Map

See [LICENSE](LICENSE) for full details.

### Data Attribution

- Hardiness zone data: PRISM Climate Group, Oregon State University
- Base map tiles: OpenStreetMap contributors
- Geocoding service: OpenStreetMap Nominatim
