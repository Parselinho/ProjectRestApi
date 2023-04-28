'use strict';

const { Sequelize, Model } = require('sequelize');
const { sequelize } = require('./index');
const bcrypt = require('bcrypt');
const course = require('./course');

module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'First Name is Required'
                },
                notEmpty: {
                    msg: "Please Provide First Name"
                },
            },
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'Last Name is Required'
                },
                notEmpty: {
                    msg: "Please Provide Last Name"
                },
            },
        },
        emailAdress: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                msg: 'email already exist'
            },
            validate: {
                notNull: {
                    msg: 'Mail Required'
                },
                isEmail: {
                    msg: 'Provide a valid email'
                },
            },
        },
        password: {
            type: Sequelize.VIRTUAL,  
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A password is required'
              },
              notEmpty: {
                msg: 'Please provide a password'
              },
              len: {
                args: [8, 20],
                msg: 'The password should be between 8 and 20 characters in length'
              }
            }
          },
          confirmedPassword: {
            type: Sequelize.STRING,
            allowNull: false,
            set(val) {
              if (val === this.password) {
                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue('confirmedPassword', hashedPassword);
              }
            },
            validate: {
              notNull: {
                msg: 'Both passwords must match'
              },
            },
          },
    }, {sequelize});

    User.associate = models => {
        User.hasMany(models.Course, { foreignKey: 'userId' });
      };

    return User;
};