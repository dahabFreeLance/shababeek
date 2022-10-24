const _ = require('lodash');
const pluralize = require('pluralize');

const logger = require('./logger');

/**
 * @swagger
 *   components:
 *     responses:
 *       ClientError:
 *         description: The information the user has entered is invalid.
 *       AuthorizationError:
 *         description: User is not authorized to perform this action.
 *       NotFoundError:
 *         description: The document that the user is looking for is not found.
 *       ServerError:
 *         description: An unexpected error has occurred.
 */

module.exports.reformatAndLog = (userId, error) => {
  let statusCode;
  let errors;

  error.message = userId ? `[${userId}]${error.message}` : error.message;

  switch (error.name) {
    case 'ClientError':
    case 'FileError':
      statusCode = 400;

      logger.debug(error.stack);
      break;

    case 'ValidationError': {
      errors = {};

      Object.entries(error.errors).forEach((error) => {
        errors[error[0]] = error[1].message;
      });

      const errorsKeys = Object.keys(errors);

      error.message = `${
        userId ? `[${userId}] ` : ''
      }The information you've entered is invalid for the following ${pluralize(
        'field',
        errorsKeys.length
      )}: ${errorsKeys.join(', ')}.`;
      statusCode = 400;

      logger.debug(error.stack);
      break;
    }

    case 'MongoError':
      if (error.code === 11000) {
        errors = {};

        Object.keys(error.keyPattern).forEach((key) => {
          errors[key] = `The ${_.lowerCase(key)} you've entered is already taken.`;
        });

        const errorsKeys = Object.keys(errors);

        error.message = `${
          userId ? `[${userId}] ` : ''
        }The information you've entered is invalid for the following ${pluralize(
          'field',
          errorsKeys.length
        )}: ${errorsKeys.join(', ')}.`;
        statusCode = 400;

        logger.debug(error.stack);
      } else {
        statusCode = 500;

        logger.error(error.stack);

        error.message = userId ? `[${userId}]An unexpected error has occurred.` : 'An unexpected error has occurred.';
      }
      break;

    case 'AuthorizationError':
      statusCode = 401;

      logger.debug(error.stack);
      break;

    case 'NotFoundError':
      statusCode = 404;

      logger.debug(error.stack);
      break;

    default:
      if (error.response?.config?.baseURL === 'https://accept.paymobsolutions.com/api') {
        error.name = 'PaymobError';
        error.message = userId ? `[${userId}]An unexpected error has occurred.` : 'An unexpected error has occurred.';
      }

      statusCode = 500;

      logger.error(error.stack, error.name === 'PaymobError' ? { extra: error.response.data } : undefined);

      error.message = userId ? `[${userId}]An unexpected error has occurred.` : 'An unexpected error has occurred.';
      break;
  }

  return {
    message: error.message,
    statusCode,
    errors,
  };
};
