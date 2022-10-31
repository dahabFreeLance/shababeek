const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const Admin = require('../../models/Admin');
const auth = require('../../middleware/auth');
const errorHandler = require('../../errorHandler');

const router = express.Router();

const populate = [];

/**
 * @swagger
 * tags:
 *   name: admins
 */

/**
 * @swagger
 * paths:
 *   /admins:
 *     post:
 *       tags:
 *         - admins
 *       operationId: create
 *       summary: Creates a new admin.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: accessCode
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: Jessi
 *                 lastName:
 *                   type: string
 *                   example: Hollander
 *                 phoneNumber:
 *                   type: string
 *                   example: 01007683940
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: tesuperadmin@shababeek.com
 *                 password:
 *                   type: string
 *                   format: password
 *                   minLength: 8
 *                   example: shababeek
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - phoneNumber
 *                 - email
 *                 - password
 *       responses:
 *         201:
 *           description: Admin created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Admin'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const admin = new Admin({ ...req.body });

    await admin.save();

    const token = await admin.generateAuthToken();

    await Admin.populate(admin, populate);

    res.status(201).json({
      admin,
      token,
    });
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.accessCode.admin, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/login:
 *     post:
 *       tags:
 *         - admins
 *       operationId: logIn
 *       summary: Logs in.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: guest
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: tesuperadmin@shababeek.com
 *                 password:
 *                   type: string
 *                   format: password
 *                   minLength: 8
 *                   example: shababeek
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         200:
 *           description: Logged in successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   admin:
 *                     type: object
 *                     $ref: '#/components/schemas/Admin'
 *                   token:
 *                     type: string
 *                     example: eyJhbGc...iOiJIS_TdmCg9o
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/login', auth(['guest']), async (req, res) => {
  try {
    const admin = await Admin.findByCredentials(req.body.email, req.body.password);

    const token = await admin.generateAuthToken();

    await Admin.populate(admin, populate);

    res.json({
      admin,
      token,
    });
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(undefined, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/logout:
 *     post:
 *       tags:
 *         - admins
 *       operationId: logOut
 *       summary: Logs out.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       responses:
 *         200:
 *           description: Logged out successfully.
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/logout', auth(['admin']), async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter((token) => token.token !== req.token);

    await req.admin.save();

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/logout-all:
 *     post:
 *       tags:
 *         - admins
 *       operationId: logOutAll
 *       summary: Logs out from all devices.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       responses:
 *         200:
 *           description: Logged out from all devices successfully.
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/logout-all', auth(['admin']), async (req, res) => {
  try {
    req.admin.tokens = [];

    await req.admin.save();

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/me:
 *     get:
 *       tags:
 *         - admins
 *       operationId: readMe
 *       summary: Reads logged in admin information.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       responses:
 *         200:
 *           description: Admin returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Admin'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/me', auth(['admin']), async (req, res) => {
  try {
    await Admin.populate(req.admin, populate);

    res.json(req.admin);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins:
 *     get:
 *       tags:
 *         - admins
 *       operationId: read
 *       summary: Reads list of admins.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *         - in: query
 *           name: company
 *           schema:
 *             type: string
 *           example: e05x40a8161m495p500l684e
 *         - in: query
 *           name: role
 *           schema:
 *             type: string
 *           example: teSuperAdmin
 *         - in: query
 *           name: fields
 *           schema:
 *             type: string
 *           example: -_id,firstName,lastName
 *         - in: query
 *           name: limit
 *           schema:
 *             type: number
 *           example: 10
 *         - in: query
 *           name: skip
 *           schema:
 *             type: number
 *           example: 20
 *         - in: query
 *           name: sortBy
 *           schema:
 *             type: string
 *           example: createdAt:asc
 *       responses:
 *         200:
 *           description: List of admins returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Admin'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const match = {};

    let fields;

    if (req.query.fields) {
      fields = req.query.fields.replace(/,/g, ' ');
    }

    const sort = {};

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');

      if (parts[1]) {
        switch (parts[1].toLowerCase()) {
          case 'desc':
            sort[parts[0]] = -1;
            break;

          case 'asc':
            sort[parts[0]] = 1;
            break;

          default:
            break;
        }
      }
    } else {
      sort.createdAt = -1;
    }

    const admins = await Admin.find(match)
      .select(fields)
      .limit(Number(req.query.limit))
      .skip(Number(req.query.skip))
      .sort(sort)
      .populate(populate);

    res.json(admins);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/{id}:
 *     get:
 *       tags:
 *         - admins
 *       operationId: readById
 *       summary: Reads an admin by ID.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           example: e05x40a8161m495p500l684e
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *         - in: query
 *           name: fields
 *           schema:
 *             type: string
 *           example: -_id,firstName,lastName
 *       responses:
 *         200:
 *           description: Admin returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Admin'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const error = new Error();

    error.name = 'NotFoundError';
    error.message = "We couldn't find the admin you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const match = {
      _id: req.params.id,
    };

    let fields;

    if (req.query.fields) {
      fields = req.query.fields.replace(/,/g, ' ');
    }

    const admin = await Admin.findOne(match).select(fields).populate(populate);

    if (!admin) {
      throw error;
    }

    res.json(admin);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/me:
 *     patch:
 *       tags:
 *         - admins
 *       operationId: updateMe
 *       summary: Updates logged in admin.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: Jessi
 *                 lastName:
 *                   type: string
 *                   example: Hollander
 *                 gender:
 *                   type: string
 *                   enum: ['Male', 'Female']
 *                   example: Female
 *                 birthdate:
 *                   type: string
 *                   format: date-time
 *                   example: 1994-01-01T00:00:00.000Z
 *                 phoneNumber:
 *                   type: string
 *                   example: 01007683940
 *                 password:
 *                   type: string
 *                   format: password
 *                   minLength: 8
 *                   example: shababeek
 *       responses:
 *         200:
 *           description: Admin updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Admin'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.patch('/me', auth(['admin']), async (req, res) => {
  try {
    const updatesKeys = Object.keys(req.body);
    const allowedUpdatesKeys = ['firstName', 'lastName', 'phoneNumber', 'password'];
    const isValidOperation = updatesKeys.every((updatesKey) => allowedUpdatesKeys.includes(updatesKey));

    if (!isValidOperation) {
      const error = new Error();

      error.name = 'ValidationError';
      error.errors = {};

      updatesKeys.forEach((updatesKey) => {
        if (!allowedUpdatesKeys.includes(updatesKey)) {
          error.errors[updatesKey] = { message: `${_.upperFirst(_.lowerCase(updatesKey))} cannot be modified.` };
        }
      });

      throw error;
    }

    updatesKeys.forEach((updatesKey) => {
      req.admin[updatesKey] = req.body[updatesKey];
    });

    await req.admin.save();

    await Admin.populate(req.admin, populate);

    res.json(req.admin);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/{id}:
 *     patch:
 *       tags:
 *         - admins
 *       operationId: updateById
 *       summary: Updates an admin by ID.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           example: e05x40a8161m495p500l684e
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       requestBody:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: Jessi
 *                 lastName:
 *                   type: string
 *                   example: Hollander
 *                 gender:
 *                   type: string
 *                   enum: ['Male', 'Female']
 *                   example: Female
 *                 birthdate:
 *                   type: string
 *                   format: date-time
 *                   example: 1994-01-01T00:00:00.000Z
 *                 phoneNumber:
 *                   type: string
 *                   example: 01007683940
 *                 password:
 *                   type: string
 *                   format: password
 *                   minLength: 8
 *                   example: shababeek
 *       responses:
 *         200:
 *           description: Admin updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Admin'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.patch('/:id', auth(['admin']), async (req, res) => {
  try {
    const error = new Error();

    error.name = 'NotFoundError';
    error.message = "We couldn't find the admin you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const updatesKeys = Object.keys(req.body);
    const allowedUpdatesKeys = ['firstName', 'lastName', 'phoneNumber', 'password'];
    const isValidOperation = updatesKeys.every((updatesKey) => allowedUpdatesKeys.includes(updatesKey));

    if (!isValidOperation) {
      error.name = 'ValidationError';
      error.errors = {};

      updatesKeys.forEach((updatesKey) => {
        if (!allowedUpdatesKeys.includes(updatesKey)) {
          error.errors[updatesKey] = { message: `${_.upperFirst(_.lowerCase(updatesKey))} cannot be modified.` };
        }
      });

      throw error;
    }

    const match = {
      _id: req.params.id,
    };

    const admin = await Admin.findOne(match);

    if (!admin) {
      throw error;
    }

    updatesKeys.forEach((updatesKey) => {
      admin[updatesKey] = req.body[updatesKey];
    });

    await admin.save();

    await Admin.populate(admin, populate);

    res.json(admin);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/me:
 *     delete:
 *       tags:
 *         - admins
 *       operationId: deleteMe
 *       summary: Deletes logged in admin.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       responses:
 *         200:
 *           description: Admin deleted successfully.
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.delete('/me', auth(['admin']), async (req, res) => {
  try {
    await req.admin.remove();

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /admins/{id}:
 *     delete:
 *       tags:
 *         - admins
 *       operationId: deleteById
 *       summary: Deletes an admin by ID.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           example: e05x40a8161m495p500l684e
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       responses:
 *         200:
 *           description: Admin deleted successfully.
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const error = new Error();

    error.name = 'NotFoundError';
    error.message = "We couldn't find the admin you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const match = {
      _id: req.params.id,
    };

    const admin = await Admin.findOneAndDelete(match);

    if (!admin) {
      throw error;
    }

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

module.exports = router;
