const express = require('express');
const path = require('path');
const db = require('./backend/database');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// API Routes
app.get('/api/menu', (req, res) => {
    db.all('SELECT * FROM menu', [], (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'menu.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} 🚀`);
});
