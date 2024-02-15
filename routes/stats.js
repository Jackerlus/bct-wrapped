const express = require('express');
const router = express.Router();

//BCT Stats ASCII Text
console.log(`\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D    \u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u255A\u2550\u2550\u2588\u2588\u2554\u2550\u2550\u255D\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255D\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u2588\u2588\u2551        \u2588\u2588\u2551       \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\r\n\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2551        \u2588\u2588\u2551       \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551   \u2588\u2588\u2551   \u255A\u2550\u2550\u2550\u2550\u2588\u2588\u2551\r\n\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255D\u255A\u2588\u2588\u2588\u2588\u2588\u2588\u2557   \u2588\u2588\u2551       \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2551  \u2588\u2588\u2551   \u2588\u2588\u2551   \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551\r\n\u255A\u2550\u2550\u2550\u2550\u2550\u255D  \u255A\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D       \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u255D  \u255A\u2550\u255D   \u255A\u2550\u255D   \u255A\u2550\u2550\u2550\u2550\u2550\u2550\u255D\r\n                                                                       \r\n`)

// MySQL database configuration
const mysql = require('mysql');
const dbHost = process.env.DB_HOST;
const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const dbDatabase = process.env.DB_NAME;

const dbConnection = mysql.createConnection({
    host: dbHost,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase
});

// Connect to the database
dbConnection.connect((err) => {
    if (err) {
        console.error('Failed to connect to BCT Stats database: ', err);
        return;
    }
    console.log('Connected to BCT Stats database!');
});


// Route to handle requests from frontend
router.post('/GetMatchStats', (req, res, next) => {
    const discord = req.body.discord;
    console.log("Making query to bct-stats DB with player discord: " + discord);
    const query = "CALL GetPlayerWrappedMatches(?)"; // Stored procedure
    dbConnection.query(query, [discord], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            res.status(500).json({ error: 'Database Error' });
            return;
        }
        console.log(result);
        res.json(result);
    });
});

// Route to handle requests from frontend
router.post('/GetPercentileStats', (req, res, next) => {
    const discord = req.body.discord;
    console.log("Making query to bct-stats DB with player discord: " + discord);
    const query = "CALL GetPlayerWrappedPercentiles(?)"; // Stored procedure
    dbConnection.query(query, [discord], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            res.status(500).json({ error: 'Database Error' });
            return;
        }
        console.log(result);
        res.json(result);
    });
});

module.exports = router;