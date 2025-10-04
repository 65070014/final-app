import mysql from 'mysql2/promise'
import path from 'path';
import fs from 'fs';

let connection;
export const createConnection = async() => {
    if(!connection){

        const caPath = path.join(process.cwd(),'isrgrootx1.pem')
        console.log(caPath)
        const caCert = fs.readFileSync(caPath, 'utf8'); 

        connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_NAME,
            ssl: {
                    ca: caCert,
                    rejectUnauthorized: true,
                }
        })
    }
    return connection;
} 