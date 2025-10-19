# Data Processing Guide

This document explains how to process the USDA Plant Hardiness Zone data from the original KML format to optimized GeoJSON files.

## Overview

The data processing pipeline converts the original USDA KML file into multiple optimized GeoJSON formats for different use cases.

## Processing Steps

### 1. Convert KML to GeoJSON

```bash
cd scripts
python convert_kml_to_geojson.py
```

This creates the original GeoJSON files in `data/geojson/original/`.

### 2. Extract Colors (Optional)

```bash
python convert_kml_with_colors.py
```

This preserves the original KML styling information in `data/geojson/with_colors/`.

### 3. Simplify Data

Choose one of the simplification methods based on your needs:

#### Balanced Simplification (Recommended)
```bash
python balanced_simplify_geojson.py
```
- Target: ~10-20MB total
- Good coverage maintained
- Best for most web applications

#### Standard Simplification
```bash
python simplify_geojson.py
```
- Moderate file size reduction
- Good balance of size vs detail

#### Ultra Simplification
```bash
python ultra_simplify_geojson.py
```
- Target: <100KB per file
- Minimal detail but very fast loading
- Good for mobile or bandwidth-limited applications

## File Size Comparison

| Method | Total Size | Avg File Size | Use Case |
|--------|------------|---------------|----------|
| Original | ~233MB | ~12MB | Full detail analysis |
| Balanced | ~15MB | ~800KB | Web applications |
| Simplified | ~8MB | ~400KB | Standard web use |
| Ultra | ~2MB | ~100KB | Mobile/limited bandwidth |

## Algorithm Details

### Douglas-Peucker Simplification
All simplification methods use the Douglas-Peucker algorithm to reduce coordinate points while preserving the essential shape of the polygons.

### Coordinate Precision
- **Original**: Full precision from KML
- **Balanced**: 4 decimal places (~11m precision)
- **Simplified**: 4 decimal places (~11m precision)  
- **Ultra**: 3 decimal places (~111m precision)

### Tolerance Settings
- **Balanced**: 0.002 degrees (~200m tolerance)
- **Simplified**: 0.0005 degrees (~55m tolerance)
- **Ultra**: 0.02 degrees (~2km tolerance)

## Quality Assurance

Each script includes:
- Error handling for malformed data
- Progress reporting
- File size reduction statistics
- Validation of polygon closure

## Troubleshooting

### Common Issues

1. **Memory errors with large files**
   - Use the ultra simplification method
   - Process files individually if needed

2. **Missing zones after simplification**
   - Check tolerance settings
   - Verify input data integrity

3. **Invalid GeoJSON output**
   - Ensure polygon closure
   - Check coordinate precision settings

### Performance Tips

- Run scripts from the `scripts/` directory
- Ensure sufficient disk space for output files
- Monitor memory usage with large datasets
- Use balanced simplification for best results

## Data Validation

After processing, validate your GeoJSON files:

```python
import json

# Load and validate GeoJSON
with open('zone_7a.geojson', 'r') as f:
    data = json.load(f)
    
# Check structure
assert data['type'] == 'FeatureCollection'
assert len(data['features']) > 0

# Check geometry
for feature in data['features']:
    assert feature['geometry']['type'] in ['Polygon', 'MultiPolygon']
```

## Next Steps

After processing the data:
1. Test the web application with your processed files
2. Verify zone boundaries are accurate
3. Check file sizes meet your requirements
4. Update the web application paths if needed
