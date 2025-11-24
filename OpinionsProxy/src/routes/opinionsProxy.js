const express = require('express');
const router = express.Router();
const { getMovieOpinions } = require('../controllers/opinionsProxyController');

// GET /api/opinions/movie/:movieId -> returns opinions and average score
router.get('/movie/:movieId', getMovieOpinions);

module.exports = router;
