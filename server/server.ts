/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg, { Client } from 'pg';
import express, { application } from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { error } from 'console';

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
    console.log(body);
    const sql = `
      insert into "entries" ("title", "notes", "photoUrl")
        values ($1, $2, $3)
        returning *;
    `;
    const result = await db.query(sql, [title, notes, photoUrl]);
    const entry = result.rows[0];
    if (!entry) {
      throw new ClientError(500, 'Failed to insert into database');
    }

    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/', async (req, res, next) => {
  try {
    const sql = `
    select * from "entries" order by "entryId" desc
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new ClientError(400, 'entryId must be a positive integer');
    }
    const sql = `
    select * from "entries" where "entryId" = $1
    `;

    const params = [entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) {
      res.status(404).json({ error: 'id could not be found' });
      throw new ClientError(404, 'id could not be found');
    }
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new ClientError(400, 'entryId must be a positive integer');
    }
    console.log('passed entryId', entryId);

    const body = req.body;
    console.log('body', body);
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

    const sql = `
      update "entries"
      set "title" = $1,
          "photoUrl" = $2,
          "notes" = $3
          where "entryId" = $4
      returning *
    `;
    const params = [title, photoUrl, notes, entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) {
      res.status(404).json({ error: 'failed to update' });
      throw new ClientError(404, 'failed to update');
    }
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  console.log('delete');
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new ClientError(400, 'gradeId must be a positive integer');
    }

    const sql = `
      delete from "entries"
      where "entryId" = $1
      returning *
    `;

    const params = [entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    console.log('result', result);
    console.log('entry', entry);
    if (!entry) {
      res.status(404).json({ error: 'id could not be found' });
      throw new ClientError(404, 'id could not be found');
    }
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);
