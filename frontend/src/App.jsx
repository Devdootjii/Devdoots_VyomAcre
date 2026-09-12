import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  const [ownerData, setOwnerData] = useState(() => {
    try {
      const savedOwnerData = localStorage.getItem('vyomacre_owner_data');
      if (savedOwnerData) {
        return JSON.parse(savedOwnerData);
      }
      return null;
    } catch (error) {
      console.error('Failed to load owner data from localStorage:', error);
      return null;
    }
  });

  useEffect(() => {
    if (ownerData) {
      localStorage.setItem('vyomacre_owner_data', JSON.stringify(ownerData));
    }
  }, [ownerData]);

  const handleOwnerSubmitSuccess = (submittedData) => {
    setOwnerData({
      ...submittedData,
      status: 'Pending'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingPage />
      <main className="grid grid-cols-1 gap-8 md:grid-cols-2 p-4">
        <OwnerForm onSubmitSuccess={handleOwnerSubmitSuccess} />
        <MapDashboard />
      </main>
      <OwnerStatusDashboard ownerData={ownerData} />
    </div>
  );
}