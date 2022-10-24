const jwt = require('jsonwebtoken');

const Admin = require('../models/Admin');
const errorHandler = require('../errorHandler');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

module.exports = (allowedUserTypes = ['admin', 'guest']) => async (req, res, next) => {
  try {
    const { userType } = req.query;

    if (userType === 'guest') {
      next();
    } else {
      const error = new Error();

      error.name = 'AuthorizationError';
      error.message = "You aren't authorized to perform this action.";

      if (!allowedUserTypes.includes(userType)) {
        throw error;
      }

      let token = req.header('Authorization');

      if (!token || !token.startsWith('Bearer ')) {
        throw error;
      }

      token = token.replace('Bearer ', '');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await {
        admin: Admin,
      }[userType].findOne({
        _id: decoded.id,
        'tokens.token': token,
      });

      if (!user) {
        throw error;
      }

      req.token = token;
      req[userType] = user;

      next();
    }
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(undefined, error);

    res.status(reformattedError.statusCode).send(reformattedError);
  }
};
