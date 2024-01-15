/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg, { Client } from 'pg';
import express, { application } from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});



const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});

app.post('/api/entries/', async (req, res, next) => {
  try {
    const body = req.body;
    if (!body) return;
    const { title, photoUrl, notes } = body;

    if (!title) {
      throw new ClientError(400, 'missing title');
    }
    if (!photoUrl) {
      throw new ClientError(400, 'missing photoUrl');
    }
    if (!notes) {
      throw new ClientError(400, 'missing notes');
    }
    console.log(body)
    const sql = `
      insert into "entries" ("title", "notes", "photoUrl")
        values ($1, $2, $3)
        returning *;
    `;
    const result = await db.query(sql, [title, notes, photoUrl]);
    const entry = result.rows[0]
    if (!entry) {
      throw new ClientError(500, 'Failed to insert into database');
    }

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', async (req, res, next) => {});

app.get('/api/entries/', async (req, res, next) => {});

app.put('/api/entries/:entryId', async (req, res, next) => {});

app.delete('/api/entries/:entryId', async (req, res, next) => {});


app.use(errorMiddleware);
