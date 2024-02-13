const express = require('express');
const router = express.Router();

// Route to handle requests from frontend
router.post('/getAllPlayers', (req, res) => {
    const dbConnection = req.app.get('dbConnection'); // Get the database connection from app.js
    const query = "CALL GetAllPlayers()"; // Stored procedure
    dbConnection.query(query, (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            res.status(500).json({ error: 'Database Error' });
            return;
        }
        res.json(result);
    });
});

module.exports = router;