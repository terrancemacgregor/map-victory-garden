#!/usr/bin/env python3
"""
Balanced GeoJSON simplification that maintains coverage while reducing file size.
Target: ~10-20MB total (vs original 233MB) with proper coverage.
"""

import json
import os
from pathlib import Path
import math


def douglas_peucker(points, tolerance):
    """Douglas-Peucker line simplification algorithm."""
    if len(points) <= 2:
        return points
    
    # Find the point with the maximum distance from line between start and end
    max_distance = 0
    max_index = 0
    
    start = points[0]
    end = points[-1]
    
    for i in range(1, len(points) - 1):
        point = points[i]
        distance = point_to_line_distance(point, start, end)
        if distance > max_distance:
            max_distance = distance
            max_index = i
    
    # If max distance is greater than tolerance, recursively simplify
    if max_distance > tolerance:
        # Recursive call on both sides
        left_points = douglas_peucker(points[:max_index + 1], tolerance)
        right_points = douglas_peucker(points[max_index:], tolerance)
        
        # Combine results (remove duplicate middle point)
        return left_points[:-1] + right_points
    else:
        # If max distance is within tolerance, return just start and end
        return [start, end]


def point_to_line_distance(point, line_start, line_end):
    """Calculate perpendicular distance from point to line."""
    x0, y0 = point
    x1, y1 = line_start
    x2, y2 = line_end
    
    # If line start and end are the same point
    if x1 == x2 and y1 == y2:
        return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)
    
    # Calculate distance using cross product formula
    numerator = abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
    denominator = math.sqrt((y2 - y1)**2 + (x2 - x1)**2)
    
    if denominator == 0:
        return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)
    
    return numerator / denominator


def balanced_simplify_coordinates(coordinates, tolerance=0.005):
    """Balanced coordinate simplification that preserves coverage."""
    if len(coordinates) <= 4:
        return coordinates
    
    # Apply Douglas-Peucker algorithm with moderate tolerance
    simplified = douglas_peucker(coordinates, tolerance)
    
    # Ensure we have enough points for proper coverage
    min_points = max(8, len(coordinates) // 50)  # At least 8 points, or 1/50th of original
    
    if len(simplified) < min_points:
        # If too few points, use uniform sampling instead
        step = max(1, len(coordinates) // min_points)
        simplified = coordinates[::step]
        
        # Ensure polygon is closed
        if simplified[0] != simplified[-1]:
            if simplified[-1] != coordinates[-1]:
                simplified.append(coordinates[-1])
            else:
                simplified[-1] = simplified[0]
    else:
        # Ensure polygon is closed
        if simplified[0] != simplified[-1]:
            simplified[-1] = simplified[0]
    
    return simplified


def round_coordinates(coordinates, precision=4):
    """Round coordinates to specified decimal places."""
    if isinstance(coordinates[0], list):
        return [round_coordinates(coord, precision) for coord in coordinates]
    else:
        return [round(coord, precision) for coord in coordinates]


def balanced_simplify_geometry(geometry, tolerance=0.005, coordinate_precision=4):
    """Balanced simplification of a GeoJSON geometry."""
    if geometry["type"] == "Polygon":
        simplified_coords = []
        for ring in geometry["coordinates"]:
            simplified_ring = balanced_simplify_coordinates(ring, tolerance)
            simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
            # Keep all rings that have sufficient points
            if len(simplified_ring) >= 4:
                simplified_coords.append(simplified_ring)
        
        # If we lost the outer ring, use less aggressive simplification
        if not simplified_coords and geometry["coordinates"]:
            ring = geometry["coordinates"][0]
            step = max(1, len(ring) // 100)  # Keep more points
            simplified_ring = ring[::step]
            if simplified_ring[0] != simplified_ring[-1]:
                simplified_ring.append(simplified_ring[0])
            simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
            simplified_coords.append(simplified_ring)
        
        return {
            "type": "Polygon",
            "coordinates": simplified_coords
        }
    
    elif geometry["type"] == "MultiPolygon":
        simplified_coords = []
        
        # Keep more polygons to maintain coverage
        for polygon in geometry["coordinates"]:
            simplified_polygon = []
            for ring in polygon:
                simplified_ring = balanced_simplify_coordinates(ring, tolerance)
                simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
                if len(simplified_ring) >= 4:
                    simplified_polygon.append(simplified_ring)
            
            if simplified_polygon:
                simplified_coords.append(simplified_polygon)
        
        # If no polygons survived, be less aggressive
        if not simplified_coords and geometry["coordinates"]:
            for polygon in geometry["coordinates"]:
                if polygon and polygon[0] and len(polygon[0]) >= 4:
                    simplified_polygon = []
                    for ring in polygon:
                        step = max(1, len(ring) // 50)  # Keep more points
                        simplified_ring = ring[::step]
                        if simplified_ring[0] != simplified_ring[-1]:
                            simplified_ring.append(simplified_ring[0])
                        simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
                        simplified_polygon.append(simplified_ring)
                    if simplified_polygon:
                        simplified_coords.append(simplified_polygon)
        
        return {
            "type": "MultiPolygon",
            "coordinates": simplified_coords
        }
    
    return geometry


def balanced_simplify_geojson_file(input_path, output_path, tolerance=0.005, coordinate_precision=4):
    """Balanced simplification of a GeoJSON file."""
    try:
        with open(input_path, 'r') as f:
            geojson = json.load(f)
        
        original_size = os.path.getsize(input_path)
        
        # Simplify each feature
        for feature in geojson["features"]:
            if "geometry" in feature and feature["geometry"]:
                feature["geometry"] = balanced_simplify_geometry(
                    feature["geometry"], 
                    tolerance, 
                    coordinate_precision
                )
        
        # Write balanced version with minimal whitespace
        with open(output_path, 'w') as f:
            json.dump(geojson, f, separators=(',', ':'))
        
        new_size = os.path.getsize(output_path)
        reduction = (1 - new_size / original_size) * 100
        
        print(f"Balanced {os.path.basename(input_path)}: {original_size:,} -> {new_size:,} bytes ({reduction:.1f}% reduction)")
        
        return True
    
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False


def main():
    input_dir = "../data/geojson/original"
    output_dir = "../data/geojson/balanced"
    
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Get all GeoJSON files
    geojson_files = list(Path(input_dir).glob("*.geojson"))
    
    print(f"Balanced simplification of {len(geojson_files)} GeoJSON files...")
    print("Target: Better coverage while maintaining reasonable file sizes\n")
    
    total_original = 0
    total_simplified = 0
    
    for input_file in sorted(geojson_files):
        output_file = Path(output_dir) / input_file.name
        
        original_size = input_file.stat().st_size
        total_original += original_size
        
        success = balanced_simplify_geojson_file(
            str(input_file), 
            str(output_file),
            tolerance=0.002,  # Less aggressive - ~200m tolerance
            coordinate_precision=4  # 4 decimal places (~11m precision)
        )
        
        if success:
            new_size = output_file.stat().st_size
            total_simplified += new_size
    
    overall_reduction = (1 - total_simplified / total_original) * 100
    print(f"\nOverall: {total_original:,} -> {total_simplified:,} bytes ({overall_reduction:.1f}% reduction)")
    print(f"Total size: {total_simplified / (1024*1024):.1f} MB")
    print(f"Average file size: {total_simplified / len(geojson_files) / 1024:.1f} KB")


if __name__ == "__main__":
    main()