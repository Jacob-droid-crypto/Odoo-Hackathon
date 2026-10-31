const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Logger (suppressed in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const path = require('path');

// Serve compiled static React dashboard
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use('/dashboard', express.static(frontendDist));

// Redirect root / to /api (or to /dashboard if browser requests HTML)
app.get('/', (req, res) => {
  if (req.accepts('html') && !req.accepts('json')) {
    return res.redirect('/dashboard');
  }
  res.redirect('/api');
});

// Prefix all endpoints with /api
app.use('/api', apiRouter);

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
