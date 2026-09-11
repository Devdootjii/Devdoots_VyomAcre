import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  // Load previously submitted owner data from localStorage
  const [ownerData, setOwnerData] = useState(() => {
    try {
      const savedOwnerData = localStorage.getItem(
        'vyomacre_owner_data'
      );

      if (savedOwnerData) {
        return JSON.parse(savedOwnerData);
      }

      return null;
    } catch (error) {
      console.error(
        'Failed to load owner data from localStorage:',
        error
      );

      return null;
    }
  });

  // Save owner data whenever it changes
  useEffect(() => {
    console.log('OWNER DATA:', ownerData);

    if (ownerData) {
      localStorage.setItem(
        'vyomacre_owner_data',
        JSON.stringify(ownerData)
      );
    }
  }, [ownerData]);

  // Called after OwnerForm successfully submits
  const handleOwnerSubmitSuccess = (submittedData) => {
    console.log(
      'OWNER SUBMISSION RECEIVED:',
      submittedData
    );

    setOwnerData({
      ...submittedData,
      status: 'Pending'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Landing Page */}
      <LandingPage />

      {/* Main Content */}
      <main className="grid grid-cols-1 gap-8 md:grid-cols-2">

        {/* Owner Form */}
        <OwnerForm
          onSubmitSuccess={handleOwnerSubmitSuccess}
        />

        {/* Map */}
        <MapDashboard />

      </main>

      {/* Temporary Data Test Box */}
      <div className="mx-8 my-6 rounded-xl border-2 border-yellow-400 bg-yellow-100 p-5 text-xl font-bold text-black">
        TEST OWNER DATA:{' '}
        {ownerData?.owner_name || 'NO DATA'}
      </div>

      {/* Owner Status Dashboard */}
      <OwnerStatusDashboard
        ownerData={ownerData}
      />

    </div>
  );
}