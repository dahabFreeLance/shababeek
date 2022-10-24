const { createLogger, addColors, format, transports } = require('winston');

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'magenta',
  },
};

addColors(config.colors);

module.exports = createLogger({
  level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
  levels: config.levels,
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({
          format: 'D/MMM/YYYY hh:mm:ss A',
        }),
        format.printf(({ level, message, timestamp, ...rest }) => {
          const colorizer = format.colorize();

          return `${colorizer.colorize(level, `[${timestamp}] ${level}`)} ${message} ${
            Object.keys(rest).length > 0 ? JSON.stringify({ ...rest }) : ''
          }`;
        })
      ),
    }),
    new transports.File({
      filename: process.env.NODE_ENV !== 'production' ? '.log.local' : '.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});
