'use strict';

const { Sequelize, Model } = require('sequelize');
const { sequelize } = require('./index');
// const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    class Course extends Model {}
    Course.init({
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              notEmpty: true
            }
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
              notEmpty: true
            }
          },
          estimatedTime: {
            type: Sequelize.STRING,
            allowNull: true
          },
          materialsNeeded: {
            type: Sequelize.STRING,
            allowNull: true
          },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false
          }
    }, { sequelize });

    Course.associate = models => {
        Course.belongsTo(models.User, { foreignKey: 'userId' });
      };

    return Course
};