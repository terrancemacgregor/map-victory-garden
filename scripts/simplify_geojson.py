#!/usr/bin/env python3
"""
Simplify GeoJSON files to reduce file size by:
1. Reducing coordinate precision
2. Simplifying polygon geometry
"""

import json
import os
from pathlib import Path
import math


def round_coordinates(coordinates, precision=4):
    """Round coordinates to specified decimal places."""
    if isinstance(coordinates[0], list):
        return [round_coordinates(coord, precision) for coord in coordinates]
    else:
        return [round(coord, precision) for coord in coordinates]


def simplify_polygon_coordinates(coordinates, tolerance=0.001):
    """
    Simplify polygon coordinates using Douglas-Peucker-like algorithm.
    Remove points that are very close to each other.
    """
    if len(coordinates) <= 3:
        return coordinates
    
    simplified = [coordinates[0]]  # Always keep first point
    
    for i in range(1, len(coordinates) - 1):
        # Calculate distance from previous point
        prev_point = simplified[-1]
        curr_point = coordinates[i]
        
        distance = math.sqrt(
            (curr_point[0] - prev_point[0])**2 + 
            (curr_point[1] - prev_point[1])**2
        )
        
        # Only keep point if it's far enough from the previous one
        if distance > tolerance:
            simplified.append(curr_point)
    
    # Always keep last point (close the polygon)
    if len(coordinates) > 1:
        simplified.append(coordinates[-1])
    
    return simplified


def simplify_geometry(geometry, coordinate_precision=4, tolerance=0.001):
    """Simplify a GeoJSON geometry."""
    if geometry["type"] == "Polygon":
        simplified_coords = []
        for ring in geometry["coordinates"]:
            simplified_ring = simplify_polygon_coordinates(ring, tolerance)
            simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
            simplified_coords.append(simplified_ring)
        
        return {
            "type": "Polygon",
            "coordinates": simplified_coords
        }
    
    elif geometry["type"] == "MultiPolygon":
        simplified_coords = []
        for polygon in geometry["coordinates"]:
            simplified_polygon = []
            for ring in polygon:
                simplified_ring = simplify_polygon_coordinates(ring, tolerance)
                simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
                simplified_polygon.append(simplified_ring)
            simplified_coords.append(simplified_polygon)
        
        return {
            "type": "MultiPolygon",
            "coordinates": simplified_coords
        }
    
    return geometry


def simplify_geojson_file(input_path, output_path, coordinate_precision=4, tolerance=0.001):
    """Simplify a GeoJSON file."""
    try:
        with open(input_path, 'r') as f:
            geojson = json.load(f)
        
        original_size = os.path.getsize(input_path)
        
        # Simplify each feature
        for feature in geojson["features"]:
            if "geometry" in feature and feature["geometry"]:
                feature["geometry"] = simplify_geometry(
                    feature["geometry"], 
                    coordinate_precision, 
                    tolerance
                )
        
        # Write simplified version
        with open(output_path, 'w') as f:
            json.dump(geojson, f, separators=(',', ':'))  # Compact JSON
        
        new_size = os.path.getsize(output_path)
        reduction = (1 - new_size / original_size) * 100
        
        print(f"Simplified {os.path.basename(input_path)}: {original_size:,} -> {new_size:,} bytes ({reduction:.1f}% reduction)")
        
        return True
    
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False


def main():
    input_dir = "../data/geojson/original"
    output_dir = "../data/geojson/simplified"
    
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Get all GeoJSON files
    geojson_files = list(Path(input_dir).glob("*.geojson"))
    
    print(f"Simplifying {len(geojson_files)} GeoJSON files...")
    print("This may take a few minutes for large files...\n")
    
    total_original = 0
    total_simplified = 0
    
    for input_file in sorted(geojson_files):
        output_file = Path(output_dir) / input_file.name
        
        original_size = input_file.stat().st_size
        total_original += original_size
        
        success = simplify_geojson_file(
            str(input_file), 
            str(output_file),
            coordinate_precision=4,  # 4 decimal places (~11m precision)
            tolerance=0.0005  # Remove points closer than ~55m
        )
        
        if success:
            new_size = output_file.stat().st_size
            total_simplified += new_size
    
    overall_reduction = (1 - total_simplified / total_original) * 100
    print(f"\nOverall: {total_original:,} -> {total_simplified:,} bytes ({overall_reduction:.1f}% reduction)")
    print(f"Total size: {total_simplified / (1024*1024):.1f} MB")


if __name__ == "__main__":
    main()