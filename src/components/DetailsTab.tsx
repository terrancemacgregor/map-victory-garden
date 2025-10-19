export default function DetailsTab() {
  return (
    <div className="details-content">
      <h2>Data Processing Pipeline</h2>
      
      <p>This project transforms raw USDA Plant Hardiness Zone data into optimized GeoJSON files suitable for web applications. Here&apos;s how we did it:</p>

      <div className="data-source">
        <h3>Source Data</h3>
        <p><strong>Original Data:</strong> <a href="https://prism.oregonstate.edu/phzm/" target="_blank" rel="noopener noreferrer">PRISM Climate Group, Oregon State University</a></p>
        <p><strong>File:</strong> <code>phzm_us_zones_kml_2023.kml</code> (233MB KML file)</p>
        <p><strong>Data Created:</strong> February 4, 2023</p>
      </div>

      <h3>Processing Steps</h3>
      
      <h4>1. KML to GeoJSON Conversion</h4>
      <p>We converted the original KML file into individual GeoJSON files for each hardiness zone:</p>
      <div className="code-block">
# Convert KML to GeoJSON
python scripts/convert_kml_to_geojson.py
      </div>
      <p><strong>Result:</strong> 19 individual zone files (3a-12a) in <code>data/geojson/original/</code></p>

      <h4>2. Geometry Simplification</h4>
      <p>To make the data web-friendly, we applied the <strong>Douglas-Peucker algorithm</strong> to reduce file sizes while maintaining accuracy:</p>
      
      <div className="algorithm-info">
        <h4>Douglas-Peucker Algorithm</h4>
        <p>This algorithm removes redundant coordinate points while preserving the essential shape of polygons. It&apos;s widely used in GIS applications for data optimization.</p>
        <p><strong>How it works:</strong></p>
        <ul>
          <li>Finds the point with maximum distance from a line segment</li>
          <li>If distance exceeds tolerance, recursively simplifies both sides</li>
          <li>Otherwise, removes intermediate points</li>
        </ul>
      </div>

      <h4>3. Multiple Optimization Levels</h4>
      <p>We created different versions for various use cases:</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0' }}>
        <tr style={{ background: '#f8f9fa' }}>
          <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Version</th>
          <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Total Size</th>
          <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Avg File Size</th>
          <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Use Case</th>
        </tr>
        <tr>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}><strong>Original</strong></td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~233MB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~12MB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Full detail analysis</td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}><strong>Balanced</strong></td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~15MB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~800KB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Web applications (recommended)</td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}><strong>Simplified</strong></td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~8MB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~400KB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Standard web use</td>
        </tr>
        <tr>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}><strong>Ultra</strong></td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~2MB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>~100KB</td>
          <td style={{ border: '1px solid #dee2e6', padding: '10px' }}>Mobile/limited bandwidth</td>
        </tr>
      </table>

      <h3>Processing Scripts</h3>
      <p>All processing is done with Python scripts using only standard library modules:</p>
      
      <div className="code-block">
# Available processing scripts:
scripts/convert_kml_to_geojson.py      # KML → GeoJSON conversion
scripts/convert_kml_with_colors.py     # Extract KML styling
scripts/simplify_geojson.py            # Standard simplification
scripts/balanced_simplify_geojson.py   # Balanced approach (recommended)
scripts/ultra_simplify_geojson.py      # Aggressive simplification
      </div>

      <h3>Output Structure</h3>
      <div className="code-block">
data/
├── source/                    # Original KML file
│   └── phzm_us_zones_kml_2023.kml
└── geojson/                   # Processed GeoJSON files
    ├── original/              # First conversion
    ├── balanced/              # Balanced simplification (used in this app)
    ├── simplified/            # Standard simplification
    ├── ultra/                 # Ultra-aggressive
    └── with_colors/          # With original KML colors
      </div>

      <h3>Technical Specifications</h3>
      <ul>
        <li><strong>Coordinate System:</strong> WGS84 (EPSG:4326)</li>
        <li><strong>Precision:</strong> 4 decimal places (~11m accuracy)</li>
        <li><strong>Tolerance:</strong> 0.002 degrees (~200m)</li>
        <li><strong>Algorithm:</strong> Douglas-Peucker line simplification</li>
        <li><strong>Format:</strong> GeoJSON FeatureCollection</li>
      </ul>

      <h3>Data Sources & Acknowledgments</h3>
      <div className="data-source">
        <p><strong>Primary Data Source:</strong> <a href="https://prism.oregonstate.edu/phzm/" target="_blank" rel="noopener noreferrer">PRISM Climate Group, Oregon State University</a></p>
        <p><strong>Base Map:</strong> <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a></p>
        <p><strong>Geocoding:</strong> <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap Nominatim</a></p>
      </div>

      <h3>Documentation</h3>
      <p>For detailed information about the data processing pipeline, see:</p>
      <ul>
        <li><a href="../docs/data-processing.md" target="_blank" rel="noopener noreferrer">Data Processing Guide</a></li>
        <li><a href="https://github.com/yourusername/victory_map" target="_blank" rel="noopener noreferrer">Project Repository</a></li>
      </ul>
    </div>
  );
}