const express = require('express');
const { body } = require('express-validator');
const { createRating } = require('../controllers/ratingController');

const router = express.Router();

router.post('/',
    [
        body('userId').isString(),
        body('userMail').optional().isEmail(),
        body('movieId').isString().notEmpty(),
        body('score').isNumeric().custom(v => v >= 0 && v <= 5),
        body('comment').optional().isString()
    ],
    createRating
);

module.exports = router;
