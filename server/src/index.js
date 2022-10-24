const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv'); // eslint-disable-line

  dotenv.config({
    path: path.resolve(__dirname, '../.env.development.local'),
  });
}

const app = require('./app');
const logger = require('./logger');

const port = process.env.PORT;

app.listen(port, () => logger.info(`[${path.relative(process.cwd(), __filename)}] Server is up on port [${port}].`));
