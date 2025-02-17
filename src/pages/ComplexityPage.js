import React, { useState } from 'react';
import { Box, Card, CardContent, Checkbox, Typography, Button, Grid2 } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function SimulationPage() {
  const [selectedOption, setSelectedOption] = useState('average');
  const [xmlUploaded, setXmlUploaded] = useState(false);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleXmlUpload = (event) => {

    const file = event.target.files[0];
    if (file && file.type === 'text/xml') {
      setXmlUploaded(true);
      console.log("XML file uploaded:", file.name);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
      <Grid2 container spacing={2} justifyContent="center">
  
        <Grid2 item>
          <Card
            variant="outlined"
            sx={{
              width: 200,
              height: 200,
              backgroundColor: selectedOption === 'simple' ? '#e0e0e0' : '#f5f5f5',
              borderColor: selectedOption === 'simple' ? '#000' : '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CardContent>
              <Typography variant="h6" align="center">simple</Typography>
              <Typography variant="body2" align="center">2 person</Typography>
              <Typography variant="body2" align="center">3 rooms</Typography>
              <Checkbox
                checked={selectedOption === 'simple'}
                value="simple"
                onChange={handleOptionChange}
              />
            </CardContent>
          </Card>
        </Grid2>


        <Grid2 item>
          <Card
            variant="outlined"
            sx={{
              width: 200,
              height: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: xmlUploaded ? '#e0e0e0' : '#f5f5f5',
              borderColor: '#f5f5f5',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('xml-upload-input').click()}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6">
                <UploadFileIcon /> XML Upload
              </Typography>
              <input
                type="file"
                accept=".xml"
                id="xml-upload-input"
                style={{ display: 'none' }}
                onChange={handleXmlUpload}
              />
            </CardContent>
          </Card>
        </Grid2>
      </Grid2>


      <Button
        variant="contained"
        sx={{ mt: 4, width: '200px', borderRadius: '50px' }}
        color="primary"
        href="/modellist"
      >
        create simulation
      </Button>
    </Box>
  );
}

export default SimulationPage;
