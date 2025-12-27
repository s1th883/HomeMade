const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'homemade.db');
const db = new sqlite3.Database(dbPath);

console.log("Seeding started...");

db.serialize(async () => {
    // Clear existing data
    db.run('DELETE FROM messages');
    db.run('DELETE FROM products');
    db.run('DELETE FROM users');
    db.run('DELETE FROM orders');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Initial Sellers with Coordinates and Profiles
    const sellers = [
        {
            username: 'Alice_Baker',
            full_name: 'Alice Baker',
            bio: 'Passionate home baker specializing in sourdough and gluten-free treats.',
            address: '123 Bakery Lane, Central District',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
            role: 'seller',
            lat: 40.7812,
            long: -73.9665,
            product: { name: 'Sourdough Bread', desc: 'Fresh baked daily.', price: 8.5, img: 'https://images.unsplash.com/photo-1585476263060-655aaf646606?w=600&auto=format&fit=crop&q=60' }
        },
        {
            username: 'Bob_Gardener',
            full_name: 'Bob Green',
            bio: 'Urban gardener. I sell what I grow in my backyard. 100% Organic.',
            address: '45 Green St, West Side',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
            role: 'seller',
            lat: 40.7840,
            long: -73.9640,
            product: { name: 'Organic Strawberry Jam', desc: 'Home grown.', price: 6.0, img: 'https://images.unsplash.com/photo-1596525983279-84729f260383?w=600&auto=format&fit=crop&q=60' }
        },
        {
            username: 'Carol_Knits',
            full_name: 'Carol Smith',
            bio: 'Knitting is my therapy. Custom orders welcome!',
            address: '77 Wooly Way, North End',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
            role: 'seller',
            lat: 40.7820,
            long: -73.9680,
            product: { name: 'Wool Scarf', desc: 'Cozy and warm.', price: 25.0, img: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=60' }
        },
        {
            username: 'Dave_Chef',
            full_name: 'Dave Miller',
            bio: 'Retired chef cooking up spices and sauces.',
            address: '88 Culinary Ct, East Side',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
            role: 'seller',
            lat: 40.7850,
            long: -73.9620,
            product: { name: 'Spicy Salsa', desc: 'Family secret recipe.', price: 7.0, img: 'https://images.unsplash.com/photo-1571407970349-bc16b696ee81?w=600&auto=format&fit=crop&q=60' }
        }
    ];

    const stmtUser = db.prepare('INSERT INTO users (username, password, role, full_name, bio, address, avatar_url, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const stmtProd = db.prepare('INSERT INTO products (name, description, price, image_url, seller_id) VALUES (?, ?, ?, ?, ?)');

    let completed = 0;

    sellers.forEach(s => {
        stmtUser.run(s.username, hashedPassword, s.role, s.full_name, s.bio, s.address, s.avatar, s.lat, s.long, function (err) {
            if (err) console.error("Error creating user:", err);
            const userId = this.lastID;
            console.log(`Created user ${s.username}`);

            stmtProd.run(s.product.name, s.product.desc, s.product.price, s.product.img, userId, (err) => {
                if (err) console.error("Error creating product:", err);
                completed++;
                if (completed === sellers.length) {
                    finalize();
                }
            });
        });
    });

    function finalize() {
        stmtUser.finalize();
        stmtProd.finalize(() => {
            console.log('Seeded successfully with rich profile data.');
            db.close();
        });
    }
});
