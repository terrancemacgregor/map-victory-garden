'use client';

import { useState } from 'react';

interface ZipLookupProps {
  onZipFound: (lat: number, lon: number, zone: string, displayName: string) => void;
  onZoneToggle: (zone: string, checked: boolean) => void;
}

export default function ZipLookup({ onZipFound, onZoneToggle }: ZipLookupProps) {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; type: string } | null>(null);

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setZipCode(value);
  };

  const showResult = (message: string, type: string) => {
    setResult({ message, type });
  };

  const isPointInPolygon = (point: [number, number], polygon: number[][]) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  const isPointInGeometry = (point: [number, number], geometry: any) => {
    if (geometry.type === 'Polygon') {
      return isPointInPolygon(point, geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        if (isPointInPolygon(point, polygon[0])) {
          return true;
        }
      }
    }
    return false;
  };

  const findZoneForPoint = async (lat: number, lon: number) => {
    const zoneOrder = ['3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b', '11a', '11b', '12a'];

    console.log('[ZipLookup] Finding zone for point:', { lat, lon });

    for (const zone of zoneOrder) {
      try {
        console.log(`[ZipLookup] Checking zone ${zone}...`);
        const response = await fetch(`/geojson/balanced/zone_${zone}.geojson`);
        if (response.ok) {
          const geojson = await response.json();
          for (const feature of geojson.features) {
            if (isPointInGeometry([lon, lat], feature.geometry)) {
              console.log(`[ZipLookup] Found zone: ${zone}`);
              return zone;
            }
          }
        }
      } catch (error) {
        console.error(`[ZipLookup] Error loading zone ${zone}:`, error);
      }
    }
    console.log('[ZipLookup] No zone found for point');
    return null;
  };

  const handleLookup = async () => {
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      showResult('Please enter a valid 5-digit ZIP code', 'error');
      return;
    }

    console.log('[ZipLookup] Looking up ZIP code:', zipCode);
    setLoading(true);
    showResult('Looking up ZIP code...', 'loading');

    try {
      const response = await fetch(`/api/geocode?zip=${zipCode}`);

      console.log('[ZipLookup] Geocode API response status:', response.status);

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      console.log('[ZipLookup] Geocode API returned:', data);

      if (data.length === 0) {
        showResult('ZIP code not found. Please check and try again.', 'error');
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const displayName = data[0].display_name;

      const zone = await findZoneForPoint(lat, lon);

      if (zone) {
        const zoneTitle = `Zone ${zone.toUpperCase()}`;
        showResult(
          `${zipCode} is in <strong>${zoneTitle}</strong><br><small>${displayName.split(',').slice(0, 3).join(', ')}</small>`,
          'success'
        );
        onZipFound(lat, lon, zone, displayName);
        
        // Auto-select and show the zone on the map
        onZoneToggle(zone, true);
      } else {
        showResult(
          `${zipCode} located, but zone could not be determined. The location might be outside the continental US.`,
          'error'
        );
      }
    } catch (error) {
      console.error('Zip lookup error:', error);
      showResult('Error looking up ZIP code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <div className="zip-lookup">
      <h3>Find Your Zone</h3>
      <div className="zip-input-group">
        <input
          type="text"
          className="zip-input"
          placeholder="Enter ZIP code (e.g. 90210)"
          maxLength={5}
          value={zipCode}
          onChange={handleZipChange}
          onKeyPress={handleKeyPress}
        />
        <button
          className="zip-button"
          disabled={loading}
          onClick={handleLookup}
        >
          Find Zone
        </button>
      </div>
      {result && (
        <div
          className={`zip-result ${result.type}`}
          style={{ display: 'block' }}
          dangerouslySetInnerHTML={{ __html: result.message }}
        />
      )}
    </div>
  );
}