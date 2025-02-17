import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


function SimulateDialog({ open, onClose, onSimulate }) {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const navigate = useNavigate();

  const generateRandomName = () => {
    return `scenario_${Math.random().toString(36).substring(2, 8)}`;
  };

  const handleSimulate = async () => {
    const duration = {
      days: parseInt(days),
      hours: parseInt(hours),
      minutes: parseInt(minutes),
    };


    const scenarioNames = Array.from({ length: 3 }, generateRandomName);

    try {
      const promises = scenarioNames.map((name) =>
        fetch('http://127.0.0.1:8000/simulate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario_name: name,
            system_id: "string",
            states_values: "default",
            duration: duration,
          }),
        })
      );

      // Warte auf alle API-Antworten
      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map((res) => res.json()));

      console.log('API-Antworten:', results);

 
      navigate('/chart-data', { state: { scenarioNames } });
    } catch (error) {
      console.error('Fehler bei den API-Aufrufen:', error);
    } finally {
      onClose(); 
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Simulation starten</DialogTitle>
      <DialogContent>
        <TextField
          label="Tage"
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Stunden"
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Minuten"
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSimulate} color="primary">
          Starten
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SimulateDialog;