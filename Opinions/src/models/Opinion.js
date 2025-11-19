const mongoose = require('mongoose');

const OpinionSchema = new mongoose.Schema({
    ratingId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    movieId: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    comment: { type: String, default: '' },
    createdAt: { type: Date, required: true }
});

// colección de estadísticas por película 
const MovieStatsSchema = new mongoose.Schema({
    movieId: { type: String, required: true, unique: true },
    avgScore: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    sumScore: { type: Number, default: 0 }
});

const Opinion = mongoose.model('Opinion', OpinionSchema);
const MovieStats = mongoose.model('MovieStats', MovieStatsSchema);

module.exports = { Opinion, MovieStats };
