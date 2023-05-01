'use strict';

const auth = require('basic-auth');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Middleware to authenticate the request using Basic Authentication.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {Function} next - The function to call to pass execution to the next middleware.
 */
exports.authenticateUser = async (req, res, next) => {
  let message;

  // Parse the credentials from the Authorization header
  const credentials = auth(req);

  if (credentials) {
    // Find the user with the provided email address
    const user = await User.findOne({ where: {emailAddress: credentials.name} });
    if (user) {
      // Compare the password with the stored hash
      const authenticated = bcrypt.compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for user: ${user.emailAddress}`);
        // Store the authenticated user on the Request object
        req.currentUser = user;
      } else {
        message = `Authentication failure for user: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for email address: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }

  // If authentication fails, send a 401 response with an error message
  if (message) {
    console.warn(message);
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // If authentication succeeds, pass execution to the next middleware
    next();
  }
};
