'use strict';

const { Sequelize, Model } = require('sequelize');
const { sequelize } = require('./index');

module.exports = (sequelize) => {
    // Define the Course model
    class Course extends Model {}
    Course.init({
        title: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'Title is Required'
              },
              notEmpty: {
                msg: 'Please Provide A Title'
              },
            }
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'Description is Required'
              },
              notEmpty: {
                msg: 'Please Provide A Description'
              },
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

    // Define the Course association with the User model
    Course.associate = models => {
        Course.belongsTo(models.User, { foreignKey: 'userId' });
      };

    return Course
};
