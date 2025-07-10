import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// DB Setup
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { history: [], cashTotal: 0 };
await db.write();

// Get full state
app.get('/api/state', async (req, res) => {
  await db.read();
  res.json({
    cashTotal: db.data.cashTotal || 0,
    history: db.data.history || []
  });
});

// Add new transaction
app.post('/api/transaction', async (req, res) => {
  const txn = req.body;
  await db.read();
  db.data.history.push(txn);
  db.data.cashTotal = txn.newBalance; // Update cash total
  await db.write();
  res.status(201).json({ success: true });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
