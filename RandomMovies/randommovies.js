const express = require('express');

// Use global fetch when available (Node 18+). Otherwise fall back to node-fetch (v2).
let fetchFn = typeof fetch !== 'undefined' ? fetch : null;
if (!fetchFn) {
	try {
		// node-fetch v2 supports CommonJS require
		fetchFn = require('node-fetch');
	} catch (err) {
		// leave fetchFn null — will error later with clear message
	}
}

const app = express();
const PORT = process.env.PORT || 3004;

// URL of the other movie service you will implement. It should accept `?id=<number>` and return JSON.
const MOVIE_SERVICE_URL = process.env.MOVIE_SERVICE_URL || 'http://movie:3003/';

function pickRandomItems(arr, n) {
	const res = [];
	const used = new Set();
	const limit = Math.min(n, arr.length);
	while (res.length < limit) {
		const idx = Math.floor(Math.random() * arr.length);
		if (!used.has(idx)) {
			used.add(idx);
			res.push(arr[idx]);
		}
	}
	return res;
}

async function fetchMoviesList() {
	if (!fetchFn) throw new Error('No fetch available. Install node-fetch or use Node 18+');
	const base = MOVIE_SERVICE_URL;
	// ensure we call the /movies endpoint
	const moviesUrl = base.endsWith('/') ? base + 'movies' : base + '/movies';
	const res = await fetchFn(moviesUrl);
	if (!res.ok) throw new Error(`movie service returned ${res.status}`);
	return res.json();
}

// GET /random?count=5  OR  GET /random/5
// Returns an object with requested count and the selected movies
app.get(['/random', '/random/:count'], async (req, res) => {
	try {
		const countParam = req.params.count ?? req.query.count ?? '1';
		let count = parseInt(countParam, 10);
		if (Number.isNaN(count) || count < 1) count = 1;
		const MAX = 50; // safety cap
		if (count > MAX) count = MAX;

		const movies = await fetchMoviesList();
		if (!Array.isArray(movies) || movies.length === 0) {
			return res.status(502).json({ error: 'movie service returned no movies' });
		}

		const selected = pickRandomItems(movies, count);

		res.json({ requested: count, returned: selected.length, results: selected });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`RandomMovies service listening on http://localhost:${PORT}`);
});

module.exports = app; // useful for tests or importing
