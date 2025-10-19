import Image from 'next/image';

export default function Header() {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <a href="https://victorygarden.ai" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', lineHeight: 0 }}>
          <Image
            src="/logo.png"
            alt="Victory Garden Logo"
            width={60}
            height={60}
            priority
          />
        </a>
        <h1 style={{ margin: 0 }}>USDA Plant Hardiness Zone Map</h1>
      </div>
      <p>Interactive map showing USDA plant hardiness zones across the United States</p>
    </div>
  );
}