import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Divider,
  Grid,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from '@mui/material';

function EnvironmentDetailPage({ data }) {
  const { id } = useParams();
  const environment = data?.find((item) => item._id === id);

  // Zustand für die Verwaltung der Änderungen in den Eingabefeldern
  const [values, setValues] = useState(() => {
    const savedValues = localStorage.getItem(id);
    return savedValues ? JSON.parse(savedValues) : {};
  });
  const [errors, setErrors] = useState({});

  

  useEffect(() => {
    localStorage.setItem(id, JSON.stringify(values));
  }, [id, values]);

  if (!environment) {
    return <Typography variant="h6">Umfeld nicht gefunden</Typography>;
  }

  const handleInputChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleTableCellChange = (key, colKey, rowIndex, value) => {
    setValues((prevValues) => {
      const updatedValues = { ...prevValues };
      if (!updatedValues[key]) {
        updatedValues[key] = {};
      }
      if (!updatedValues[key][colKey]) {
        updatedValues[key][colKey] = [];
      }
      updatedValues[key][colKey][rowIndex] = value;
      return updatedValues;
    });
  };

  const renderTable = (state, key) => {
      const columns = state.Columns;
      const defaultData = state.Default;
    
      // Ermitteln der Anzahl der Zeilen basierend auf der Länge der ersten Spalte
      const rowCount = Array.isArray(defaultData[Object.keys(columns)[0]])
        ? defaultData[Object.keys(columns)[0]].length
        : 1;
    
      return (
        <div>
        <Typography variant="body1">{key}</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {Object.keys(columns).map((colKey) => (
                  <TableCell key={colKey}>{columns[colKey]}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.keys(columns).map((colKey) => {
                    const cellValue = defaultData[colKey];
                    const isArray = Array.isArray(cellValue);
                    const value = isArray ? cellValue[rowIndex] : cellValue;
    
                    // Bestimmen des Datentyps der Zelle
                    const cellType = typeof value;
    
                    return (
                      <TableCell key={colKey}>
                        {cellType === 'string' ? (
                          <TextField
                            variant="outlined"
                            value={values[key]?.[colKey]?.[rowIndex] || value}
                            onChange={(e) =>
                              handleTableCellChange(
                                key,
                                colKey,
                                rowIndex,
                                e.target.value
                              )
                            }
                          />
                        ) : cellType === 'number' ? (
                          <TextField
                            variant="outlined"
                            type="number"
                            value={values[key]?.[colKey]?.[rowIndex] || value}
                            onChange={(e) =>
                              handleTableCellChange(
                                key,
                                colKey,
                                rowIndex,
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        ) : Array.isArray(value) ? (
                          <FormControl>
                            <Select
                              value={
                                values[key]?.[colKey]?.[rowIndex] ||
                                value[0] ||
                                ''
                              }
                              onChange={(e) =>
                                handleTableCellChange(
                                  key,
                                  colKey,
                                  rowIndex,
                                  e.target.value
                                )
                              }
                            >
                              {value.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography>Unbekannter Typ</Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </div>
      );
    };
  
    
  
    const renderInputField = (state, key) => {
      switch (state.Type) {
        case 'string':
          // Dropdown für string Typen, die immer eine set Option haben
          return (
            <FormControl>
              <InputLabel>{key}</InputLabel>
              <Select
                label={key}
                value={values[key] || state.Default || ''}
                onChange={(e) => handleInputChange(key, e.target.value)}
              >
                {state.set.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        case 'int':
        case 'float':
          return (
            <TextField
              type="number"
              label={key}
              value={values[key] !== undefined ? values[key] : state.Default}
              onChange={(e) => {
                let value = e.target.value;  // Nehme den rohen String-Wert aus dem Eingabefeld
                setValues(prev => ({ ...prev, [key]: value }));  // Aktualisiere den State mit dem rohen Wert
              }}
              onBlur={() => {  // Führe die Validierung durch, wenn das Feld den Fokus verliert
                const numValue = parseFloat(values[key]);
                const min = state.Range?.[0] ?? Number.MIN_SAFE_INTEGER;
                const max = state.Range?.[1] ?? Number.MAX_SAFE_INTEGER;
          
                if (isNaN(numValue) || numValue < min || numValue > max) {
                  setErrors(prev => ({ ...prev, [key]: `Wert muss zwischen ${min} und ${max} liegen.` }));
                  setValues(prev => ({ ...prev, [key]: state.Default }));  // Setze auf Default zurück, wenn ungültig
                } else {
                  setErrors(prev => ({ ...prev, [key]: null }));
                  setValues(prev => ({ ...prev, [key]: numValue }));  // Speichere den Float-Wert, wenn gültig
                }
              }}
              helperText={errors[key] || (state.Range ? `Bitte einen Wert zwischen ${state.Range[0]} und ${state.Range[1]} eingeben.` : '')}
              error={Boolean(errors[key])}

            />
          );
          case 'Table':
          return renderTable(state, key);
        default:
          return <Typography>Unbekannter Typ</Typography>;
      }
    };
  
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: '100px' }}>
        {/* Falls kein Environment gefunden wurde, zeige eine Meldung */}
        {!environment ? (
          <Typography variant="h6">Umfeld nicht gefunden</Typography>
        ) : (
          <>
            <Typography variant="h5" gutterBottom style={{ fontWeight: 600 }}>
              {environment.Name || "Unbekanntes Umfeld"}
            </Typography>
    
            {/* Prüfe, ob `environment.states` existiert, bevor darauf zugegriffen wird */}
            {environment.states ? (
              <Grid container spacing={1}>
                {Object.entries(environment.states)
                  .filter(([_, state]) => state.isConfigurable)
                  .map(([key, state], index) => (
                    <React.Fragment key={key}>
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{ marginBottom: '4px' }}
                        >
                          {state.Description}
                        </Typography>
                        <Typography variant="body1">
                          {renderInputField(state, key)}
                        </Typography>
                      </Grid>
                      {index <
                        Object.entries(environment.states).filter(
                          ([_, s]) => s.isConfigurable
                        ).length -
                          1 && (
                        <Grid item xs={12}>
                          <Divider style={{ margin: '8px 0' }} />
                        </Grid>
                      )}
                    </React.Fragment>
                  ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Keine konfigurierbaren Zustände gefunden.
              </Typography>
            )}
          </>
        )}
      </div>
    );
    
  }
  
  export default EnvironmentDetailPage;