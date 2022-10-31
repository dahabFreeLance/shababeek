const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const Product = require('../../models/Product');
const auth = require('../../middleware/auth');
const errorHandler = require('../../errorHandler');

const router = express.Router();

const populate = [
  {
    path: 'category',
    options: {
      select: 'name',
    },
  },
];

/**
 * @swagger
 * tags:
 *   name: products
 */

/**
 * @swagger
 * paths:
 *   /products:
 *     post:
 *       tags:
 *         - products
 *       operationId: create
 *       summary: Creates a new product.
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
 *                   example: pepsi
 *                 description:
 *                   type: string
 *                   example: original pepsi taste
 *                 price:
 *                   type: string
 *                   example: '6'
 *                 imageUrl:
 *                   type: string
 *                   example: http://localhost:5001/.../pepsi.jpg
 *                 minimumOrdered:
 *                   type: number
 *                   example: 1
 *                 maximumOrdered:
 *                   type: number
 *                   example: 12
 *                 isActive:
 *                   type: string
 *                   example: true
 *                   default: true
 *               required:
 *                 - name
 *                 - description
 *                 - price
 *                 - imageUrl
 *                 - minimumOrdered
 *                 - maximumOrdered
 *                 - isActive
 *       responses:
 *         201:
 *           description: Product created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Product'
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

    const product = new Product(req.body);

    await product.save();

    await Product.populate(product, populate);

    res.status(201).json(product);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /products:
 *     get:
 *       tags:
 *         - products
 *       operationId: read
 *       summary: Reads list of products.
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
 *           description: List of products returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Product'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const match = {};

    let fields;

    if (req.query.category) {
      match.category = req.query.category;
    }

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

    const products = await Product.find(match)
      .select(fields)
      .limit(Number(req.query.limit))
      .skip(Number(req.query.skip))
      .sort(sort)
      .populate(populate);

    res.json(products);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /products/{id}:
 *     get:
 *       tags:
 *         - products
 *       operationId: readById
 *       summary: Reads a product by ID.
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
 *           description: Product returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Product'
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
    error.message = "We couldn't find the product you are looking for.";

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

    const product = await Product.findOne(match).select(fields).populate(populate);

    if (!product) {
      throw error;
    }

    res.json(product);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /products/{id}:
 *     patch:
 *       tags:
 *         - products
 *       operationId: updateById
 *       summary: Updates a product by ID.
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
 *                   example: pepsi
 *                 description:
 *                   type: string
 *                   example: original pepsi taste
 *                 price:
 *                   type: string
 *                   example: '6'
 *                 imageUrl:
 *                   type: string
 *                   example: http://localhost:5001/.../pepsi.jpg
 *                 minimumOrdered:
 *                   type: number
 *                   example: 1
 *                 maximumOrdered:
 *                   type: number
 *                   example: 12
 *                 isActive:
 *                   type: string
 *                   example: true
 *                   default: true
 *       responses:
 *         200:
 *           description: Product updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Product'
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
    error.message = "We couldn't find the product you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const updatesKeys = Object.keys(req.body);
    const allowedUpdatesKeys = ['description', 'price', 'imageUrl', 'minimumOrdered', 'maximumOrdered', 'isActive'];
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

    const product = await Product.findOne(match);

    if (!product) {
      throw error;
    }

    updatesKeys.forEach((updatesKey) => {
      product[updatesKey] = req.body[updatesKey];
    });

    await product.save();

    await Product.populate(product, populate);

    res.json(product);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /products/{id}:
 *     delete:
 *       tags:
 *         - products
 *       operationId: deleteById
 *       summary: Deletes a product by ID.
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
 *           description: Product deleted successfully.
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
    error.message = "We couldn't find the product you are looking for.";

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

    const product = await Product.findOneAndDelete(match);

    if (!product) {
      throw error;
    }

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

module.exports = router;
