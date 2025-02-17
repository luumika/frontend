const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 5001;

// CORS aktivieren, um das Frontend zuzulassen
app.use(cors());

// MongoDB-Verbindung
mongoose.connect('mongodb://127.0.0.1:27017/local', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Verbindungsfehler:'));
db.once('open', () => {
  console.log('Mit MongoDB verbunden');
});

// Route zum Abrufen mehrerer spezifischer Collections
app.get('/api/multiple-collections', async (req, res) => {
  try {
    const collectionsToFetch = ['Devices.public', 'Environments.public'];
    const data = {};

    for (let collectionName of collectionsToFetch) {
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      data[collectionName] = documents;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
