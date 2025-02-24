const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Use absolute path for database file
const dbPath = path.join(__dirname, "zayka_data.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error connecting to database:", err);
        return;
    }
    console.log("Connected to database at:", dbPath);

    // Create and populate database
    db.serialize(() => {
        // Drop existing table if it exists
        db.run("DROP TABLE IF EXISTS menu", (err) => {
            if (err) {
                console.error("Error dropping table:", err);
                return;
            }
            console.log("Dropped existing menu table");
        });
        
        // Create table with basic schema
        db.run(`CREATE TABLE IF NOT EXISTS menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err);
                return;
            }
            console.log("Created menu table");
        });

        // Insert menu items
        const menuItems = [
            ['Butter Chicken', 299, 'Creamy, rich curry with tender chicken pieces'],
            ['Paneer Tikka', 249, 'Grilled cottage cheese with spices'],
            ['Chicken Biryani', 299, 'Fragrant rice dish with spiced chicken'],
            ['Dal Makhani', 199, 'Creamy black lentils'],
            ['Naan', 49, 'Traditional Indian bread'],
            ['Chicken Pasta', 279, 'Creamy pasta with grilled chicken'],
            ['Veg Manchurian', 199, 'Indo-Chinese vegetable dumplings'],
            ['Hakka Noodles', 189, 'Stir-fried noodles with vegetables'],
            ['Malai Kofta', 249, 'Cottage cheese dumplings in rich gravy'],
            ['Chilli Chicken', 289, 'Spicy Indo-Chinese chicken']
        ];

        const insertStmt = db.prepare("INSERT INTO menu (name, price, description) VALUES (?, ?, ?)");
        menuItems.forEach((item, index) => {
            insertStmt.run(item, (err) => {
                if (err) {
                    console.error(`Error inserting item ${index + 1}:`, err);
                }
            });
        });
        insertStmt.finalize((err) => {
            if (err) {
                console.error("Error finalizing insert:", err);
                return;
            }
            console.log("Inserted all menu items");
            
            // Verify the data was inserted
            db.all("SELECT * FROM menu", [], (err, rows) => {
                if (err) {
                    console.error("Error verifying data:", err);
                    return;
                }
                console.log("Menu items in database:", rows.length);
            });
        });
    });
});

// Handle database errors
db.on("error", (err) => {
    console.error("Database error:", err);
});

module.exports = db;
