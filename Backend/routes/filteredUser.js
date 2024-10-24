const express = require('express');
const filterRouter = express.Router();
const findMatch = require('../controllers/findMatch')

filterRouter.post('/findmatch',findMatch);
module.exports = filterRouter;