import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Typography,
  Box,
  TextField,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close'; 

function not(a, b) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

function TransferListDialog({ open, content, onClose, data, onSave }) {
  const [checked, setChecked] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Gemeinsames Suchfeld

  useEffect(() => {
    if (open) {
      const savedItems = JSON.parse(localStorage.getItem('selectedItems')) || {};
      const alreadySelected = savedItems[content] || [];
      const available = data.filter(
        (item) => !alreadySelected.some((selectedItem) => selectedItem._id === item._id)
      );

      setAvailableItems(available);
      setSelectedItems(alreadySelected);
      setSearchTerm(''); // Suchfeld zurücksetzen, wenn Dialog geöffnet wird
    }
  }, [open, content, data]);

  // Filtere die Listen basierend auf dem Suchbegriff
  const filteredAvailableItems = availableItems.filter((item) =>
    item.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSelectedItems = selectedItems.filter((item) =>
    item.Name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leftChecked = intersection(checked, filteredAvailableItems);
  const rightChecked = intersection(checked, filteredSelectedItems);

  const handleToggle = (item) => () => {
    const currentIndex = checked.indexOf(item);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(item);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setSelectedItems(selectedItems.concat(leftChecked));
    setAvailableItems(not(availableItems, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setAvailableItems(availableItems.concat(rightChecked));
    setSelectedItems(not(selectedItems, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const saveToLocalStorage = () => {
    const savedConfig = JSON.parse(localStorage.getItem('selectedItems')) || {};
    savedConfig[content] = selectedItems;
    localStorage.setItem('selectedItems', JSON.stringify(savedConfig));
    if (onSave) onSave(selectedItems);
    const event = new Event('localStorageUpdate');
    window.dispatchEvent(event);
  };

  const customList = (items, label, checkedCount) => (
    <Paper sx={{ width: '100%', maxHeight: 300, overflow: 'auto', mt: 2 }}>
      <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
        {/* Zeigt die ausgewählten Elemente im Verhältnis zur Gesamtzahl an */}
        Ausgewählt: {checkedCount}/{items.length}
      </Typography>
  
      <List dense component="div" role="list">
        {items.map((item) => {
          const labelId = `transfer-list-item-${item._id}-label`;
  
          return (
            <ListItemButton key={item._id} role="listitem" onClick={handleToggle(item)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(item)}
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    color: '#C2D9A0',
                    '&.Mui-checked': {
                      color: '#C2D9A0',
                    },
                  }}
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={item.Name || 'Unbenanntes Element'} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
    sx={{
      display: 'flex',
      justifyContent: 'space-between', 
      alignItems: 'center',
    }}
  >
    <span>{content} hinzufügen/entfernen</span> {/* Dialogtitel */}
    <Button
      onClick={onClose}
      sx={{
        minWidth: 'auto', 
        padding: 0, 
        color: '#000', 
        '&:hover': {
          color: '#BB8888', 
          backgroundColor: 'transparent', 
        },
      }}
    >
      <CloseIcon />
    </Button>
  </DialogTitle>
      <DialogContent>
        <Box>
          {/* Gefilterte Listen anzeigen */}
          {customList(
            filteredAvailableItems,
            <Typography sx={{ color: "#D9A0A0", fontWeight: "bold" }}>
              Verfügbar
            </Typography>,
            leftChecked.length
          )}
          <Grid container justifyContent="center" sx={{ my: 2 }}>
          <Button
  variant="outlined"
  size="small"
  onClick={handleCheckedRight}
  disabled={leftChecked.length === 0}
  aria-label="move selected down"
  sx={{
    mx: 1,
    backgroundColor: '#C2D9A0',
    color: '#000', 
    borderColor: '#C2D9A0', 
    '&:hover': {
      backgroundColor: '#72A603', 
      borderColor: '#72A603',
    },
    '&.Mui-disabled': {
      backgroundColor: 'white', 
      color: '#A0A0A0',
    },
  }}
>
  <ArrowDownwardIcon />
</Button>
<Button
  variant="outlined"
  size="small"
  onClick={handleCheckedLeft}
  disabled={rightChecked.length === 0}
  aria-label="move selected up"
  sx={{
    mx: 1,
    backgroundColor: '#D9A0A0', 
    color: '#000', 
    borderColor: '#D9A0A0', 
    '&:hover': {
      backgroundColor: '#BB8888', 
      borderColor: '#BB8888',
    },
    '&.Mui-disabled': {
      backgroundColor: 'white', 
      color: '#A0A0A0',
    },
  }}
>
  <ArrowUpwardIcon />
</Button>

          </Grid>
          {customList(
            filteredSelectedItems,
            <Typography sx={{ color: "#C2D9A0", fontWeight: "bold" }}>
              Hinzugefügt
            </Typography>,
            rightChecked.length
          )}
        </Box>
      </DialogContent>
      <DialogActions
      sx={{
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'center', 
      }}
    >
      {/* Suchleiste links */}
      <TextField
        label="Suche"
        variant="outlined"
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flexGrow: 1, maxWidth: '60%' }} 
      />

      {/* Buttons rechts */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={() => {
            saveToLocalStorage();
            onClose();
          }}
          sx={{
            backgroundColor: '#C2D9A0',
            color: '#000',
            '&:hover': {
              backgroundColor: '#72A603',
            },
          }}
        >
          Speichern
        </Button>
      </Box>
    </DialogActions>

    </Dialog>
  );
}

export default TransferListDialog;
