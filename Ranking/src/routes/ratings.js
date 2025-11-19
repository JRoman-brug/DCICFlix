const express = require('express');
const { body } = require('express-validator');
const { createRating } = require('../controllers/ratingController');

const router = express.Router();

router.post('/',
    [
        body('userId').isString().notEmpty(),
        body('movieId').isString().notEmpty(),
        body('score').isNumeric().custom(v => v >= 0 && v <= 10),
        body('comment').optional().isString()
    ],
    createRating
);

module.exports = router;
