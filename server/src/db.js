const mongoose = require('mongoose');
const path = require('path');

const logger = require('./logger');

module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    logger.info(`[${path.relative(process.cwd(), __filename)}] Database connected.`);
  } catch (error) {
    logger.error(error.stack);
  }
};

module.exports.close = async () => {
  try {
    await mongoose.connection.close();

    logger.info(`[${path.relative(process.cwd(), __filename)}] Database connection closed.`);
  } catch (error) {
    logger.error(error.stack);
  }
};

module.exports.seed = async (isClean = false) => {
  const Admin = require('./models/Admin');

  const errorHandler = require('./errorHandler');

  if (process.env.NODE_ENV === 'development') {
    const { faker } = require('@faker-js/faker'); // eslint-disable-line

    const seedAdmin = async (parent, role, email) => {
      try {
        const { name, date, phone, random } = faker;

        const genderRandomNumber = random.numeric(1);
        const minDate = new Date();
        const maxDate = new Date();

        minDate.setFullYear(minDate.getFullYear() - 120);

        const admin = new Admin({
          firstName: name.firstName(genderRandomNumber),
          lastName: name.lastName(genderRandomNumber),
          gender: ['Male', 'Female'][genderRandomNumber],
          birthdate: date.between(minDate, maxDate),
          phoneNumber: phone.number(),
          email,
          password: 'shababeek',
          role,
        });

        await admin.save();

        logger.info(
          `[${path.relative(process.cwd(), __filename)}, ${parent?._id}] Admin [${
            admin.email
          }] added successfully by admin [${parent?.email}].`
        );

        return admin;
      } catch (error) {
        errorHandler.reformatAndLog(parent?._id, error);

        throw error;
      }
    };

    try {
      if (isClean) {
        await mongoose.connection.dropDatabase();

        logger.info(`[${path.relative(process.cwd(), __filename)}] Database wiped successfully.`);
      }

      if (await Admin.findOne({})) {
        return;
      }

      const superAdmin = await seedAdmin(undefined, 'Super Admin', `superadmin@shababeek.com`);
      await seedAdmin(undefined, 'Admin', `admin@shababeek.com`);
      await seedAdmin(undefined, 'Cashier', `cashier@shababeek.com`);

      logger.info(`[${path.relative(process.cwd(), __filename)}] Admin [${superAdmin.email}] added successfully.`);

      logger.info(`[${path.relative(process.cwd(), __filename)}] Database seeded successfully.`);
    } catch (error) {
      errorHandler.reformatAndLog(undefined, error);
    }
  }
};
