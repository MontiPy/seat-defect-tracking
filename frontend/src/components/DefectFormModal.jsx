// frontend/src/components/DefectFormModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DefectFormModal({
  initialPosition, // { x, y } in image coordinates
  zones,           // array of { id, name, polygon_coords }
  onSave,          // fn({ zone_id, cbu, part_id, build_event_id, noted_by })
  onCancel,        // fn()
}) {
  const [zoneId, setZoneId]               = useState(zones.length ? zones[0].id : '');
  const [cbu, setCbu]                     = useState('');
  const [partId, setPartId]               = useState('');
  const [buildEventId, setBuildEventId]   = useState('');
  const [notedBy, setNotedBy]             = useState('');
  const [parts, setParts]                 = useState([]);
  const [buildEvents, setBuildEvents]     = useState([]);
  const [loadingMeta, setLoadingMeta]     = useState(true);

  // Fetch parts and build events for dropdowns
  useEffect(() => {
    Promise.all([
      api.get('/parts'),
      api.get('/build-events'),
    ])
    .then(([partsRes, eventsRes]) => {
      setParts(partsRes.data);
      setBuildEvents(eventsRes.data);
    })
    .catch(err => {
      console.error('Failed to load metadata', err);
    })
    .finally(() => {
      setLoadingMeta(false);
    });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      zone_id:        zoneId,
      cbu,
      part_id:        partId,
      build_event_id: buildEventId,
      noted_by:       notedBy,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Add Defect</h2>
        <p className="text-sm text-gray-600 mb-4">
          Position: ({Math.round(initialPosition.x)}, {Math.round(initialPosition.y)})
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zone */}
          <div>
            <label className="block text-sm font-medium mb-1">Zone</label>
            <select
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
              className="w-full border rounded px-2 py-1"
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          {/* CBU */}
          <div>
            <label className="block text-sm font-medium mb-1">CBU</label>
            <input
              type="text"
              value={cbu}
              onChange={e => setCbu(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>

          {/* Seat Part Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Seat Part Number</label>
            {loadingMeta ? (
              <p>Loading...</p>
            ) : (
              <select
                value={partId}
                onChange={e => setPartId(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="" disabled>Select part</option>
                {parts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.seat_part_number} — {p.description}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Build Event */}
          <div>
            <label className="block text-sm font-medium mb-1">Build Event</label>
            {loadingMeta ? (
              <p>Loading...</p>
            ) : (
              <select
                value={buildEventId}
                onChange={e => setBuildEventId(e.target.value)}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="" disabled>Select event</option>
                {buildEvents.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({new Date(ev.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Noted By */}
          <div>
            <label className="block text-sm font-medium mb-1">Noted By</label>
            <input
              type="text"
              value={notedBy}
              onChange={e => setNotedBy(e.target.value)}
              className="w-full border rounded px-2 py-1"
              placeholder="Your name"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
