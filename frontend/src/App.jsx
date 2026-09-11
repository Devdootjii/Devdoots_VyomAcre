import React from 'react';
import MapDashboard from './components/MapDashboard';
// Balram's forms are temporarily removed from this view to avoid UI conflicts 
// and allow focus on the B2B Marketplace task.

function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      {/* Sirf tumhara Company Marketplace render hoga */}
      <MapDashboard />
    </div>
  );
}

export default App;