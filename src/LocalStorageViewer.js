import React, { useState, useEffect, useCallback } from "react";
import { Button, Typography, List, ListItem, ListItemText } from "@mui/material";

function LocalStorageViewer() {
  const [storageData, setStorageData] = useState({}); // LocalStorage-Daten
  const [databaseData, setDatabaseData] = useState({}); // API-Daten
  const [error, setError] = useState(null);

  // 🔹 Daten aus MongoDB abrufen
  const fetchDatabaseData = useCallback(() => {
    fetch("http://localhost:5001/api/multiple-collections")
      .then((response) => response.json())
      .then((fetchedData) => {
        setDatabaseData(fetchedData);
      })
      .catch((err) => {
        console.error("Fehler beim Abrufen der Daten:", err);
        setError("Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.");
      });
  }, []);

  // 🔹 Daten aus localStorage abrufen
  const loadStorageData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
    setStorageData(data);
  };

  // 🔹 Beide Datenquellen beim Start laden
  useEffect(() => {
    fetchDatabaseData();
    loadStorageData();
  }, [fetchDatabaseData]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Daten aus MongoDB & LocalStorage
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 2 }}>
        🔹 MongoDB Daten:
      </Typography>
      {Object.keys(databaseData).length === 0 ? (
        <Typography variant="body1">Keine Daten in der Datenbank gefunden.</Typography>
      ) : (
        <List>
          {Object.entries(databaseData).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText primary={key} secondary={JSON.stringify(value, null, 2)} />
            </ListItem>
          ))}
        </List>
      )}

      <Typography variant="h6" sx={{ mt: 2 }}>
        🔹 LocalStorage Daten:
      </Typography>
      {Object.keys(storageData).length === 0 ? (
        <Typography variant="body1">Kein gespeicherter Inhalt im LocalStorage.</Typography>
      ) : (
        <List>
          {Object.entries(storageData).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText primary={key} secondary={JSON.stringify(value, null, 2)} />
            </ListItem>
          ))}
        </List>
      )}

      <Button variant="contained" color="primary" fullWidth onClick={fetchDatabaseData}>
        Daten neu laden
      </Button>
    </div>
  );
}

export default LocalStorageViewer;
