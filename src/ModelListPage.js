import React, { useEffect, useState } from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import LocalStorageViewer from "../components/LocalStorageViewer";


function ModelListPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("useEffect wurde ausgelöst");

    fetch('http://localhost:5001/api/multiple-collections')
      .then(response => {
        console.log("Fetch erfolgreich:", response.ok);
        return response.json();
      })
      .then(data => {
        console.log("Daten abgerufen:", data);

        // Daten von mehreren Collections in ein Array umwandeln
        const combinedData = Object.entries(data).map(([collectionName, items]) =>
          items.map(item => ({ ...item, collectionName }))
        ).flat();

        setData(combinedData);
      })
      .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Drag-and-Drop Page
        <LocalStorageViewer />
      </Typography>
    </Box>
  );
}

export default ModelListPage;
