import React, { useEffect, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DevicesIcon from '@mui/icons-material/Devices';
import AddDialog from '../components/addDialog';

function ModelListPage() {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [dialogContent, setDialogContent] = useState('');

  useEffect(() => {
    console.log("useEffect wurde ausgelöst");

    fetch('http://localhost:5001/api/multiple-collections')
      .then(response => response.json())
      .then(data => {
        console.log("Daten abgerufen:", data);
        const combinedData = Object.entries(data).map(([collectionName, items]) =>
          items.map(item => ({ ...item, collectionName }))
        ).flat();
        setData(combinedData);
      })
      .catch(error => console.error('Fehler beim Abrufen der Daten:', error));
  }, []);

  const handleOpenDialog = (content) => {
    setDialogContent(content);

    if (content === 'Gerät') {
      const devices = data.filter(item => item.collectionName === 'Devices.public');
      setFilteredData(devices);
    } else if (content === 'Umfeld') {
      const environments = data.filter(item => item.collectionName === 'Environments.public');
      setFilteredData(environments);
    }

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="50vh">
      <Box display="flex" gap={4}>
        <IconButton onClick={() => handleOpenDialog('Umfeld')} sx={{ fontSize: 50 }}>
          <HomeIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => handleOpenDialog('Gerät')} sx={{ fontSize: 50 }}>
          <DevicesIcon fontSize="large" />
        </IconButton>
      </Box>

      <AddDialog
        open={dialogOpen}
        content={dialogContent}
        onClose={handleCloseDialog}
        data={filteredData}
      />
    </Box>
  );
}

export default ModelListPage;
