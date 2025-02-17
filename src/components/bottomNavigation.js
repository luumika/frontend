import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchemaIcon from '@mui/icons-material/Schema';
import InsightsIcon from '@mui/icons-material/Insights';

function BottomNavigationBar() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  const handleNavigationChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate('/');
    } else if (newValue === 1) {
      navigate('/chart-data');
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleNavigationChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        zIndex: 1000,
        borderTop: 'none',
        backgroundColor: 'white',
      }}
    >
      <BottomNavigationAction label="Modell" icon={<SchemaIcon />} />
      <BottomNavigationAction label="Results" icon={<InsightsIcon />} />
    </BottomNavigation>
  );
}

export default BottomNavigationBar;
