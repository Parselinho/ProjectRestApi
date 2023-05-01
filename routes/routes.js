'use strict';

const express = require('express');
const { User, Course } = require('../models');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth-user');
const { asyncHandler } = require('../middleware/async-handler');


router.use(express.json());


router.get('/users',authenticateUser, asyncHandler(async (req, res, next) => {
    try {
      const user = req.currentUser;
  
      if (user) {
        res.status(200).json(user);
      } else {
        // If the user is not authenticated, return a 401 status
        res.status(401).json({ message: 'Unauthorized' });
      }
    } catch (error) {
      next(error);
    }
  }));

  router.post('/users', asyncHandler(async (req, res, next) => {
    try {
      const newUser = await User.create(req.body);
  
      res.status(201).location('/').end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        next(error);
      }
    }
  }));
  
  // api/courses : 
  router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
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
  
  router.post('/courses', authenticateUser, asyncHandler(async (req, res, next) => {
    try {
      const newCourse = await Course.create({
        ...req.body,
        userId: req.currentUser.id
      });
      res.status(201).location(`/api/courses/${newCourse.id}`).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });
      } else {
        next(error);
      }
    }
  }));
  
  // api/courses/:id : 
  // GET /api/courses/:id - Get a specific course by ID including the associated User
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'emailAddress']
        }
      ]
    });

    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update route : 
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (course) {
      if (course.userId === req.currentUser.id) {
        await course.update(req.body);
        res.status(204).end();
      } else {
        res.status(403).json({ message: 'Not authorized to update this course' });
      }
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });
    } else {
      next(error);
    }
  }
}));

// DELETE /api/courses/:id - Delete a specific course by ID
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (course) {
      if (course.userId === req.currentUser.id) {
        await course.destroy();
        res.status(204).end();
      } else {
        res.status(403).json({ message: 'Not authorized to delete this course' });
      }
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    next(error);
  }
}));


module.exports = router;