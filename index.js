const pg = require('pg');
const express = require('express');
const dotenv = require('dotenv');
const client = new pg.Client (process.env.DATABASE_URL ||'postgres://olivia:@localhost/the_acme_notes_db')
const app = express()

app.use(express.json());

app.delete('/api/flavors/:id',async(req, res, next)=>{
    try {
        const SQL = `
            DELETE FROM flavors
            WHERE id =$1
        `;
        await client.query(SQL, [req.params.id]);
        res.status(204).send();
    }catch(error){
        next(error);
    }
});

app.put('/api/flavors/:id',async(req, res, next)=>{
    try {
        const SQL = `
             UPDATA flawors
             SET name =$1, is_favorite= $2, update_at=now()
             WHERE id=$3 RETURNING *
        `;
        const response = await client.query(SQL,[
            req.body.name,
            req.body.is_favorite,
            req.params.id,
        ]);
        if (response.rows.length === 0) {
            res.status(404).send('Flavor not found');
        } else {
            res.send(response.rows[0]);
        }
    } catch (error) {
        next(error)
    }
});

app.get('/api/flavors/:id',async(req, res,next)=>{
    try {
        const SQL = 'SELECT * FROM flavors WHERE id=$1';
        const response = await client.query(SQL, [req.params.id]);
        if (response.rows.length === 0) {
            res.status(404).send('Flavor not found');
        } else {
            res.send(response.rows[0]);
        }
    } catch (error) {
        next(error);
    }
});

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO flavors (name, is_favorite)
            VALUES ($1, $2)
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
        res.status(201).send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});






const init = async()=>{

        await client.connect();
        console.log('connect to database');
        let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_flavorite BOOLEAN DEFAULT FALSE ,
        name VARCHAR(255) NOT NULL
    );`
        await client.query(SQL);
        console.log('table created');
        SQL= `
        INSERT INTO flavors(name, is_flavorite) VALUES('Vanilla', true);
        INSERT INTO flavors(name, is_flavorite) VALUES('Chocolate', false);
        INSERT INTO flavors(name, is_flavorite) VALUES('MintChocolate', true);`
        await client.query(SQL);
        console.log('data seeded');
        
    };
    init();
    
const port = process.env.PORT || 3000;
      app.listen(port, () => {
       console.log(`Server is running on port ${port}`);
   });
