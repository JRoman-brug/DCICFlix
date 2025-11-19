const express = require('express');
const { MovieStats, Opinion } = require('../models/Opinion');

const router = express.Router();

router.get('/movie/:movieId', async (req, res) => {
    const { movieId } = req.params;
    try {
        const stats = await MovieStats.findOne({ movieId }).lean();
        const opinions = await Opinion.find({ movieId }).sort({ createdAt: -1 }).limit(50).lean();
        return res.json({ stats, opinions });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno' });
    }
});

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const opinions = await Opinion.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
        return res.json({ opinions });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno' });
    }
});

module.exports = router;
