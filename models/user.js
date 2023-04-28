'use strict';
const bcrypt = require('bcryptjs');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Course, {
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        }
      });
    }
  }
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First Name is Required'
        },
        notEmpty: {
          msg: 'Please Provide First Name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Last Name is Required'
        },
        notEmpty: {
          msg: 'Please Provide Last Name'
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'email already exist'
      },
      validate: {
        notNull: {
          msg: 'Mail Required'
        },
        notEmpty: {
          msg: 'Please provide an email address'
        },
        isEmail: {
          msg: 'Provide a valid email'
      }
     }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        if (val) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }
      },
      validate: {
        notNull: {
          msg: 'A password is required'
        },
        notEmpty: {
          msg: 'Please provide a password'
        }
      }
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User
};