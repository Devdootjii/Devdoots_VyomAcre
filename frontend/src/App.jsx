import React from 'react';
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import RoofListingForm from './components/RoofListingForm'; // 👈 Tumhara naya import yahan hai
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Day 4 Landing Page */}
      <LandingPage />

      {/* Existing Owner Form + Map */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">

        {/* 
          Maine yahan className="flex flex-col gap-8" add kiya hai, 
          taaki Ritesh aur tumhara form ek ke neeche ek perfectly align ho jaye. 
        */}
        <section id="owner-form" className="flex flex-col gap-8">
          
          {/* Ritesh ka form - Ekdum safe */}
          <OwnerForm />

          {/* Tumhara naya form yahan add kar diya */}
          <RoofListingForm />

        </section>

        <MapDashboard />

      </main>

      {/* Owner Status Dashboard */}
      <OwnerStatusDashboard />

    </div>
  );
}