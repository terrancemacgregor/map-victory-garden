'use client';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="tab-container">
      <button
        className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
        onClick={() => onTabChange('map')}
      >
        Map
      </button>
      <button
        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
        onClick={() => onTabChange('details')}
      >
        Details
      </button>
    </div>
  );
}