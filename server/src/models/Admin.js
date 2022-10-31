const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         company:
 *           type: string
 *           example: e05x40a8161m495p500l684e
 *         firstName:
 *           type: string
 *           example: Jessi
 *         lastName:
 *           type: string
 *           example: Hollander
 *         gender:
 *           type: string
 *           enum:
 *             - Male
 *             - Female
 *           example: Female
 *         birthdate:
 *           type: string
 *           format: date-time
 *           example: 1994-01-01T00:00:00.000Z
 *         phoneNumber:
 *           type: string
 *           example: '01007683940'
 *         email:
 *           type: string
 *           format: email
 *           example: tesuperadmin@shababeek.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: $2a$08$...sug/LymtJLnmtu
 *         role:
 *           type: string
 *           enum:
 *             - TE Super Admin
 *             - TE Admin
 *             - Super Admin
 *             - Admin
 *           example: TE Super Admin
 *         tokens:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 example: e05x40a8161m495p500l684e
 *               token:
 *                 type: string
 *                 example: eyJhbGc...iOiJIS_TdmCg9o
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
 *         - company
 *         - firstName
 *         - lastName
 *         - phoneNumber
 *         - email
 *         - password
 *         - role
 */
const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name can't be blank."],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name can't be blank."],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number can't be blank."],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address can't be blank."],
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "The email address you've entered is invalid.",
      },
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password can't be blank."],
      validate: {
        validator: (value) =>
          validator.isLength(value, {
            min: 8,
          }),
        message: 'Your password must be at least 8 characters long.',
      },
    },
    role: {
      type: String,
      required: [true, 'You must choose a role.'],
      enum: {
        values: ['Super Admin', 'Admin', 'Cashier'],
        message: "The role you've chosen is invalid.",
      },
    },
    tokens: [
      {
        token: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

adminSchema.statics.findByCredentials = async (email, password) => {
  const error = new Error();

  error.name = 'NotFoundError';
  error.message = "We couldn't find an account with that email and password combination.";

  if (!email || !password) {
    throw error;
  }

  const admin = await Admin.findOne({
    email,
  });

  if (!admin) {
    throw error;
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw error;
  }

  return admin;
};

adminSchema.methods.generateAuthToken = async function () {
  const admin = this;
  const token = jwt.sign(
    {
      id: admin.id,
    },
    process.env.JWT_SECRET
  );

  admin.tokens = admin.tokens.concat({
    token,
  });

  await admin.save();

  return token;
};

adminSchema.pre('save', async function (next) {
  const admin = this;

  if (admin.isModified('password')) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }

  next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
