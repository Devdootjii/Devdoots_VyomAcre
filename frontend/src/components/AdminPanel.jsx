import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [roofs, setRoofs] = useState([]);

  useEffect(() => {
    // Admin stats aur roofs fetch karne ke liye API calls
    fetch("https://devdoots-vyom-acre-y0gr.onrender.com/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.log(err));

    fetch("https://devdoots-vyom-acre-y0gr.onrender.com/api/admin/roofs")
      .then(res => res.json())
      .then(data => setRoofs(data.data || []))
      .catch(err => console.log(err));
  }, []);

  const handleStatusUpdate = (id, status) => {
    fetch(`https://devdoots-vyom-acre-y0gr.onrender.com/api/roofs/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(() => {
      alert(`Roof status updated to ${status}`);
    });
  };

  return (
    <div style={{ padding: '20px', color: '#fff', background: '#0b0f19', minHeight: '100vh' }}>
      <h1>VyomAcre Admin Dashboard</h1>
      {stats && (
        <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
          <div style={{ background: '#1f2937', padding: '15px', borderRadius: '8px' }}>Total Roofs: {stats.total_roofs}</div>
          <div style={{ background: '#1f2937', padding: '15px', borderRadius: '8px' }}>Verified: {stats.verified_count}</div>
        </div>
      )}
      <h2>Pending Roof Approvals</h2>
      <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#374151' }}>
            <th style={{ padding: '10px' }}>City</th>
            <th style={{ padding: '10px' }}>Address</th>
            <th style={{ padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roofs.map(roof => (
            <tr key={roof.id} style={{ borderBottom: '1px solid #374151' }}>
              <td style={{ padding: '10px' }}>{roof.city}</td>
              <td style={{ padding: '10px' }}>{roof.address}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleStatusUpdate(roof.id, 'APPROVED')} style={{ background: '#00FF87', color: '#000', marginRight: '10px', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => handleStatusUpdate(roof.id, 'REJECTED')} style={{ background: '#EF4444', color: '#fff', padding: '5px 10px', border: 'none', cursor: 'pointer' }}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}