import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export default function ParetoChartScreen() {
  const { projectId } = useParams();
  const [buildEvents, setBuildEvents] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedParts, setSelectedParts] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    api.get('/build-events').then(res => setBuildEvents(res.data));
    api.get('/parts').then(res => setParts(res.data));
  }, []);

  useEffect(() => {
    const params = { project_id: projectId };
    if (selectedEvent) params.build_event_id = selectedEvent;
    if (selectedParts.length) params.part_ids = selectedParts.join(',');
    api.get('/defects/summary', { params }).then(res => setSummary(res.data));
  }, [projectId, selectedEvent, selectedParts]);

  const labels = summary.map(r => r.defect_type_name || r.defect_type_id);
  const counts = summary.map(r => r.count);
  const total = counts.reduce((a, b) => a + b, 0);
  let cum = 0;
  const cumulative = counts.map(c => {
    cum += c;
    return +(cum / total * 100).toFixed(2);
  });

  const data = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Count',
        data: counts,
        backgroundColor: 'rgba(75,192,192,0.5)',
      },
      {
        type: 'line',
        label: 'Cumulative %',
        data: cumulative,
        borderColor: 'red',
        backgroundColor: 'red',
        yAxisID: 'y2',
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      y: { beginAtZero: true },
      y2: {
        beginAtZero: true,
        max: 100,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { callback: v => `${v}%` },
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Pareto of Defects</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="event-label">Event</InputLabel>
          <Select
            labelId="event-label"
            label="Event"
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {buildEvents.map(ev => (
              <MenuItem key={ev.id} value={ev.id}>{ev.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="parts-label">Parts</InputLabel>
          <Select
            multiple
            labelId="parts-label"
            label="Parts"
            value={selectedParts}
            onChange={e => setSelectedParts(e.target.value)}
            input={<OutlinedInput label="Parts" />}
            renderValue={selected => selected.map(id => {
              const p = parts.find(pt => pt.id === id);
              return p ? p.seat_part_number : id;
            }).join(', ')}
          >
            {parts.map(p => (
              <MenuItem key={p.id} value={p.id}>
                <Checkbox checked={selectedParts.indexOf(p.id) > -1} />
                <ListItemText primary={p.seat_part_number} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Bar data={data} options={options} />
    </Box>
  );
}

