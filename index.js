// This is a simple example of a function that saves a cart item to a PostgreSQL database.
// Do not try and run it, as the DB does not exist.
import { Client } from 'pg';

const client = new Client({
    user: 'yourusername',
    host: 'localhost',
    database: 'shopdb',
    password: 'yourpassword',
    port: 5432,
});

client.connect();

export async function saveCartItem(userId, productId, quantity) {
    const query = `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [userId, productId, quantity];

    try {
        const res = await client.query(query, values);
        console.log('Cart item saved:', res.rows[0]);
        return res.rows[0];
    } catch (err) {
        console.error('Get Error saving cart item:', err.stack);
    }
}
