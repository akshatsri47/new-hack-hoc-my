// routes/likeRoutes.js
const express = require('express');
const { likeUser } = require('../controllers/likeuser');
const router = express.Router();

module.exports = (io) => {
  // Use the io instance in the controller
  router.post('/like', likeUser(io));
  return router;
};
