// src/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

export const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database!");
});

pool.on("error", (err) => {
  console.error("Error connecting to PostgreSQL database:", err);
});

export async function createContactTable() {
    try {
        const client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS Contact (
                id SERIAL PRIMARY KEY,
                phoneNumber VARCHAR(255),
                email VARCHAR(255),
                linkedId INTEGER REFERENCES Contact(id),
                linkPrecedence VARCHAR(20) CHECK (linkPrecedence IN ('primary', 'secondary')),
                createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deletedAt TIMESTAMP WITH TIME ZONE
            );
            CREATE INDEX IF NOT EXISTS idx_phone_number ON Contact (phoneNumber);
            CREATE INDEX IF NOT EXISTS idx_email ON Contact (email);
            CREATE INDEX IF NOT EXISTS idx_phone_email ON Contact (phoneNumber, email);
        `);
        console.log("Contact table created (or already existed).");
        client.release();
    } catch (error) {
        console.error("Error creating Contact table:", error);
        throw error; // Re-throw the error to be caught by the caller
    }
}