import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, Container, Toolbar, AppBar, Typography } from '@mui/material';
import ModelListPage from './pages/ModelListPage';
import EnvironmentDetailPage from './pages/EnvironmentDetailPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import Sidebar from './components/sidebar';
import AddSpeedDial from './components/addSpeedDial';
import ChartDataPage from './pages/ChartDataPage';
import ModelPage from './pages/ModelPage';



function App() {


  //Data
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({
    environment: [],
    devices: [],
  });
  

  const fetchData = useCallback(() => {
    fetch('http://localhost:5001/api/multiple-collections')
      .then((response) => response.json())
      .then((fetchedData) => {
        setData(fetchedData);
      })
      .catch((err) => {
        console.error('Fehler beim Abrufen der Daten:', err);
        setError('Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //loading config and initializing selectedItems
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('selectedItems')) || {};
    setSelectedItems(savedConfig);
  }, []);

  //Sidebar
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'white',
            boxShadow: 'none',  // Schatten entfernen
            borderBottom: 'none',  // Linie entfernen
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap sx={{ color: '#C2D9A0' }}>
              GreenNode
            </Typography>
          </Toolbar>
        </AppBar>

        <Sidebar onDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} />

        <AddSpeedDial data={data} />

        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8  // Grau für den Hintergrund der Seiten
 }}>
          <Container   sx={{
            backgroundColor: '#F2F2F2', // Weiß für den inneren Bereich 
            borderRadius: 15,
            padding: 4, // Falls du noch mehr Abstand möchtest
          }}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Routes>
              <Route path="/" element={<ModelListPage />} />
              <Route
                path="/environment/:id"
                element={<EnvironmentDetailPage data={data['Environments.public']} />}
              />
              <Route
                path="/devices/:id"
                element={<DeviceDetailPage data={data['Devices.public']} />}
              />
              <Route path="/chart-data" element={<ChartDataPage />} />
              <Route path="/model" element={<ModelPage data={data} />} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
