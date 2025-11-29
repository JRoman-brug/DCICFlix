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

// DELETE an opinion by its Mongo _id (or ratingId if provided)
router.delete('/:opinionId', async (req, res) => {
    const { opinionId } = req.params;
    try {
        // Try to find by _id first
        let op = await Opinion.findOne({ _id: opinionId }).lean();
        if (!op) {
            // fallback: try ratingId match
            op = await Opinion.findOne({ ratingId: opinionId }).lean();
        }
        if (!op) return res.status(404).json({ error: 'Opinion not found' });

        // Remove the opinion
        await Opinion.deleteOne({ _id: op._id });

        // Update MovieStats decrementing count and sumScore
        const stats = await MovieStats.findOne({ movieId: op.movieId });
        if (stats) {
            stats.count = Math.max(0, (stats.count || 0) - 1);
            stats.sumScore = Math.max(0, (stats.sumScore || 0) - (op.score || 0));
            stats.avgScore = stats.count > 0 ? (stats.sumScore / stats.count) : 0;
            await stats.save();
        }

        return res.json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error interno' });
    }
});

module.exports = router;
