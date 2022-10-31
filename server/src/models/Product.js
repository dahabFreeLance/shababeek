const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         category:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         name:
 *           type: string
 *           example: pepsi
 *         description:
 *           type: string
 *           example: original pepsi taste
 *         price:
 *           type: string
 *           example: '6'
 *         imageUrl:
 *           type: string
 *           example: http://localhost:5001/.../pepsi.jpg
 *         minimumOrdered:
 *           type: number
 *           example: 1
 *         maximumOrdered:
 *           type: number
 *           example: 12
 *         isActive:
 *           type: boolean
 *           default: true
 *           example: true
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
 *         - name
 *         - description
 *         - price
 *         - imageUrl
 *         - minimumOrdered
 *         - maximumOrdered
 *         - isActive
 */
const ProductSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'A category ID must be attached to the product.'],
    },
    name: {
      type: String,
      unique: true,
      required: [true, "Name can't be blank."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description can't be blank."],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price can't be blank."],
      trim: true,
    },
    imageUrl: String,
    minimumOrdered: {
      type: Number,
      required: [true, "Minimum ordered can't be blank."],
      trim: true,
    },
    maximumOrdered: {
      type: Number,
      required: [true, "Maximum ordered can't be blank."],
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: [true, "Active status can't be blank."],
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
