const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');


dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Verify MySQL connection
pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log("Connected to database successfully!");
    connection.release();
});

app.get('/', (req, res) => {
    res.send('Spending Tracker App');
});





// ... existing code ...

// Route to serve the spending history page
app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/history.html'));
});

// API endpoint to fetch spending data
app.get('/expenses', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT *, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i") as formatted_date FROM expenses ORDER BY created_at DESC', (error, results) => {
            connection.release();
            if (error) throw error;
            res.json(results);
        });
    });
});

// ... existing code ...





// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Additional routes and logic go here...
app.post('/add-expense', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        const { category, amount, date, description } = req.body;
        connection.query('INSERT INTO expenses (category, amount, date, description) VALUES (?, ?, ?, ?)', [category, amount, date, description], (error, results) => {
            connection.release();
            if (error) throw error;
            res.send({ message: 'Expense added successfully!', expenseId: results.insertId });
        });
    });
});
