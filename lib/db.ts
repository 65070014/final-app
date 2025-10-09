import mysql, { Pool } from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

let pool: Pool | null = null;
export function getDbPool(): Pool {
    if (pool) {
        return pool;
    }
    const caPath = path.join(process.cwd(), 'isrgrootx1.pem')
    const caCert = fs.readFileSync(caPath, 'utf8');
    pool = mysql.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: {
            ca: caCert,
            rejectUnauthorized: true,
        }
    });

    console.log('Database Pool created and ready.');
    return pool;
}