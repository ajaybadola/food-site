const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// Connect to SQLite database
const db = new sqlite3.Database("backend/zayka_data.db", (err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to SQLite database");
    }
});

// Create Menu Table (if not exists)
db.run(`
    CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL
    )
`);

// Insert Sample Data if Table is Empty
db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
    if (err) {
        console.error("❌ Error checking menu table:", err.message);
        return;
    }
    if (row.count === 0) {
        db.run(`
            INSERT INTO menu (name, price, image) VALUES
            ('Biryani', 199, 'biryani.jpg'),
            ('Paneer Butter Masala', 249, 'paneer.jpg'),
            ('Masala Dosa', 99, 'dosa.jpg')
        `);
        console.log("🍛 Dummy menu data added");
    }
});

// API Route - Get Menu
app.get("/menu", (req, res) => {
    db.all("SELECT * FROM menu", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
