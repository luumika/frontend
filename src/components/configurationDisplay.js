import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box } from '@mui/material';

function ConfigurationDisplayPage() {
  const [selectedItems, setSelectedItems] = useState({
    environment: [],
    devices: [],
    users: [],
  });

  useEffect(() => {
    const loadSelectedItems = () => {
      const savedItems = JSON.parse(localStorage.getItem('selectedItems')) || {
        environment: [],
        devices: [],
        users: [],
      };
      setSelectedItems(savedItems);
    };

    // Initial laden
    loadSelectedItems();

    const handleStorageChange = () => {
      loadSelectedItems();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Konfiguration anzeigen</Typography>
      {Object.keys(selectedItems).map((category) => (
        <div key={category}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Typography>
          {selectedItems[category].length > 0 ? (
            selectedItems[category].map((item, index) => (
              <Paper key={index} elevation={2} sx={{ p: 2, my: 1 }}>
                <Typography>
                  {item.Name || item.username || item.deviceType || 'Unbenanntes Element'}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body1">Keine Daten in {category}.</Typography>
          )}
        </div>
      ))}
    </Box>
  );
}

export default ConfigurationDisplayPage;
