#!/usr/bin/env python3
"""
Ultra-aggressive GeoJSON simplification to get files under 100KB each.
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


def ultra_simplify_coordinates(coordinates, tolerance=0.01):
    """Ultra-aggressive coordinate simplification."""
    if len(coordinates) <= 3:
        return coordinates
    
    # Apply Douglas-Peucker algorithm
    simplified = douglas_peucker(coordinates, tolerance)
    
    # Ensure we have at least 4 points for a valid polygon (including closure)
    if len(simplified) < 4:
        # Keep first, middle, and last points, plus closure
        if len(coordinates) >= 4:
            mid_index = len(coordinates) // 2
            simplified = [coordinates[0], coordinates[mid_index], coordinates[-2], coordinates[-1]]
        else:
            simplified = coordinates
    
    # Ensure polygon is closed
    if simplified[0] != simplified[-1]:
        simplified[-1] = simplified[0]
    
    return simplified


def round_coordinates(coordinates, precision=3):
    """Round coordinates to specified decimal places."""
    if isinstance(coordinates[0], list):
        return [round_coordinates(coord, precision) for coord in coordinates]
    else:
        return [round(coord, precision) for coord in coordinates]


def ultra_simplify_geometry(geometry, tolerance=0.01, coordinate_precision=3):
    """Ultra-aggressively simplify a GeoJSON geometry."""
    if geometry["type"] == "Polygon":
        simplified_coords = []
        for ring in geometry["coordinates"]:
            simplified_ring = ultra_simplify_coordinates(ring, tolerance)
            simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
            # Only keep rings with at least 4 points
            if len(simplified_ring) >= 4:
                simplified_coords.append(simplified_ring)
        
        # If we lost all rings, keep the outer ring with minimal points
        if not simplified_coords and geometry["coordinates"]:
            ring = geometry["coordinates"][0]
            if len(ring) >= 4:
                # Keep every nth point to ensure we have a basic shape
                step = max(1, len(ring) // 20)  # Keep ~20 points max
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
        
        # Only keep the largest polygons to reduce complexity
        polygon_sizes = []
        for i, polygon in enumerate(geometry["coordinates"]):
            if polygon and polygon[0]:  # Check if polygon has coordinates
                size = len(polygon[0])  # Size of outer ring
                polygon_sizes.append((size, i, polygon))
        
        # Sort by size and keep only the largest ones
        polygon_sizes.sort(key=lambda x: x[0], reverse=True)
        max_polygons = min(5, len(polygon_sizes))  # Keep at most 5 polygons
        
        for _, _, polygon in polygon_sizes[:max_polygons]:
            simplified_polygon = []
            for ring in polygon:
                simplified_ring = ultra_simplify_coordinates(ring, tolerance)
                simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
                if len(simplified_ring) >= 4:
                    simplified_polygon.append(simplified_ring)
            
            if simplified_polygon:
                simplified_coords.append(simplified_polygon)
        
        # If no polygons survived, create a minimal one
        if not simplified_coords and geometry["coordinates"]:
            for polygon in geometry["coordinates"]:
                if polygon and polygon[0] and len(polygon[0]) >= 4:
                    ring = polygon[0]
                    step = max(1, len(ring) // 10)  # Keep ~10 points max
                    simplified_ring = ring[::step]
                    if simplified_ring[0] != simplified_ring[-1]:
                        simplified_ring.append(simplified_ring[0])
                    simplified_ring = round_coordinates(simplified_ring, coordinate_precision)
                    simplified_coords.append([simplified_ring])
                    break
        
        return {
            "type": "MultiPolygon",
            "coordinates": simplified_coords
        }
    
    return geometry


def ultra_simplify_geojson_file(input_path, output_path, tolerance=0.01, coordinate_precision=3):
    """Ultra-aggressively simplify a GeoJSON file."""
    try:
        with open(input_path, 'r') as f:
            geojson = json.load(f)
        
        original_size = os.path.getsize(input_path)
        
        # Simplify each feature
        for feature in geojson["features"]:
            if "geometry" in feature and feature["geometry"]:
                feature["geometry"] = ultra_simplify_geometry(
                    feature["geometry"], 
                    tolerance, 
                    coordinate_precision
                )
        
        # Write ultra-simplified version with minimal whitespace
        with open(output_path, 'w') as f:
            json.dump(geojson, f, separators=(',', ':'))
        
        new_size = os.path.getsize(output_path)
        reduction = (1 - new_size / original_size) * 100
        
        print(f"Ultra-simplified {os.path.basename(input_path)}: {original_size:,} -> {new_size:,} bytes ({reduction:.1f}% reduction)")
        
        return True
    
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False


def main():
    input_dir = "../data/geojson/original"
    output_dir = "../data/geojson/ultra"
    
    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)
    
    # Get all GeoJSON files
    geojson_files = list(Path(input_dir).glob("*.geojson"))
    
    print(f"Ultra-simplifying {len(geojson_files)} GeoJSON files...")
    print("Target: <100KB per file\n")
    
    total_original = 0
    total_simplified = 0
    
    for input_file in sorted(geojson_files):
        output_file = Path(output_dir) / input_file.name
        
        original_size = input_file.stat().st_size
        total_original += original_size
        
        success = ultra_simplify_geojson_file(
            str(input_file), 
            str(output_file),
            tolerance=0.02,  # Very aggressive - ~2km tolerance
            coordinate_precision=3  # 3 decimal places (~111m precision)
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