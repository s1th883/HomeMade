const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_homemade_key';

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'homemade.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users Table with Extended Profile
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user',
            full_name TEXT,
            address TEXT,
            bio TEXT,
            avatar_url TEXT,
            latitude REAL,
            longitude REAL
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            price REAL,
            image_url TEXT,
            seller_id INTEGER,
            FOREIGN KEY(seller_id) REFERENCES users(id)
        )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_id INTEGER,
            product_id INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(buyer_id) REFERENCES users(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )`);

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
        )`);
    });
}

// Routes
const aiRoutes = require('./ai');
app.use('/api/ai', aiRoutes);

// Auth Routes

// REGISTER
app.post('/api/register', async (req, res) => {
    const { username, password, role, latitude, longitude } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, role, latitude, longitude) VALUES (?, ?, ?, ?, ?)';
        // Default to Central Park, NY if no location provided
        const lat = latitude || 40.7829;
        const long = longitude || -73.9654;
        const params = [username, hashedPassword, role || 'user', lat, long];

        db.run(sql, params, function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: "Username already exists" });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "User created successfully", userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.get(sql, [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: "Login successful", token, user: { id: user.id, username: user.username, role: user.role } });
    });
});

// UPDATE PROFILE
app.put('/api/users/:id', (req, res) => {
    const { full_name, address, bio, avatar_url, latitude, longitude } = req.body;
    const userId = req.params.id;

    // Build dynamic query
    let fields = [];
    let params = [];
    if (full_name) { fields.push('full_name = ?'); params.push(full_name); }
    if (address) { fields.push('address = ?'); params.push(address); }
    if (bio) { fields.push('bio = ?'); params.push(bio); }
    if (avatar_url) { fields.push('avatar_url = ?'); params.push(avatar_url); }
    if (latitude) { fields.push('latitude = ?'); params.push(latitude); }
    if (longitude) { fields.push('longitude = ?'); params.push(longitude); }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    params.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Profile updated" });
    });
});

// Get all sellers with products
app.get('/api/sellers', (req, res) => {
    const sql = `
        SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url, u.latitude, u.longitude, 
               GROUP_CONCAT(p.name) as products 
        FROM users u 
        LEFT JOIN products p ON u.id = p.seller_id 
        WHERE u.role = 'seller' 
        GROUP BY u.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});

// MESSAGING ROUTES

// Send Message
app.post('/api/messages', (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    const sql = 'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)';
    db.run(sql, [sender_id, receiver_id, content], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Message sent", id: this.lastID });
    });
});

// Get Conversation
app.get('/api/messages/:userId/:otherId', (req, res) => {
    const { userId, otherId } = req.params;
    const sql = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?) 
        ORDER BY timestamp ASC
    `;
    db.all(sql, [userId, otherId, otherId, userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "success", data: rows });
    });
});


// Get all products
app.get('/api/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create product
app.post('/api/products', (req, res) => {
    const { name, description, price, image_url, seller_id } = req.body;
    const sql = 'INSERT INTO products (name, description, price, image_url, seller_id) VALUES (?,?,?,?,?)';
    const params = [name, description, price, image_url, seller_id];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": this.lastID
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
