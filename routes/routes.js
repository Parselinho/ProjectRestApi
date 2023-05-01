'use strict';

const express = require('express');
const { User, Course } = require('../models');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth-user');
const { asyncHandler } = require('../middleware/async-handler');

router.use(express.json());

// Get the current user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.currentUser.id, {
    attributes: ['id', 'firstName', 'lastName', 'emailAddress'],
  });
  res.status(200).json(user);
}));

// Create a new user
router.post('/users', asyncHandler(async (req, res, next) => {
  try {
    await User.create(req.body);
    res.status(201).location('/').end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      // Handle unique constraint errors
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      // Pass other errors to the global error handler
      next(error);
    }
  }
}));


// Get all courses with associated user info
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName', 'emailAddress']
      }
    ]
  });
  res.status(200).json(courses);
}));

// Create a new course
router.post('/courses', authenticateUser, asyncHandler(async (req, res, next) => {
  try {
    // Associate the current user with the new course
    const newCourse = await Course.create({ ...req.body, userId: req.currentUser.id });
    res.status(201).location(`/api/courses/${newCourse.id}`).end();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      // Handle validation errors
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      // Pass other errors to the global error handler
      next(error);
    }
  }
}));

// Get, update, or delete a specific course
router.route('/courses/:id')
  .get(asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'emailAddress'] }]
    });
    // If the course exists, send it as JSON; otherwise, send a 404 error
    course ? res.status(200).json(course) : res.status(404).json({ message: 'Course not found' });
  }))
  .put(authenticateUser, asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      if (course.userId === req.currentUser.id) {
        const { title, description } = req.body;

        // Check if title and description are provided
        if (!title || !description) {
          // Send a 400 error if either field is missing
          const errors = [];

          if (!title) errors.push('Title is required');
          if (!description) errors.push('Description is required');

          res.status(400).json({ errors });
        } else {
          // Update the course if both fields are provided
          await course.update(req.body);
          res.status(204).end();
        }
      } else {
        // Send a 403 error if the current user is not the owner of the course
        res.status(403).json({ message: 'Not authorized to update this course' });
      }
    } else {
      // Send a 404 error if the course is not found
      res.status(404).json({ message: 'Course not found' });
    }
  }))
  .delete(authenticateUser, asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      if (course.userId === req.currentUser.id) {
        // Delete the course if the current user is the owner
        await course.destroy();
        res.status(204).end();
      } else {
        // Send a 403 error if the current user is not the owner of the course
        res.status(403).json({ message: 'Not authorized to delete this course' });
      }
    } else {
      // Send a 404 error if the course is not found
      res.status(404).json({ message: 'Course not found' });
    }
  }));

module.exports = router;

