const express = require('express');
const pino = require('pino')();
const opinionsRouter = require('./routes/opinions');

const app = express();
app.use(express.json());

app.use('/api/opinions', opinionsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
