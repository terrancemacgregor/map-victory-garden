'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TabNavigation from '@/components/TabNavigation';
import MapComponent from '@/components/MapComponent';
import ZipLookup from '@/components/ZipLookup';
import ZoneList from '@/components/ZoneList';
import Legend from '@/components/Legend';
import DetailsTab from '@/components/DetailsTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('map');
  const [zoneStatuses, setZoneStatuses] = useState<Record<string, { loading: boolean; error: string | null }>>({});
  const [zipMarker, setZipMarker] = useState<{ lat: number; lon: number; zone: string; displayName: string } | null>(null);
  const [checkedZones, setCheckedZones] = useState<Record<string, boolean>>({});

  const handleZoneToggle = (zone: string, checked: boolean) => {
    if (typeof window !== 'undefined' && (window as any).toggleZoneFromMap) {
      (window as any).toggleZoneFromMap(zone, checked);
    }
  };

  const handleZoneStatusChange = (zone: string, status: { loading: boolean; error: string | null }) => {
    setZoneStatuses(prev => ({ ...prev, [zone]: status }));
  };

  const handleZipFound = (lat: number, lon: number, zone: string, displayName: string) => {
    setZipMarker({ lat, lon, zone, displayName });
  };

  const handleZoneCheck = (zone: string, checked: boolean) => {
    setCheckedZones(prev => ({ ...prev, [zone]: checked }));
  };

  return (
    <>
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="main-content">
        {activeTab === 'map' && (
          <div className="tab-content active">
            <div className="sidebar">
              <h1>Hardiness Zones</h1>
              
              <ZipLookup 
                onZipFound={handleZipFound} 
                onZoneToggle={(zone, checked) => {
                  handleZoneCheck(zone, checked);
                  handleZoneToggle(zone, checked);
                }}
              />
              <ZoneList 
                onZoneToggle={handleZoneToggle}
                zoneStatuses={zoneStatuses}
                checkedZones={checkedZones}
                onZoneCheck={handleZoneCheck}
              />
              <Legend />
            </div>

            <MapComponent 
              onZoneToggle={handleZoneToggle}
              onZoneStatusChange={handleZoneStatusChange}
              zipMarker={zipMarker}
            />
          </div>
        )}

        {activeTab === 'details' && (
          <div className="tab-content active">
            <DetailsTab />
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
}