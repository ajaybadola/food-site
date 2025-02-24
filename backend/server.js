const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./backend/zayka_data.db", (err) => {
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
        description TEXT
    )
`);

// Insert 20 Sample Menu Items (without images)
db.get("SELECT COUNT(*) as count FROM menu", (err, row) => {
    if (err) {
        console.error("❌ Error checking menu table:", err.message);
        return;
    }
    if (row.count === 0) {
        db.run(`
            INSERT INTO menu (name, price, description) VALUES
            ('Biryani', 199, 'Spicy chicken biryani with aromatic rice'),
            ('Paneer Butter Masala', 249, 'Creamy paneer in a rich tomato and butter sauce'),
            ('Masala Dosa', 99, 'Crispy rice crepe filled with spiced potatoes'),
            ('Chicken Tikka Masala', 299, 'Grilled chicken in a creamy tomato sauce'),
            ('Samosa', 59, 'Fried pastry with spiced potatoes and peas'),
            ('Chole Bhature', 149, 'Spicy chickpea curry with fried bread'),
            ('Naan', 49, 'Soft, fluffy Indian bread baked in a tandoor'),
            ('Butter Chicken', 279, 'Juicy chicken in a buttery tomato gravy'),
            ('Rajma', 129, 'Spicy kidney bean curry'),
            ('Gulab Jamun', 89, 'Sweet fried dough balls soaked in syrup'),
            ('Puri', 69, 'Deep-fried Indian bread served with curry'),
            ('Aloo Paratha', 109, 'Stuffed potato flatbread with butter'),
            ('Dal Makhani', 139, 'Creamy lentil curry cooked with butter and cream'),
            ('Tandoori Chicken', 259, 'Marinated chicken cooked in a tandoor oven'),
            ('Kebab Platter', 349, 'Assorted grilled kebabs with mint chutney'),
            ('Idli', 79, 'Steamed rice cakes served with sambar and chutney'),
            ('Vada', 89, 'Deep-fried lentil doughnut with coconut chutney'),
            ('Poha', 99, 'Flattened rice dish with spices and peanuts'),
            ('Upma', 89, 'Savory semolina porridge with vegetables'),
            ('Lassi', 59, 'Refreshing yogurt drink, sweet or salty')
        `);
        console.log("🍛 Dummy menu data added with 20 items");
    }
});

// API to get menu items
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