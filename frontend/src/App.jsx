import React from 'react';
import LandingPage from './components/LandingPage';
import OwnerForm from './components/OwnerForm';
import MapDashboard from './components/MapDashboard';
import OwnerStatusDashboard from './components/OwnerStatusDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Day 4 Landing Page */}
      <LandingPage />

      {/* Existing Owner Form + Map */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">

        <section id="owner-form">
          <OwnerForm />
        </section>

        <MapDashboard />

      </main>

      {/* Owner Status Dashboard */}
      <OwnerStatusDashboard />

    </div>
  );
}