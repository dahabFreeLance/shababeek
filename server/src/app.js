const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');

const app = express();

db.connect();
db.seed();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

app.use('/api/v1/admins', require('./routes/v1/admins'));
app.use('/api/v1/tables', require('./routes/v1/tables'));
app.use('/api/v1/categories', require('./routes/v1/categories'));
app.use('/api/v1/products', require('./routes/v1/products'));
app.use('/api/v1/orders', require('./routes/v1/orders'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../../client/build/index.html')));
} else {
  const swaggerJsdoc = require('swagger-jsdoc'); // eslint-disable-line
  const swaggerUi = require('swagger-ui-express'); // eslint-disable-line

  app.use(
    '/api/v1/docs',
    swaggerUi.serve,
    swaggerUi.setup(
      swaggerJsdoc({
        definition: {
          openapi: '3.0.0',
          info: {
            title: 'Shababeek',
            description: 'Cafe point of sale',
            version: '1.0.0',
          },
          servers: [
            {
              url: 'http://localhost:5001/api/v1',
            },
          ],
        },
        apis: [
          `${path.join(__dirname, 'models/*.js')}`,
          `${path.join(__dirname, 'routes/v1/*.js')}`,
          `${path.join(__dirname, 'middleware/*.js')}`,
          `${path.join(__dirname, 'errorHandler.js')}`,
        ],
      })
    )
  );
}

module.exports = app;
