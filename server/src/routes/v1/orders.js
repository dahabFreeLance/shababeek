const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const Order = require('../../models/Order');
const auth = require('../../middleware/auth');
const errorHandler = require('../../errorHandler');

const router = express.Router();

const populate = [
  {
    path: 'admin',
    options: {
      select: 'firstName lastName',
    },
  },
  {
    path: 'table',
    options: {
      select: 'name',
    },
  },
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
 *   name: orders
 */

/**
 * @swagger
 * paths:
 *   /orders:
 *     post:
 *       tags:
 *         - orders
 *       operationId: create
 *       summary: Creates a new order.
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
 *                 admin:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 table:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 category:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 status:
 *                   type: string
 *                   enum:
 *                     - Ordered
 *                     - Paid
 *                     - Cancelled
 *                     - Refunded
 *                   example: Paid
 *                 paymentType:
 *                   type: string
 *                   enum:
 *                     - Mixed
 *                     - Cash
 *                     - Card
 *                   example: Cash
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         example: e05x40a8161m495p500l684e
 *                       price:
 *                         type: string
 *                         example: '100'
 *                       count:
 *                         type: number
 *                         example: 3
 *                     required:
 *                       - product
 *                       - price
 *                       - count
 *                   minItems: 1
 *               required:
 *                 - _id
 *                 - admin
 *                 - category
 *                 - status
 *                 - products
 *       responses:
 *         201:
 *           description: Order created successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Order'
 *         400:
 *           $ref: '#/components/responses/ClientError'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const order = new Order(req.body);

    await order.save();

    await Order.populate(order, populate);

    res.status(201).json(order);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /orders:
 *     get:
 *       tags:
 *         - orders
 *       operationId: read
 *       summary: Reads list of orders.
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
 *           description: List of orders returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Order'
 *         401:
 *           $ref: '#/components/responses/AuthorizationError'
 *         500:
 *           $ref: '#/components/responses/ServerError'
 */
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const match = {};

    let fields;

    switch (req.admin.role) {
      case 'Super Admin':
      case 'Admin':
        if (req.query.admin) {
          match.admin = req.query.admin;
        }
        break;

      case 'Cashier':
        match.admin = req.admin._id;
        break;

      default:
        break;
    }

    if (req.query.category) {
      match.category = req.query.category;
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

    const orders = await Order.find(match)
      .select(fields)
      .limit(Number(req.query.limit))
      .skip(Number(req.query.skip))
      .sort(sort)
      .populate(populate);

    res.json(orders);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /orders/{id}:
 *     get:
 *       tags:
 *         - orders
 *       operationId: readById
 *       summary: Reads a order by ID.
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
 *           description: Order returned successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Order'
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
    error.message = "We couldn't find the order you are looking for.";

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

    const order = await Order.findOne(match).select(fields).populate(populate);

    if (!order) {
      throw error;
    }

    res.json(order);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /orders/{id}:
 *     patch:
 *       tags:
 *         - orders
 *       operationId: updateById
 *       summary: Updates a order by ID.
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
 *                 admin:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 table:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 category:
 *                   type: string
 *                   example: e05x40a8161m495p500l684e
 *                 status:
 *                   type: string
 *                   enum:
 *                     - Ordered
 *                     - Paid
 *                     - Cancelled
 *                     - Refunded
 *                   example: Paid
 *                 paymentType:
 *                   type: string
 *                   enum:
 *                     - Mixed
 *                     - Cash
 *                     - Card
 *                   example: Cash
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         example: e05x40a8161m495p500l684e
 *                       price:
 *                         type: string
 *                         example: '100'
 *                       count:
 *                         type: number
 *                         example: 3
 *                     required:
 *                       - product
 *                       - price
 *                       - count
 *                   minItems: 1
 *       responses:
 *         200:
 *           description: Order updated successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Order'
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
    error.message = "We couldn't find the order you are looking for.";

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw error;
    }

    const updatesKeys = Object.keys(req.body);
    const allowedUpdatesKeys = ['status', 'paymentType', 'products'];
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

    const order = await Order.findOne(match);

    if (!order) {
      throw error;
    }

    updatesKeys.forEach((updatesKey) => {
      order[updatesKey] = req.body[updatesKey];
    });

    await order.save();

    await Order.populate(order, populate);

    res.json(order);
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

/**
 * @swagger
 * paths:
 *   /orders/{id}:
 *     delete:
 *       tags:
 *         - orders
 *       operationId: deleteById
 *       summary: Deletes a order by ID.
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
 *           description: Order deleted successfully.
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
    error.message = "We couldn't find the order you are looking for.";

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

    const order = await Order.findOneAndDelete(match);

    if (!order) {
      throw error;
    }

    res.json();
  } catch (error) {
    const reformattedError = errorHandler.reformatAndLog(req.admin._id, error);

    res.status(reformattedError.statusCode).json(reformattedError);
  }
});

module.exports = router;
