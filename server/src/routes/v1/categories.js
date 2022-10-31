const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const Category = require('../../models/Category');
const auth = require('../../middleware/auth');
const errorHandler = require('../../errorHandler');

const router = express.Router();

const populate = [];

/**
 * @swagger
 * tags:
 *   name: categories
 */

/**
 * @swagger
 * paths:
 *   /categories:
 *     post:
 *       tags:
 *         - categories
 *       operationId: create
 *       summary: Creates a new category.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: Cold Drinks
 *                 description:
 *                   type: string
 *                   example: Cool drinks
 *                 isActive:
 *                   type: string
 *                   example: true
 *                   default: true
 *               required:
 *                 - name
 *                 - description
 *                 - isActive
 *       responses:
 *         201:
 *           description: Category created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/', auth(['admin']), async (req, res) => {
  try {
    switch (req.admin.role) {
      case 'Admin':
      case 'Cashier': {
        const error = new Error();

        error.name = 'AuthorizationError';
        error.message = "You aren't authorized to perform this action.";

        throw error;
      }

      default:
        break;
    }

    const category = new Category(req.body);

    await category.save();

    await Category.populate(category, populate);

    res.status(201).json(category);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /categories:
 *     get:
 *       tags:
 *         - categories
 *       operationId: read
 *       summary: Reads list of categories.
 *       security:
 *        - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: userType
 *           schema:
 *             type: string
 *           example: admin
 *         - in: query
 *           name: fields
 *           schema:
 *             type: string
 *           example: -_id,name
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
 *           description: List of categories returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const match = {};

    let fields;

    if (req.query.isActive) {
      match.isActive = {
        true: true,
        false: false,
      }[req.query.isActive];
    }

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

    const categories = await Category.find(match)
      .select(fields)
      .limit(Number(req.query.limit))
      .skip(Number(req.query.skip))
      .sort(sort)
      .populate(populate);

    res.json(categories);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /categories/{id}:
 *     get:
 *       tags:
 *         - categories
 *       operationId: readById
 *       summary: Reads a category by ID.
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
 *           example: -_id,name
 *       responses:
 *         200:
 *           description: Category returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
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
    error.message = "We couldn't find the category you are looking for.";

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

    const category = await Category.findOne(match).select(fields).populate(populate);

    if (!category) {
      throw error;
    }

    res.json(category);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /categories/{id}:
 *     patch:
 *       tags:
 *         - categories
 *       operationId: updateById
 *       summary: Updates a category by ID.
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
 *                 name:
 *                   type: string
 *                   example: Cold Drinks
 *                 description:
 *                   type: string
 *                   example: Cool drinks
 *                 isActive:
 *                   type: string
 *                   example: true
 *       responses:
 *         200:
 *           description: Category updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Category'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         404:
 *           $ref: '#/components/responses/NotFoundError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.patch('/:id', auth(['admin']), async (req, res) => {
  try {
    const error = new Error();

    error.name = 'NotFoundError';
    error.message = "We couldn't find the category you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const updatesKeys = Object.keys(req.body);
    const allowedUpdatesKeys = ['description', 'isActive'];
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

    switch (req.admin.role) {
      case 'Admin':
      case 'Cashier':
        error.name = 'AuthorizationError';
        error.message = "You aren't authorized to perform this action.";

        throw error;

      default:
        break;
    }

    const match = {
      _id: req.params.id,
    };

    const category = await Category.findOne(match);

    if (!category) {
      throw error;
    }

    updatesKeys.forEach((updatesKey) => {
      category[updatesKey] = req.body[updatesKey];
    });

    await category.save();

    await Category.populate(category, populate);

    res.json(category);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /categories/{id}:
 *     delete:
 *       tags:
 *         - categories
 *       operationId: deleteById
 *       summary: Deletes a category by ID.
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
 *           description: Category deleted successfully.
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
    error.message = "We couldn't find the category you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    switch (req.admin.role) {
      case 'Admin':
      case 'Cashier':
        error.name = 'AuthorizationError';
        error.message = "You aren't authorized to perform this action.";

        throw error;

      default:
        break;
    }

    const match = {
      _id: req.params.id,
    };

    const category = await Category.findOne(match);

    if (!category) {
      throw error;
    }

    await category.remove();

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

module.exports = router;
