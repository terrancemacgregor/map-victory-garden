'use client';

import { useState } from 'react';
import { zoneData } from '@/lib/zoneData';

interface ZoneListProps {
  onZoneToggle: (zone: string, checked: boolean) => void;
  zoneStatuses: Record<string, { loading: boolean; error: string | null }>;
  checkedZones: Record<string, boolean>;
  onZoneCheck: (zone: string, checked: boolean) => void;
}

export default function ZoneList({ onZoneToggle, zoneStatuses, checkedZones, onZoneCheck }: ZoneListProps) {
  const handleZoneChange = (zone: string) => {
    const newChecked = !checkedZones[zone];
    onZoneCheck(zone, newChecked);
    onZoneToggle(zone, newChecked);
  };

  const showAllZones = () => {
    zoneData.forEach(zone => {
      onZoneCheck(zone.zone, true);
      onZoneToggle(zone.zone, true);
    });
  };

  const hideAllZones = () => {
    zoneData.forEach(zone => {
      onZoneCheck(zone.zone, false);
      onZoneToggle(zone.zone, false);
    });
  };

  return (
    <>
      <div className="controls">
        <button className="control-button" onClick={showAllZones}>
          Show All
        </button>
        <button className="control-button secondary" onClick={hideAllZones}>
          Hide All
        </button>
      </div>

      <ul className="zone-list">
        {zoneData.map(zone => (
          <li key={zone.zone} className="zone-item">
            <label className="zone-checkbox">
              <input
                type="checkbox"
                checked={checkedZones[zone.zone] || false}
                onChange={() => handleZoneChange(zone.zone)}
              />
              <span className="zone-label">
                <span className="color-swatch" style={{ backgroundColor: zone.color }} />
                <span>Zone {zone.zone.toUpperCase()}</span>
                <span className="hex-code">{zone.color}</span>
              </span>
            </label>
            <div className="zone-temp">{zone.title}</div>
            {zoneStatuses[zone.zone]?.loading && (
              <div className="zone-loading">Loading...</div>
            )}
            {zoneStatuses[zone.zone]?.error && (
              <div className="zone-error">{zoneStatuses[zone.zone].error}</div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}