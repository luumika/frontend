import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import iconMapping from './iconMapping';

const drawerWidth = 240;

function Sidebar({ onDrawerToggle, mobileOpen }) {
  const [selectedItems, setSelectedItems] = useState({
    environment: [],
    devices: [],
    users: [],
  });

  const loadSelectedItems = () => {
    const savedItems = JSON.parse(localStorage.getItem('selectedItems')) || {
      environment: [],
      devices: [],
      users: [],
    };
    setSelectedItems(savedItems);
  };

  useEffect(() => {
    loadSelectedItems();

    const handleLocalStorageUpdate = () => {
      loadSelectedItems();
    };

    window.addEventListener('localStorageUpdate', handleLocalStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdate', handleLocalStorageUpdate);
    };
  }, []);

  const categoryMapping = {
    Umfeld: 'environment',
    Gerät: 'devices',
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        p: 2,
        marginTop: '64px', 
      }}
    >
      {Object.values(selectedItems).every((items) => items.length === 0) ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
          Wähle deine Konfiguration aus.
        </Typography>
      ) : (
        Object.keys(selectedItems).map((category, index) => (
          <React.Fragment key={category}>
            {selectedItems[category].length > 0 && (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ mt: 2, mb: 1, fontWeight: 'bold', fontSize: '1rem' }}
                >
                  <span style={{ marginRight: '8px' }}>
                      {iconMapping[category]}
                  </span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                {selectedItems[category].map((item) => (
                  <Box
                    key={item._id}
                    component={Link}
                    to={`/${categoryMapping[category]}/${item._id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'text.primary',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      mb: 1,
                      p: 1,
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#C2D9A0',
                        color: '#000',
                      },
                      transition: 'background-color 0.3s, color 0.3s',
                    }}
                  >
                    <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                      {iconMapping[item.icon] || iconMapping.default}
                    </span>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.Name || 'Unbenannt'}
                    </Typography>
                  </Box>
                ))}
                {index < Object.keys(selectedItems).length - 1 && <Divider sx={{ my: 2 }} />}
              </>
            )}
          </React.Fragment>
        ))
      )}
    </Box>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#C2D9A0', 
          borderTopRightRadius: '50px', 
          marginTop: '64px', 
          border: 'none',
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
}

export default Sidebar;
