import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/fitbitAuth.js';
import dataRoutes from './routes/fitbitData.js';
import indexRouter from './routes/index.js';



// define server host and port
const host = process.env.HOST || '127.0.0.1';
const port = process.env.PORT || 4000;

// Create express app
const app = express();
// Parse cookies
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// host the static site
app.use(express.static(path.join(import.meta.dirname, './website')));

// api routes
app.use('/status/', indexRouter);
app.use('/auth/', authRoutes);
app.use('/api/', dataRoutes);

// error handling https://www.robinwieruch.de/node-express-error-handling/
app.use((error, req, res, next) => {
  return res.status(500).json({ error: error.toString() });
});

// Start the HTTP server and listen for requests
app.listen(port, host, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });