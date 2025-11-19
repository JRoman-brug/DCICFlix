const express = require('express');
const pino = require('pino')();
const ratingsRouter = require('./routes/ratings');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    pino.info({ method: req.method, url: req.url }, 'request');
    next();
});

app.use('/api/ratings', ratingsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
