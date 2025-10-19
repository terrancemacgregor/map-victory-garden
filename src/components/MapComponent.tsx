'use client';

import { useEffect, useRef, useState } from 'react';
import { zoneData } from '@/lib/zoneData';

declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  onZoneToggle: (zone: string, checked: boolean) => void;
  onZoneStatusChange: (zone: string, status: { loading: boolean; error: string | null }) => void;
  zipMarker?: { lat: number; lon: number; zone: string; displayName: string } | null;
}

export default function MapComponent({ onZoneToggle, onZoneStatusChange, zipMarker }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const zoneLayersRef = useRef<Record<string, any>>({});
  const zipMarkerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(4);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapRef.current).setView([39.8283, -98.5795], 4);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);

        // Add zoom level tracking
        mapInstanceRef.current.on('zoomend', () => {
          setZoomLevel(mapInstanceRef.current.getZoom());
        });

        setLoading(false);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (zipMarker && mapInstanceRef.current && window.L) {
      if (zipMarkerRef.current) {
        mapInstanceRef.current.removeLayer(zipMarkerRef.current);
      }

      const zoneInfo = zoneData.find(z => z.zone === zipMarker.zone);
      zipMarkerRef.current = window.L.marker([zipMarker.lat, zipMarker.lon])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<strong>ZIP Code</strong><br>Zone ${zipMarker.zone.toUpperCase()}<br>${zoneInfo?.title || ''}`)
        .openPopup();

      mapInstanceRef.current.setView([zipMarker.lat, zipMarker.lon], 8);
    }
  }, [zipMarker]);

  const loadZoneGeoJSON = async (zone: string) => {
    onZoneStatusChange(zone, { loading: true, error: null });

    try {
      const response = await fetch(`/geojson/balanced/zone_${zone}.geojson`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load zone ${zone}`);
      }
      
      const geojson = await response.json();
      onZoneStatusChange(zone, { loading: false, error: null });
      return geojson;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onZoneStatusChange(zone, { loading: false, error: errorMessage });
      return null;
    }
  };

  const toggleZone = async (zone: string, checked: boolean) => {
    if (!mapInstanceRef.current || !window.L) return;

    if (checked) {
      if (!zoneLayersRef.current[zone]) {
        const geojson = await loadZoneGeoJSON(zone);
        if (geojson) {
          const zoneInfo = zoneData.find(z => z.zone === zone);
          
          try {
            zoneLayersRef.current[zone] = window.L.geoJSON(geojson, {
              style: {
                fillColor: zoneInfo?.color,
                weight: 2,
                opacity: 1,
                color: '#333',
                fillOpacity: 0.7
              },
              onEachFeature: function(feature: any, layer: any) {
                layer.bindPopup(`
                  <strong>Zone ${feature.properties.zone.toUpperCase()}</strong><br>
                  ${feature.properties.title}<br>
                  Temperature Range: ${feature.properties.temperature_range}°F
                `);
              }
            }).addTo(mapInstanceRef.current);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            onZoneStatusChange(zone, { loading: false, error: `Error adding to map: ${errorMessage}` });
          }
        }
      } else {
        mapInstanceRef.current.addLayer(zoneLayersRef.current[zone]);
      }
    } else {
      if (zoneLayersRef.current[zone]) {
        mapInstanceRef.current.removeLayer(zoneLayersRef.current[zone]);
      }
      onZoneStatusChange(zone, { loading: false, error: null });
    }
  };

  useEffect(() => {
    (window as any).toggleZoneFromMap = toggleZone;
  }, []);

  return (
    <div className="map-container">
      {loading && (
        <div className="loading">
          Loading map and zone data...
        </div>
      )}
      <div ref={mapRef} id="map" style={{ height: '100%', width: '100%' }} />
      <div className="zoom-indicator">
        Zoom Level: {zoomLevel}
      </div>
    </div>
  );
}