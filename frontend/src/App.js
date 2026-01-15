import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Redirect to static site
    window.location.href = '/static-site.html';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#060606',
      color: '#fff',
      fontFamily: 'system-ui'
    }}>
      <p>Завантаження...</p>
    </div>
  );
}

export default App;
