import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DevicesIcon from '@mui/icons-material/Devices';
import HomeIcon from '@mui/icons-material/Home';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import AddDialog from './addDialog';
import SimulateDialog from './SimulateDialog'; // Importiere den neuen Dialog
import { useNavigate } from 'react-router-dom'; // Importiere useNavigate für die Weiterleitung
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';


function AddSpeedDial({ data }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const navigate = useNavigate();;

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSimulate = (duration) => {
    const scenarios = ['scenario1', 'scenario2', 'scenario3'];

    // Führe die API-Aufrufe durch
    scenarios.forEach((scenario) => {
      fetch('http://127.0.0.1:8000/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_name: scenario,
          system_id: "string",
          states_values: "default",
          duration: duration,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(`Simulation für ${scenario} erfolgreich:`, data);
        })
        .catch((error) => {
          console.error(`Fehler bei der Simulation für ${scenario}:`, error);
        });
    });

    navigate('/next-page', { state: { scenarios } });
  };

  const actions = [
    { icon: <PermDataSettingIcon />, name: 'Konfiguration', content: 'Gerät' },
    { icon: <PlayCircleOutlineIcon />, name: 'Simulation starten', content: 'Simulation' },
  ];

  return (
    <>
      <SpeedDial
        ariaLabel="Neues Element hinzufügen"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          '& .MuiFab-primary': {
            bgcolor: '#C2D9A0', 
            '&:hover': {
              bgcolor: '#72A603', 
            },
          },
        }}
        icon={<SpeedDialIcon openIcon={<AddIcon />} />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={<Typography variant="subtitle1">{action.name}</Typography>}
            onClick={() => {
              if (action.content === 'Simulation') {
                setSimulateDialogOpen(true);
              } else {
                navigate('/');
              }
            }}
          />
        ))}
      </SpeedDial>

      <AddDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        data={filteredData}
      />

      <SimulateDialog
        open={simulateDialogOpen}
        onClose={() => setSimulateDialogOpen(false)}
        onSimulate={handleSimulate}
      />
    </>
  );
}

export default AddSpeedDial;