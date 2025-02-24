const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

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
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        category TEXT
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
            INSERT INTO menu (name, price, description, image, category) VALUES
            ('Biryani', 199, 'Spicy chicken biryani with aromatic rice', '', 'Main Course'),
            ('Paneer Butter Masala', 249, 'Creamy paneer in a rich tomato and butter sauce', '', 'Main Course'),
            ('Masala Dosa', 99, 'Crispy rice crepe filled with spiced potatoes', '', 'South Indian'),
            ('Chicken Tikka Masala', 299, 'Grilled chicken in a creamy tomato sauce', '', 'Main Course'),
            ('Samosa', 59, 'Fried pastry with spiced potatoes and peas', '', 'Snacks'),
            ('Chole Bhature', 149, 'Spicy chickpea curry with fried bread', '', 'North Indian'),
            ('Naan', 49, 'Soft, fluffy Indian bread baked in a tandoor', '', 'Bread'),
            ('Butter Chicken', 279, 'Juicy chicken in a buttery tomato gravy', '', 'Main Course'),
            ('Rajma', 129, 'Spicy kidney bean curry', '', 'Main Course'),
            ('Gulab Jamun', 89, 'Sweet fried dough balls soaked in syrup', '', 'Desserts'),
            ('Puri', 69, 'Deep-fried Indian bread served with curry', '', 'Bread'),
            ('Aloo Paratha', 109, 'Stuffed potato flatbread with butter', '', 'Bread'),
            ('Dal Makhani', 139, 'Creamy lentil curry cooked with butter and cream', '', 'Main Course'),
            ('Tandoori Chicken', 259, 'Marinated chicken cooked in a tandoor oven', '', 'Main Course'),
            ('Kebab Platter', 349, 'Assorted grilled kebabs with mint chutney', '', 'Main Course'),
            ('Idli', 79, 'Steamed rice cakes served with sambar and chutney', '', 'South Indian'),
            ('Vada', 89, 'Deep-fried lentil doughnut with coconut chutney', '', 'South Indian'),
            ('Poha', 99, 'Flattened rice dish with spices and peanuts', '', 'Snacks'),
            ('Upma', 89, 'Savory semolina porridge with vegetables', '', 'Snacks'),
            ('Lassi', 59, 'Refreshing yogurt drink, sweet or salty', '', 'Beverages')
        `);
        console.log("🍛 Dummy menu data added with 20 items");
    }
});

// API Routes
app.get("/api/menu", (req, res) => {
    db.all("SELECT * FROM menu", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post("/api/menu", (req, res) => {
    const { name, price, description, image, category } = req.body;
    db.run(
        `INSERT INTO menu (name, price, description, image, category)
         VALUES (?, ?, ?, ?, ?)`,
        [name, price, description, image, category],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                message: "Menu item added successfully! 🎉"
            });
        }
    );
});

// Add login endpoint
app.post("/api/login", (req, res) => {
    const { userid, password } = req.body;
    
    // Check default credentials
    if (userid === "7894" && password === "123") {
        res.json({
            success: true,
            message: "Login successful! 🎉",
            user: {
                id: "7894",
                name: "Demo User"
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid credentials! Please use the default login details shown above. 🔒"
        });
    }
});

// Handle all other routes by serving index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});