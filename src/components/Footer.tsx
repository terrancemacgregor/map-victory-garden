export default function Footer() {
  return (
    <div className="footer">
      <strong>Data Source:</strong>{' '}
      <a href="https://prism.oregonstate.edu/phzm/" target="_blank" rel="noopener noreferrer">
        PRISM Climate Group, Oregon State University
      </a>{' '}
      |{' '}
      <strong>Acknowledgment:</strong> PRISM Group, Oregon State University,{' '}
      <a href="https://prism.oregonstate.edu" target="_blank" rel="noopener noreferrer">
        https://prism.oregonstate.edu
      </a>
      , data created 4 Feb 2023
    </div>
  );
}