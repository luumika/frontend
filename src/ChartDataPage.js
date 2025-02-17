import React, { useState, useEffect } from 'react';
import LineChart from "../components/LineChart"; // Import der Chart-Komponente


const DataVisualization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          scenario_names: ["scenario1", "scenario2", "scenario3"],
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
    <div>
      <h1>Data Visualization</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <LineChart data={data} />}
    </div>
  );
};

export default DataVisualization;
