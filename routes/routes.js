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
  
  

module.exports = router;