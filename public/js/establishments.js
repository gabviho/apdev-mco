// establishment.js
const express = require('express');
const app = express();
const ejs = require('ejs');
const mongodb = require('mongodb').MongoClient;

// Database connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'apdev_test';

// Set the view engine to EJS (even though the file is HTML)
app.set('view engine', 'ejs');

// Fetch the establishment data and render the HTML page
app.get('/establishment/:id', (req, res) => {
    const establishmentId = req.params.id;
    // Connect to the MongoDB database
    mongodb.connect(uri, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            res.status(500).send('Error connecting to the database.');
            return;
        }

        const db = client.db(dbName);
        // Fetch the establishment data based on the ID from the URL parameter
        db.collection('Establishments').findOne({ _id: establishmentId }, (err, establishment) => {
            if (err || !establishment) {
                console.error('Error fetching establishment data:', err);
                res.status(404).send('Establishment not found.');
                return;
            }

            // Render the EJS template (establishment.html) with the establishment data
            res.render('establishment', { establishment });
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});
