import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LineChart from "../components/LineChart"; 
import AreaChart from "../components/AreaChart";
import { Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


const DataVisualization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { scenarioNames } = location.state || { scenarioNames: [] };

useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario_names: scenarioNames, 
          graph_type: "stacked_bar"
        }),
        signal: signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.scenario_details);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError('Failed to fetch data: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  return () => {
    controller.abort();
  };
}, []);


  return (
    <div style={{ position: 'relative', padding: '16px' }}>

    <div style={{ position: 'absolute', top: -15, left: 10 }}>
      <Tooltip title="Interagiere mit den Diagrammen! Ziehe die Maus über einen Bereich, um ihn zu vergrößern. Mit einem Doppelklick auf die Grafik kehrst du zur Gesamtansicht zurück." arrow>
        <IconButton>
          <InfoOutlinedIcon />
        </IconButton>
      </Tooltip>
    </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <LineChart data={data} />}
      {data && <AreaChart data={data} />}
    </div>
  );
};

export default DataVisualization;
