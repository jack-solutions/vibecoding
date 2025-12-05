const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        multipleStatements: true
    });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema.sql...');
        // Drop tables if they exist to ensure clean slate for schema changes (Optional, but good for dev)
        // For now, let's just run the schema. If columns are missing, this might fail or not update existing tables.
        // To properly add the column, we might need an ALTER TABLE if table exists. 
        // BUT, for this simple project, we can drop the DB or tables.
        // Let's try to Drop database and recreate for safety in this dev environment.

        await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'youtube_clone'}`);
        await connection.query(sql);

        console.log('Seeding users with roles...');
        // Ensure the database is selected before inserting
        await connection.query(`USE ${process.env.DB_NAME || 'youtube_clone'}`);

        const users = [
            { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
            { id: 2, name: 'Creator User', email: 'creator@example.com', role: 'creator' },
            { id: 3, name: 'Viewer User', email: 'viewer@example.com', role: 'viewer' },
            { id: 4, name: 'Advertiser User', email: 'ad@example.com', role: 'advertiser' }
        ];

        for (const user of users) {
            await connection.query(`
            INSERT INTO users (id, username, email, password, avatar_url, role) 
            VALUES (?, ?, ?, 'password', 'https://via.placeholder.com/150', ?)
        `, [user.id, user.name, user.email, user.role]);
        }

        console.log('Database initialized and seeded successfully!');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await connection.end();
    }
}

initDb();
