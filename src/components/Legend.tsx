export default function Legend() {
  return (
    <div className="legend">
      <h3>Temperature Color Scale</h3>
      <div className="legend-item">
        <div className="legend-color" style={{ background: 'linear-gradient(to right, #0D47A1, #1976D2)' }} />
        <span>Zone 3: -40 to -30°F (Coldest)</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: 'linear-gradient(to right, #2196F3, #64B5F6)' }} />
        <span>Zone 4-5: -30 to -10°F</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: 'linear-gradient(to right, #81C784, #4CAF50)' }} />
        <span>Zone 6-7: -10 to 10°F</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: 'linear-gradient(to right, #CDDC39, #FFC107)' }} />
        <span>Zone 8-9: 10 to 30°F</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: 'linear-gradient(to right, #FF9800, #D32F2F)' }} />
        <span>Zone 10-12: 30 to 60°F (Warmest)</span>
      </div>
      <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666' }}>
        Blue = Coldest zones | Red = Warmest zones
      </div>
    </div>
  );
}