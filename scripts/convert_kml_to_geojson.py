#!/usr/bin/env python3
"""
Convert USDA Hardiness Zone KML file to individual GeoJSON files.
Each zone will be saved as a separate GeoJSON file.
"""

import xml.etree.ElementTree as ET
import json
import os
import re
from pathlib import Path


def parse_coordinates(coord_string):
    """Parse KML coordinates string into GeoJSON format."""
    coordinates = []
    points = coord_string.strip().split()
    
    for point in points:
        if point.strip():
            lon, lat, *alt = point.split(',')
            coordinates.append([float(lon), float(lat)])
    
    return coordinates


def parse_polygon(polygon_elem, ns):
    """Parse a KML Polygon element into GeoJSON format."""
    coordinates = []
    
    # Parse outer boundary
    outer_boundary = polygon_elem.find('.//kml:outerBoundaryIs/kml:LinearRing/kml:coordinates', ns)
    if outer_boundary is not None:
        outer_coords = parse_coordinates(outer_boundary.text)
        coordinates.append(outer_coords)
    
    # Parse inner boundaries (holes)
    inner_boundaries = polygon_elem.findall('.//kml:innerBoundaryIs/kml:LinearRing/kml:coordinates', ns)
    for inner_boundary in inner_boundaries:
        inner_coords = parse_coordinates(inner_boundary.text)
        coordinates.append(inner_coords)
    
    return {
        "type": "Polygon",
        "coordinates": coordinates
    }


def parse_multigeometry(multigeom_elem, ns):
    """Parse a KML MultiGeometry element into GeoJSON format."""
    geometries = []
    
    # Find all polygons within the MultiGeometry
    polygons = multigeom_elem.findall('.//kml:Polygon', ns)
    for polygon in polygons:
        geom = parse_polygon(polygon, ns)
        geometries.append(geom)
    
    if len(geometries) == 1:
        return geometries[0]
    else:
        return {
            "type": "MultiPolygon",
            "coordinates": [geom["coordinates"] for geom in geometries]
        }


def extract_zone_data(placemark_elem, ns):
    """Extract zone data from a Placemark element."""
    zone_data = {}
    
    # Extract SimpleData elements
    simple_data_elems = placemark_elem.findall('.//kml:SimpleData', ns)
    for elem in simple_data_elems:
        name = elem.get('name')
        value = elem.text
        zone_data[name] = value
    
    return zone_data


def convert_kml_to_geojson(kml_file_path, output_dir):
    """Convert KML file to individual GeoJSON files for each zone."""
    
    # Create output directory if it doesn't exist
    Path(output_dir).mkdir(exist_ok=True)
    
    # Parse the KML file
    tree = ET.parse(kml_file_path)
    root = tree.getroot()
    
    # Define namespace
    ns = {'kml': 'http://www.opengis.net/kml/2.2'}
    
    # Find all Placemark elements
    placemarks = root.findall('.//kml:Placemark', ns)
    
    zones_processed = set()
    
    for placemark in placemarks:
        # Extract zone data
        zone_data = extract_zone_data(placemark, ns)
        
        if not zone_data.get('zone'):
            continue
        
        zone_name = zone_data['zone']
        zone_title = zone_data.get('zonetitle', zone_name)
        
        # Skip if we've already processed this zone
        if zone_name in zones_processed:
            continue
        
        zones_processed.add(zone_name)
        
        # Find geometry
        geometry = None
        multigeom = placemark.find('.//kml:MultiGeometry', ns)
        if multigeom is not None:
            geometry = parse_multigeometry(multigeom, ns)
        else:
            polygon = placemark.find('.//kml:Polygon', ns)
            if polygon is not None:
                geometry = parse_polygon(polygon, ns)
        
        if geometry is None:
            print(f"Warning: No geometry found for zone {zone_name}")
            continue
        
        # Create GeoJSON feature
        feature = {
            "type": "Feature",
            "properties": {
                "zone": zone_name,
                "title": zone_title,
                "temperature_range": zone_data.get('trange', ''),
                "gridcode": zone_data.get('gridcode', ''),
                "id": zone_data.get('Id', '')
            },
            "geometry": geometry
        }
        
        # Create GeoJSON FeatureCollection
        geojson = {
            "type": "FeatureCollection",
            "features": [feature]
        }
        
        # Save to file
        filename = f"zone_{zone_name.replace('/', '_')}.geojson"
        output_path = os.path.join(output_dir, filename)
        
        with open(output_path, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"Created: {filename}")
    
    print(f"\nProcessed {len(zones_processed)} unique zones")
    return list(zones_processed)


def main():
    kml_file = "../data/source/phzm_us_zones_kml_2023.kml"
    output_dir = "../data/geojson/original"
    
    if not os.path.exists(kml_file):
        print(f"Error: KML file not found at {kml_file}")
        return
    
    print("Converting KML to GeoJSON files...")
    zones = convert_kml_to_geojson(kml_file, output_dir)
    
    print(f"\nConversion complete! Created {len(zones)} zone files in {output_dir}")
    print("Zones:", sorted(zones))


if __name__ == "__main__":
    main()