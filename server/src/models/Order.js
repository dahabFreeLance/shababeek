const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         admin:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         table:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         category:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         status:
 *           type: string
 *           enum:
 *             - Ordered
 *             - Paid
 *             - Cancelled
 *             - Refunded
 *           example: Paid
 *         paymentType:
 *           type: string
 *           enum:
 *             - Mixed
 *             - Cash
 *             - Card
 *           example: Cash
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: e05x40a8161m495p500l684e
 *               product:
 *                 type: string
 *                 example: e05x40a8161m495p500l684e
 *               price:
 *                 type: string
 *                 example: '100'
 *               count:
 *                 type: number
 *                 example: 3
 *             required:
 *               - product
 *               - price
 *               - count
 *           minItems: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2019-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2019-01-01T00:00:00.000Z
 *         __v:
 *           type: integer
 *           format: int32
 *           example: 0
 *       required:
 *         - _id
 *         - admin
 *         - table
 *         - category
 *         - status
 *         - products
 */
const OrderSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'A admin ID must be attached to the order.'],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'A table ID must be attached to the order.'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'A category ID must be attached to the order.'],
    },
    status: {
      type: String,
      required: [true, 'You must choose a status.'],
      enum: {
        values: ['Ordered', 'Paid', 'Cancelled', 'Refunded'],
        message: "The status you've chosen is invalid.",
      },
    },
    paymentType: {
      type: String,
      enum: {
        values: ['Mixed', 'Cash', 'Card'],
        message: "The payment type you've chosen is invalid.",
      },
    },
    products: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "A product ID must be attached to the order's products."],
          },
          price: {
            type: String,
            trim: true,
            required: [true, "Price can't be blank."],
          },
          count: {
            type: Number,
            trim: true,
            required: [true, "Count can't be blank."],
          },
        },
      ],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Products can't be empty.",
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
