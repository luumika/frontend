import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

const DragAndDropPage = ({ content, data, onSave }) => {
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const savedItems = JSON.parse(localStorage.getItem('selectedItems')) || {};
      const alreadySelected = savedItems[content] || [];
      const available = data.filter(
        (item) => !alreadySelected.some((selectedItem) => selectedItem._id === item._id)
      );
  
      setAvailableItems(available);
      setSelectedItems(alreadySelected);
    }
  }, [content, data]);
  

  const handleDrop = (event, target) => {
    event.preventDefault();
    const draggedItemId = event.dataTransfer.getData('text');
    const draggedItem = availableItems.find((item) => item._id === draggedItemId) ||
                        selectedItems.find((item) => item._id === draggedItemId);

    if (draggedItem) {
      if (target === 'selected') {
        setSelectedItems((prev) => [...prev, draggedItem]);
        setAvailableItems((prev) => prev.filter((item) => item._id !== draggedItemId));
      } else if (target === 'available') {
        setAvailableItems((prev) => [...prev, draggedItem]);
        setSelectedItems((prev) => prev.filter((item) => item._id !== draggedItemId));
      }
    }
  };

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData('text', item._id);
  };

  const saveToLocalStorage = () => {
    const savedConfig = JSON.parse(localStorage.getItem('selectedItems')) || {};
    savedConfig[content] = selectedItems;
    localStorage.setItem('selectedItems', JSON.stringify(savedConfig));
    if (onSave) onSave(selectedItems);
  };

  const renderList = (items, label, target) => (
    <Paper
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, target)}
      sx={{ p: 2, width: '45%', minHeight: 200, margin: '0 10px' }}
    >
      <Typography variant="h6" align="center">{label}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {items.map((item) => (
          <Paper
            key={item._id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            sx={{ p: 1, textAlign: 'center', cursor: 'grab' }}
          >
            {item.Name || 'Unbenannt'}
          </Paper>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      {renderList(availableItems, 'Verfügbare Elemente', 'available')}
      {renderList(selectedItems, 'Ausgewählte Elemente', 'selected')}
      <Box sx={{ textAlign: 'center', marginTop: 2 }}>
        <Button
          onClick={saveToLocalStorage}
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Speichern
        </Button>
      </Box>
    </Box>
  );
};

export default DragAndDropPage;
